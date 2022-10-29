const router = require('express').Router();
const pool = require('../model/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const isEmpty = obj => {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
};

function emailFound(email) {
	return new Promise((res, rej) => {
		pool.getConnection((err, connection) => {
			if (err) rej(err);
			else {
				connection.execute(
					'SELECT COUNT(*) as count FROM `users` WHERE `email` = ?',
					[email],
					(err, result) => {
						if (err) rej(err);
						else {
							const queryResult = result[0].count;
							connection.release();
							res(queryResult);
						}
					}
				);
			}
		});
	});
}

function userNameFound(userName) {
	return new Promise((res, rej) => {
		pool.getConnection((err, connection) => {
			if (err) rej(err);
			else {
				connection.execute(
					'SELECT COUNT(*) as count FROM `users` WHERE `user_name` = ?',
					[userName],
					(err, result) => {
						if (err) rej(err);
						else {
							const queryResult = result[0].count;
							connection.release();
							res(queryResult);
						}
					}
				);
			}
		});
	});
}

// function registerUser(userData){
//     return new Promise((res, rej)=>{
//         pool.getConnection((err, connection) =>{
//             if (err)
//                 rej(err)
//             else{
//                 connection.execute('INSERT INTO `users_table`(`user_name`,`first_name`,`last_name`,`email`, `password`, `token`, `biography`) VALUES(?, ?, ?, ?, ?, ?, ?)', [userData.username, userData.firstName, userData.lastName, userData.email, userData.password, userData.token, ''], (err, result)=>{
//                     if (err)
//                         rej(err)
//                     else{
//                         const queryResult = result
//                         connection.release()
//                         res(queryResult)
//                     }
//                 })
//             }
//         })
//     })
// }
function registerUser(userData) {
	return new Promise((res, rej) => {
		pool.getConnection((err, connection) => {
			if (err) rej(err);
			else {
				connection.execute(
					'INSERT INTO `users`(`user_name`,`first_name`,`last_name`,`email`, `password`, `token`, `authentication_token`,`biography`, `profile_img`, `img_one`, `img_two`, `img_three`, `img_four`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
					[
						userData.username,
						userData.firstName,
						userData.lastName,
						userData.email,
						userData.password,
						userData.token,
						userData.authToken,
						'',
						'',
						'',
						'',
						'',
						''
					],
					(err, result) => {
						if (err) rej(err);
						else {
							const queryResult = result;
							connection.release();
							res(queryResult);
						}
					}
				);
			}
		});
	});
}

const checkRegistrationInputs = values => {
	const errors = {};

	// validating Email
	if (!values.email || values.email.trim() === '') {
		errors.email = 'Email address is required field.';
	} else if (!/^([a-zA-Z._0-9-]+)@([a-zA-Z0-9]+[.]?)*([a-zA-Z0-9])(\.[a-zA-Z]{2,4})$/.test(values.email)) {
		errors.email = 'Email address is not valid.';
	}

	// validating username
	if (!values.username || values.username.trim() === '') {
		errors.username = 'Username is required field.';
	} else if (!/^\w+$/.test(values.username)) {
		errors.username = 'Use only Alpha numeric characters.';
	} else if (values.username.length < 3) {
		errors.username = 'Username must be at least 4 characters.';
	} else if (values.username.length > 12) {
		errors.username = 'Username must be less than 13 characters.';
	}

	// validate first Name
	if (!values.firstName || values.firstName.trim() === '') {
		errors.firstName = 'First name is required field.';
	} else if (!/^([a-zA-Z ])+$/.test(values.firstName)) {
		errors.firstName = 'Use only alphabetic characters.';
	} else if (values.firstName.length < 3) {
		errors.firstName = 'First name must be at least 4 characters.';
	} else if (values.firstName.length > 12) {
		errors.firstName = 'First name must be less than 13 characters.';
	}

	// validate Last name
	if (!values.lastName || values.lastName.trim() === '') {
		errors.lastName = 'Last name is required field.';
	} else if (!/^([a-zA-Z ])+$/.test(values.lastName)) {
		errors.lastName = 'Use only alphabetic characters.';
	} else if (values.lastName.length < 3) {
		errors.lastName = 'Last name must be at least 4 characters.';
	} else if (values.lastName.length > 12) {
		errors.lastName = 'Last name must be less than 13 characters.';
	}

	// TODO {insert valid reg expression} [done]
	// validate Password
	if (!values.password) {
		errors.password = 'Password is required field.';
	} else if (
		!/(?=.{8,32})(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.*[a-z])(?=.*\d).*$/.test(values.password)
	) {
		errors.password = 'Use [lower-Upper] case, special chars and numbers.';
	} else if (values.password.length <= 8) {
		errors.password = 'Password must be at least 8 characters.';
	} else if (values.password.length > 32) {
		errors.password = 'Password must be less than 32 characters.';
	}
	return errors;
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
		subject: 'Confirm your email',
		text: 'Easy Work',
		html: `<h1>Email confirmattion</h1>
        <p>Confrim your email by clicking the link bellow</p>
        <a href="http://localhost:3000/auth/confirm/${token}">Click to validate your registration</a>`
	};
	try {
		const emailSent = await sendEmail(mailOptions, transporter);
		console.log('email sent: ', emailSent);
	} catch (err) {
		console.log(err);
	}
};

const checkRegistrationData = async (req, res, next) => {
	try {
		const registerInputData = req.body;
		console.log(registerInputData)
		const regErrors = {};

		// check for the email and userName if exist
		const checkerResult = checkRegistrationInputs(registerInputData);
		// const resultEmail = await emailFound(registerInputData.email);
		// const resultUserName = await userNameFound(registerInputData.username);

		// send data to be checked

		if (isEmpty(checkerResult)) {
			// send the valid data
			// trim all values
			const resultEmail = await emailFound(registerInputData.email);
			const resultUserName = await userNameFound(registerInputData.username);
			if (resultEmail === 0 && resultUserName === 0) {
				registerInputData.username = registerInputData.username.trim();
				registerInputData.firstName = registerInputData.firstName.trim();
				registerInputData.lastName = registerInputData.lastName.trim();
				registerInputData.email = registerInputData.email.trim();
				// hash password
				const salt = bcrypt.genSaltSync();
				registerInputData.password = bcrypt.hashSync(registerInputData.password, salt);
				// registerInputData.password = validatedData.passwordHashed
				// generate a jwt token for email validation
				const validationToken = jwt.sign(
					{ userName: registerInputData.username },
					'mafhamnachwalakinma3lichlhalwassaoulfanid04'
				);
				registerInputData.token = validationToken;
				//generate authentication jwt token
				const authenticationToken = jwt.sign(
					{ userName: registerInputData.username },
					'boul3al7ayat7obilanamnghirakma3ichach7obi00'
				);
				registerInputData.authToken = authenticationToken;

				// register user
				const registerUserResult = await registerUser(registerInputData);
				console.log(registerUserResult);
				if (registerUserResult.insertId) {
					//send email
					sendEmailValidation(registerInputData.email, registerInputData.token);
				}
				req.registrationErrors = regErrors;
				next();
			} else {
				if (resultEmail === 1) regErrors.email = 'Email already exists';
				if (resultUserName === 1) regErrors.username = 'User Name already exists';
				req.registrationErrors = regErrors;
				next();
			}
		} else {
			req.registrationErrors = checkerResult;
			next();
		}
	} catch (e) {
		console.log(e)
		res.send('Idkom fih');
	}
};

router.post('/validate/register', checkRegistrationData, (req, res) => {
	console.log('<<registration errors>>', req.registrationErrors);
	const msgFromBackEnd = {};
	if (!isEmpty(req.registrationErrors)) {
		msgFromBackEnd.errors = req.registrationErrors;
		msgFromBackEnd.status = 1;
		res.send(msgFromBackEnd);
	} else {
		msgFromBackEnd.status = 0;
		res.send(msgFromBackEnd);
	}
});

module.exports = router;
