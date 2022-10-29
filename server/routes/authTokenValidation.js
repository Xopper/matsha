const router = require('express').Router();
const jwt = require('jsonwebtoken');
const pool = require('../model/dbConnection');
const isEmpty = obj => {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
};
const validateAuthToken = (req, res, next) => {
	const errors = {};
	if (req.body.authToken) {
		jwt.verify(req.body.authToken, 'boul3al7ayat7obilanamnghirakma3ichach7obi00', (err, user) => {
			if (err) {
				errors.authKey = 'The token is not valid';
				req.authKeyError = errors;
			} else req.userName = user.userName;
		});
	}
	next();
};
function checkIfUserExists(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `exists` FROM `users` WHERE `user_name` = ?',
				[userName],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].exists;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
function checkAccountIfComplited(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `complited` FROM `users` WHERE `user_name` = ?', [userName], (err, result) => {
				if (err) reject(err);
				else {
					const queryResult = result[0].complited;
					connection.release();
					resolve(queryResult);
				}
			});
		});
	});
}

function getUserId(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `id` FROM `users` WHERE `user_name` = ?', [userName], (err, result) => {
				if (err) reject(err);
				else {
					const queryResult = result[0].id;
					connection.release();
					resolve(queryResult);
				}
			});
		});
	});
}

const checkIfComplited = async (req, res, next) => {
	const errors = {};
	if (!isEmpty(req.authKeyError)) {
		next();
	} else {
		const userExists = await checkIfUserExists(req.userName);
		if (userExists === 1) {
			const userId = await getUserId(req.userName);
			req.userId = userId;
			const complited = await checkAccountIfComplited(req.userName);
			req.complited = complited;
		} else {
			errors.userName = 'user does not exists';
			req.userError = errors;
		}
		next();
	}
	next();
};

router.post('/authTokenValidation', validateAuthToken, checkIfComplited, (req, res) => {
	const backEndResponde = {};
	if (!isEmpty(req.authKeyError)) {
		backEndResponde.errors = req.authKeyError;
		backEndResponde.status = 1;
	} else if (!isEmpty(req.userError)) {
		backEndResponde.errors = req.userError;
		backEndResponde.status = 1;
	} else {
		backEndResponde.complited = req.complited;
		backEndResponde.userName = req.userName;
		backEndResponde.userId = req.userId;
		backEndResponde.status = 0;
	}
	res.send(backEndResponde);
});
module.exports = router;
