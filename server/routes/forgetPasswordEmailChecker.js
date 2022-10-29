const router = require('express').Router();
const pool = require('../model/dbConnection');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const isEmpty = obj => {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
};
function sendEmail(mailSettings, mailTransporter) {
	return new Promise((res, rej) => {
		mailTransporter.sendMail(mailSettings, (err, info) => {
			if (err) rej(err);
			console.log(info)
			res(info);
		});
	});
}
const sendEmailValidation = async (email, token) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'hamzaiantrin1999@gmail.com',
			pass: 'ubbgvldzezlvljeo'
		}
	});
	const mailOptions = {
		from: 'hamzaiantrin1999@gmail.com',
		to: email,
		subject: 'Reset your password',
		text: 'Easy Work',
		html: `<h1>Reset your password</h1>
        <p>Reset your password by clicking the link bellow</p>
        <a href="http://localhost:3000/resetPassword/reset/${token}">Click to reset your password</a>`
	};
	try {
		const emailSent = await sendEmail(mailOptions, transporter);
		console.log('email sent: ', emailSent);
	} catch (err) {
		console.log(err);
	}
};
function checkIfEmailExists(email) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `emailExists` FROM `users` WHERE `email` = ?',
				[email],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].emailExists;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
function checkifValidated(email) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `verified` FROM `users` WHERE `email` = ?', [email], (err, result) => {
				if (err) reject(err);
				else {
					const queryResult = result[0].verified;
					connection.release();
					resolve(queryResult);
				}
			});
		});
	});
}
function getUserName(email) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `user_name` FROM `users` WHERE `email` = ?', [email], (err, result) => {
				if (err) reject(err);
				else {
					const queryResult = result[0].user_name;
					connection.release();
					resolve(queryResult);
				}
			});
		});
	});
}
// UPDATE `users` SET `user_name` = ?, `first_name`= ?,`last_name` = ?, `email`= ?, `birthdate` = ?, `biography`= ?, `token` = ?, `authentication_token`= ?, `verified` = ? WHERE `id` = ?'
function updateToken(email, token) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('UPDATE `users` SET `token` = ? WHERE `email` = ?', [token, email], (err, result) => {
				if (err) reject(err);
				else {
					const queryResult = result;
					connection.release();
					resolve(queryResult);
				}
			});
		});
	});
}
const checkIfUserExists = async (req, res, next) => {
	const errors = {};
	const { email } = req.body;
	if (email === '' || email === undefined || email.trim() == '') {
		errors.email = 'Enter a valid email.';
		req.primaryErr = errors;
		next();
	} else {
		const userExits = await checkIfEmailExists(email);
		if (userExits === 0) {
			errors.email = 'Email does not exist.';
			req.primaryErr = errors;
			next();
		} else if (userExits === 1) {
			const validated = await checkifValidated(email);
			if (validated === 0) {
				errors.email = 'Validate your account first.';
				req.primaryErr = errors;
				next();
			} else {
				const userName = await getUserName(email);
				req.userName = userName;
				next();
			}
		}
	}
	next();
};
const sendResetPwdEmail = async (req, res, next) => {
	if (!isEmpty(req.primaryErr)) {
		next();
	} else {
		const validationToken = jwt.sign({ userName: req.userName }, 'mafhamnachwalakinma3lichlhalwassaoulfanid04');
		const tokenUpdated = await updateToken(req.body.email, validationToken);
		sendEmailValidation(req.body.email, validationToken);
	}
	next();
};
router.post('/emailchecker', checkIfUserExists, sendResetPwdEmail, (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.primaryErr)) {
		backEndResponse.errors = req.primaryErr;
		backEndResponse.status = 1;
		res.send(backEndResponse);
	} else {
		backEndResponse.status = 0;
		res.send(backEndResponse);
	}
});
module.exports = router;
