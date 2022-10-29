const router = require('express').Router();
const pool = require('../model/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../model/dbConnection');

const isEmpty = obj => {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
};

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

function getUserPassword(userName) {
	return new Promise((res, rej) => {
		pool.getConnection((err, connection) => {
			if (err) rej(err);
			connection.execute('SELECT `password` FROM `users` WHERE `user_name` = ?', [userName], (err, result) => {
				if (err) rej(err);
				else {
					const queryResult = result[0].password;
					connection.release();
					res(queryResult);
				}
			});
		});
	});
}

function checkIfVerifiedAccount(userName) {
	return new Promise((res, rej) => {
		pool.getConnection((err, connection) => {
			if (err) rej(err);
			connection.execute('SELECT `verified` FROM `users` WHERE `user_name` = ?', [userName], (err, result) => {
				if (err) rej(err);
				else {
					const queryResult = result[0].verified;
					connection.release();
					res(queryResult);
				}
			});
		});
	});
}

function getUserAuthenticationToken(userName) {
	return new Promise((res, rej) => {
		pool.getConnection((err, connection) => {
			if (err) rej(err);
			connection.execute(
				'SELECT `authentication_token` FROM `users` WHERE `user_name` = ?',
				[userName],
				(err, result) => {
					if (err) rej(err);
					else {
						const queryResult = result[0].authentication_token;
						connection.release();
						res(queryResult);
					}
				}
			);
		});
	});
}

function dataProfileIsComplited(userName) {
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

const checkLoginInputs = values => {
	let errors = {};

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
	// ba9a unique f database [men l backEnd]

	// TODO {insert valid reg expression} [Done]
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

const validateLoginData = async (req, res, next) => {
	try {
		const loginInputData = req.body;
		loginInputData.username = loginInputData.username.trim();

		const loginErrors = {};
		const userNameExists = await userNameFound(loginInputData.username);
		const checkerResult = checkLoginInputs(loginInputData);
		if (!isEmpty(checkerResult)) {
			req.loginErrors = checkerResult;
			next();
		} else {
			if (userNameExists === 0) {
				loginErrors.userNameOrPasswordError = 'User Name or Password is wrong';
				req.loginErrors = loginErrors;
				next();
			} else if (userNameExists === 1) {
				const userpassword = await getUserPassword(loginInputData.username);
				const validPassword = await bcrypt.compare(loginInputData.password, userpassword);
				if (!validPassword) {
					loginErrors.userNameOrPasswordError = 'User Name or Password is wrong';
					req.loginErrors = loginErrors;
					next();
				} else if (validPassword) {
					const verifiedAccount = await checkIfVerifiedAccount(loginInputData.username);
					if (verifiedAccount === 0) {
						loginErrors.userNameOrPasswordError =
							'Verify your account via the link sent to your registration email';
						req.loginErrors = loginErrors;
						next();
					} else if (verifiedAccount === 1) {
						// get the auth token from the database
						const authenticationToken = await getUserAuthenticationToken(loginInputData.username);
						req.authenticationToken = authenticationToken;
						const userName = loginInputData.username;
						req.userName = userName;
						//get if the profile data is complited
						const dataProfileComplited = await dataProfileIsComplited(loginInputData.username);
						req.dataprofileIsComplited = dataProfileComplited;
						next();
					}
				}
			}
		}
	} catch (e) {
		const zabi = 'Nice Try';
		res.send(zabi);
	}
};
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
function getUserLocalisation(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT `latitude`, `longitude` FROM `users` WHERE `user_name` = ?',
				[userName],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = {};
						queryResult.latitude = result[0].latitude;
						queryResult.longitude = result[0].longitude;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
function checkIfAccountComplited(userName) {
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
function getUserTagsId(userId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT tags.tags FROM users_tags JOIN tags ON users_tags.tag_id = tags.id WHERE users_tags.user_id = ?',
				[userId],
				(err, result) => {
					if (err) reject(err);
					else {
						console.log('bamboucha : ', result);
						const queryResult = result.map(tag => {
							return tag.tags;
						});
						resolve(queryResult);
						connection.release();
					}
				}
			);
		});
	});
}
const getLocalisationAndTags = async (req, res, next) => {
	if (!isEmpty(req.checkError)) next();
	else if (!isEmpty(req.loginErrors)) next();
	else {
		const data = {};
		const complited = await checkIfAccountComplited(req.userName);
		data.complited = complited;
		if (complited === 1) {
			const localisation = await getUserLocalisation(req.userName);
			data.localisation = localisation;
			console.log('localisation :: ', localisation);
			const userId = await getUserId(req.userName);
			req.userId = userId;
			console.log(userId);
			const userTags = await getUserTagsId(userId);
			console.log(userTags);
			data.userTags = userTags;
			req.userData = data;
		} else {
			req.userData = data;
		}
		next();
	}
};

router.post('/validate/login', validateLoginData, getLocalisationAndTags, (req, res) => {
	const msgFromBackEnd = {};

	if (!isEmpty(req.checkError)) {
		msgFromBackEnd.errors = req.checkError;
		msgFromBackEnd.status = 1;
		res.send(msgFromBackEnd);
	} else if (!isEmpty(req.loginErrors)) {
		console.log(req.loginErrors);
		msgFromBackEnd.errors = req.loginErrors;
		msgFromBackEnd.status = 1;
		res.send(msgFromBackEnd);
	} else {
		msgFromBackEnd.authToken = req.authenticationToken;
		msgFromBackEnd.userName = req.userName;
		msgFromBackEnd.userid = req.userId;
		// send if the dataProfile is complited or not
		msgFromBackEnd.dataProfileIsComplited = req.dataprofileIsComplited;
		msgFromBackEnd.localisationAndTags = req.userData;
		msgFromBackEnd.status = 0;
		res.send(msgFromBackEnd);
	}
});

module.exports = router;
