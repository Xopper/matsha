const router = require('express').Router();
const pool = require('../model/dbConnection');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const isEmpty = obj => {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
};
const authToken = (req, res, next) => {
	if (req.headers.authorization) {
		const authKey = req.headers.authorization.split(' ')[1];
		if (authKey) {
			const authKey = req.headers.authorization.split(' ')[1];
			jwt.verify(authKey, 'boul3al7ayat7obilanamnghirakma3ichach7obi00', (err, user) => {
				if (err) return res.status(403).send('Token Error !');
				else {
					req.userNameConnected = user.userName;
					req.authToken = authKey;
					next();
				}
			});
		}
	}
};

function sendEmail(mailSettings, mailTransporter) {
	return new Promise((res, rej) => {
		mailTransporter.sendMail(mailSettings, (err, info) => {
			if (err) rej(err);
			res(info.response);
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
        <a href="http://localhost:3000/auth/confirm/${token}">Click to validate your New Email</a>`
	};
	try {
		const emailSent = await sendEmail(mailOptions, transporter);
		console.log('email sent: ', emailSent);
	} catch (err) {
		console.log(err);
	}
};

function isValidDate(str) {
	// STRING FORMAT yyyy-mm-dd
	if (str == '' || str == null) {
		return false;
	}
	// m[1] is year 'YYYY' * m[2] is month 'MM' * m[3] is day 'DD'
	var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
	// STR IS NOT FIT m IS NOT OBJECT
	if (m === null || typeof m !== 'object') {
		return false;
	}
	// CHECK m TYPE
	if (typeof m !== 'object' && m !== null && m.size !== 3) {
		return false;
	}
	var ret = true; //RETURN VALUE
	var thisYear = new Date().getFullYear(); //YEAR NOW
	var minYear = 1900; //MIN YEAR
	// YEAR CHECK
	if (m[1].length < 4 || m[1] < minYear || m[1] > thisYear) {
		ret = false;
	}
	// MONTH CHECK
	if (m[2].length < 2 || m[2] < 1 || m[2] > 12) {
		ret = false;
	}
	// DAY CHECK
	if (m[3].length < 2 || m[3] < 1 || m[3] > 31) {
		ret = false;
	}
	return ret;
}
const trimValues = (req, res, next) => {
	const values = {};
	values.userName = req.body.username.trim();
	values.firstName = req.body.firstName.trim();
	values.lastName = req.body.lastName.trim();
	values.email = req.body.email.trim();
	values.biography = req.body.biography.trim();
	values.birthDay = req.body.birthDay.trim();
	values.country = req.body.country.trim();
	values.lat = req.body.lat;
	values.lng = req.body.lng;
	req.values = values;
	next();
};
const primaryValidation = (req, res, next) => {
	const errors = {};
	const values = req.values;
	if (!values.email || values.email === '') {
		errors.email = 'Email address is required field.';
	} else if (!/^([a-zA-Z._0-9-]+)@([a-zA-Z0-9]+[.]?)*([a-zA-Z0-9])(\.[a-zA-Z]{2,4})$/.test(values.email)) {
		errors.email = 'Email address is not valid.';
	}
	if (!values.userName || values.userName === '') {
		errors.userName = 'Username is required field.';
	} else if (!/^\w+$/.test(values.userName)) {
		errors.userName = 'Use only Alpha numeric characters.';
	} else if (values.userName.length < 3) {
		errors.userName = 'Username must be at least 4 characters.';
	} else if (values.userName.length > 12) {
		errors.userName = 'Username must be less than 13 characters.';
	}
	if (!values.firstName || values.firstName === '') {
		errors.firstName = 'First name is required field.';
	} else if (!/^([a-zA-Z ])+$/.test(values.firstName)) {
		errors.firstName = 'Use only alphabetic characters.';
	} else if (values.firstName.length < 3) {
		errors.firstName = 'First name must be at least 4 characters.';
	} else if (values.firstName.length > 12) {
		errors.firstName = 'First name must be less than 13 characters.';
	}
	if (!values.lastName || values.lastName === '') {
		errors.lastName = 'Last name is required field.';
	} else if (!/^([a-zA-Z ])+$/.test(values.lastName)) {
		errors.lastName = 'Use only alphabetic characters.';
	} else if (values.lastName.length < 3) {
		errors.lastName = 'Last name must be at least 4 characters.';
	} else if (values.lastName.length > 12) {
		errors.lastName = 'Last name must be less than 13 characters.';
	}
	if (!isValidDate(values.birthDay)) errors.birthDay = 'Invalid Date of birth, you should have 18 YO.';

	if (values.biography === '' || !values.biography) errors.biography = 'Biography is required';
	else if (!/^[a-zA-Z\s.]+$/.test(values.biography)) errors.biography = 'Use only Alpha numeric characters.';
	else if (values.biography.length < 8 || values.biography.length > 500)
		errors.biography = 'Biography field length can be only between 8 and 500 characters';

	if (
		typeof values.lat === 'string' ||
		typeof values.lng === 'string' ||
		values.lat === null ||
		values.lat === null ||
		values.lng === null ||
		values.lng === null
	)
		errors.locationErr = 'Not a valid location';
	else if (values.lat < -90.0 || values.lat > 90.0 || values.lng < -180.0 || values.lng > 180.0)
		errors.locationErr = 'Not a valid location';
	req.primaryErrors = errors;
	next();
};

function checkIfUserExists(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `userExist` FROM `users` WHERE `user_name` = ?',
				[userName],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].userExist;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
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
function getUserAllActualUser(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT `id`, `first_name`, `last_name`,  `email`, `token`, `authentication_token`, `birthdate`, `biography`, `latitude`, `longitude`, `country`  FROM `users` WHERE `user_name` = ?',
				[userName],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0];
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
const getActualInfos = async (req, res, next) => {
	const actualUserName = req.userNameConnected;
	const actualUserInfos = {};
	const errors = {};
	if (!isEmpty(req.primaryErrors)) {
		next();
	} else {
		const userExists = await checkIfUserExists(actualUserName);
		if (userExists === 1) {
			// const actualEmail = await getUserEmail(actualUserName);
			const allActualUserInfos = await getUserAllActualUser(actualUserName);
			// console.log('???? ', allActualUserInfos);
			actualUserInfos.userId = allActualUserInfos.id;
			actualUserInfos.userName = actualUserName;
			actualUserInfos.firstName = allActualUserInfos.first_name;
			actualUserInfos.lastName = allActualUserInfos.last_name;
			actualUserInfos.email = allActualUserInfos.email;
			actualUserInfos.token = allActualUserInfos.token;
			actualUserInfos.authentication_token = allActualUserInfos.authentication_token;
			actualUserInfos.birthdate = allActualUserInfos.birthdate;
			actualUserInfos.biography = allActualUserInfos.biography;
			actualUserInfos.latitude = allActualUserInfos.latitude;
			actualUserInfos.longitude = allActualUserInfos.longitude;
			actualUserInfos.country = allActualUserInfos.country;
		} else {
			errors.userExists = 'actual User has a problem';
		}
	}
	req.actualUserInfosErrors = errors;
	req.actualUserInfos = actualUserInfos;
	next();
};
function updateTheData(userId, values) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'UPDATE `users` SET `user_name` = ?, `first_name`= ?,`last_name` = ?, `email`= ?, `birthdate` = ?, `biography`= ?, `token` = ?, `authentication_token`= ?, `verified` = ?, `latitude` = ? , `longitude` = ?, `country` = ? WHERE `id` = ?',
				[
					values.userName,
					values.firstName,
					values.lastName,
					values.email,
					values.birthDay,
					values.biography,
					values.token,
					values.authentication_token,
					values.verified,
					values.latitude,
					values.longitude,
					values.country,
					userId
				],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result;
						connection.release();
						resolve(result);
					}
				}
			);
		});
	});
}
function getAuthToken(userId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT `authentication_token`  FROM `users` WHERE `id` = ?',
				[userId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].authentication_token;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
const updateUserInfos = async (req, res, next) => {
	console.log('req.primaryErrors', req.primaryErrors);
	console.log('req.actualUserInfosErrors', req.actualUserInfosErrors);
	console.log('req.actualUserInfos', req.actualUserInfos);
	console.log('req.values', req.values);
	const errors = {};
	const dataToUpdate = {};
	if (!isEmpty(req.primaryErrors) || !isEmpty(req.actualUserInfosErrors)) {
		next();
	} else {
		dataToUpdate.userName = req.actualUserInfos.userName;
		dataToUpdate.firstName = req.values.firstName;
		dataToUpdate.lastName = req.values.lastName;
		dataToUpdate.email = req.actualUserInfos.email;
		dataToUpdate.verified = 1;
		dataToUpdate.token = req.actualUserInfos.token;
		dataToUpdate.authentication_token = req.actualUserInfos.authentication_token;
		dataToUpdate.birthDay = req.values.birthDay;
		dataToUpdate.biography = req.values.biography;
		dataToUpdate.latitude = req.values.lat;
		dataToUpdate.longitude = req.values.lng;
		dataToUpdate.country = req.values.country;
		console.log('dataToUpdate', dataToUpdate);
		if (req.actualUserInfos.userName !== req.values.userName) {
			const newUserNameAlreadyExists = await checkIfUserExists(req.values.userName);
			if (newUserNameAlreadyExists === 1) {
				errors.newUserNameAlreadyExists = 'Username already exists.';
			} else {
				newAuthToken = jwt.sign(
					{ userName: req.values.userName },
					'boul3al7ayat7obilanamnghirakma3ichach7obi00'
				);
				dataToUpdate.userName = req.values.userName;
				dataToUpdate.authentication_token = newAuthToken;
			}
		}
		if (req.actualUserInfos.email !== req.values.email) {
			const newEmailAlreadyExists = await checkIfEmailExists(req.values.email);
			if (newEmailAlreadyExists === 1) {
				errors.newEmailAlreadyExists = 'Email already exists.';
			} else {
				if (!isEmpty(errors)) {
					newValidationToken = jwt.sign(
						{ userName: req.actualUserInfos.userName },
						'mafhamnachwalakinma3lichlhalwassaoulfanid04'
					);
					dataToUpdate.email = req.values.email;
					dataToUpdate.token = newValidationToken;
					dataToUpdate.verified = 0;
					sendEmailValidation(dataToUpdate.email, dataToUpdate.token);
				} else {
					newValidationToken = jwt.sign(
						{ userName: req.values.userName },
						'mafhamnachwalakinma3lichlhalwassaoulfanid04'
					);
					dataToUpdate.email = req.values.email;
					dataToUpdate.token = newValidationToken;
					dataToUpdate.verified = 0;
					sendEmailValidation(dataToUpdate.email, dataToUpdate.token);
				}
			}
		}
		if (!isEmpty(errors)) {
			req.finalErrors = errors;
			next();
		} else {
			req.userName = dataToUpdate.userName;
			const dataUpdatedResult = await updateTheData(req.actualUserInfos.userId, dataToUpdate);
			const theAuthToken = await getAuthToken(req.actualUserInfos.userId);
			req.theAuthToken = theAuthToken;
			console.log('dataUpdatedResult', dataUpdatedResult);
		}
		next();
	}
};

const bridge = (req, res, next) => {
	const { firstName, lastName, username, email, birthDay, biography, lat, lng, country } = req.body;
	const errors = {};

	if (
		typeof firstName === 'undefined' ||
		!firstName ||
		typeof lastName === 'undefined' ||
		!lastName ||
		typeof username === 'undefined' ||
		!username ||
		typeof email === 'undefined' ||
		!email ||
		typeof birthDay === 'undefined' ||
		!birthDay ||
		typeof biography === 'undefined' ||
		!biography ||
		typeof lat === 'undefined' ||
		!lat ||
		typeof lng === 'undefined' ||
		!lng ||
		typeof country === 'undefined' ||
		!country
	) {
		errors.bridge = 'Something is missing';
		return res.status(404).send(errors.bridge);
	} else {
		next();
	}
};
function getUpdatedUserLocation(userName) {
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
const getUserLocation = async (req, res, next) => {
	if (!isEmpty(req.bridgeErr)) {
		next();
	} else if (!isEmpty(req.primaryErrors)) {
		next();
	} else if (!isEmpty(req.actualUserInfosErrors)) {
		next();
	} else if (!isEmpty(req.finalErrors)) {
		next();
	} else {
		const localisation = await getUpdatedUserLocation(req.userName);
		req.localisation = localisation;
		next();
	}
};

router.post(
	'/infoValidator',
	authToken,
	bridge,
	trimValues,
	primaryValidation,
	getActualInfos,
	updateUserInfos,
	getUserLocation,
	(req, res) => {
		const backEndResponse = {};
		if (!isEmpty(req.bridgeErr)) {
			backEndResponse.errors = req.bridgeErr;
			backEndResponse.status = 1;
			res.send(backEndResponse);
		} else if (!isEmpty(req.primaryErrors)) {
			backEndResponse.errors = req.primaryErrors;
			backEndResponse.status = 1;
			res.send(backEndResponse);
		} else if (!isEmpty(req.actualUserInfosErrors)) {
			backEndResponse.errors = req.actualUserInfosErrors;
			backEndResponse.status = 1;
			res.send(backEndResponse);
		} else if (!isEmpty(req.finalErrors)) {
			backEndResponse.errors = req.finalErrors;
			backEndResponse.status = 1;
			res.send(backEndResponse);
		} else {
			backEndResponse.newAuthToken = req.theAuthToken;
			backEndResponse.userName = req.userName;
			backEndResponse.localisation = req.localisation;
			backEndResponse.status = 0;
			res.send(backEndResponse);
		}
	}
);
module.exports = router;
