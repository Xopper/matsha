// user security

const router = require('express').Router();
const pool = require('../model/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
				if (err) return res.sendStatus(403);
				req.userNameConnected = user.userName;
			});
		}
	}
	next();
};

function getUserId(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `id` FROM `users` WHERE `user_name` = ?', [userName], (err, result) => {
				if (err) reject(err);
				else {
					if (result === undefined || result === [] || result.length === 0) {
						connection.release();
						resolve(false);
					} else {
						const queryResult = result[0].id;
						connection.release();
						resolve(queryResult);
					}
				}
			});
		});
	});
}

const getActualUserId = async (req, res, next) => {
	const userId = await getUserId(req.userNameConnected);
	req.userId = userId;
	next();
};

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

const ckeckUserActualPwd = async (req, res, next) => {
	const actualPwdErr = {};
	if (!req.body.oldPassword) {
		actualPwdErr.oldPassword = 'Password is required field.';
	} else if (
		!/(?=.{8,32})(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.*[a-z])(?=.*\d).*$/.test(
			req.body.oldPassword
		)
	) {
		actualPwdErr.oldPassword = 'Wrong password';
	} else if (req.body.oldPassword.length <= 8 || req.body.oldPassword.length > 32) {
		actualPwdErr.oldPassword = 'Wrong password.';
	}
	const actualPassword = await getUserPassword(req.userNameConnected);
	const validPassword = await bcrypt.compare(req.body.oldPassword, actualPassword);
	if (!validPassword) actualPwdErr.oldPassword = 'Wrong password.';
	req.actualPwdErr = actualPwdErr;
	next();
};

const checkChangedPwd = (req, res, next) => {
	const changedPwdErr = {};
	if (!req.body.newPassword) {
		changedPwdErr.newPassword = 'Password is required field.';
	} else if (
		!/(?=.{8,32})(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.*[a-z])(?=.*\d).*$/.test(
			req.body.newPassword
		)
	) {
		changedPwdErr.newPassword = 'Use [lower-Upper] case, special chars and numbers.';
	} else if (req.body.newPassword.length <= 8) {
		changedPwdErr.newPassword = 'Password must be at least 8 characters.';
	} else if (req.body.newPassword.length > 32) {
		changedPwdErr.newPassword = 'Password must be less than 32 characters.';
	}
	if (isEmpty(changedPwdErr)) {
		if (req.body.newPassword !== req.body.confNewPassword)
			changedPwdErr.confPwdErr = 'Confirm password does not match with the new password';
	}
	req.changedPwdErr = changedPwdErr;
	next();
};

function updatePwd(userId, newPwd) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('UPDATE `users` SET `password` = ? WHERE `id` = ?', [newPwd, userId], (err, result) => {
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

router.post('/editPwdValidator', authToken, getActualUserId, ckeckUserActualPwd, checkChangedPwd, async (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.actualPwdErr)) {
		backEndResponse.errors = req.actualPwdErr;
		backEndResponse.status = 1;
	} else if (!isEmpty(req.changedPwdErr)) {
		backEndResponse.errors = req.changedPwdErr;
		backEndResponse.status = 1;
	} else {
		const salt = bcrypt.genSaltSync();
		req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt);
		const pwdUpdated = await updatePwd(req.userId, req.body.newPassword);
		backEndResponse.status = 0;
	}
	res.send(backEndResponse);
});

module.exports = router;
