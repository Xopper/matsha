const router = require('express').Router();
const pool = require('../model/dbConnection');
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
function searchUser(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `count` FROM `users` WHERE `user_name` = ?',
				[userName],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].count;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

const checkIfUserExists = async (req, res, next) => {
	const userNotFound = {};
	const userFound = await searchUser(req.userNameConnected);
	if (userFound === 0) userNotFound.error = `No user found with ${req.userNameConnected} user name`;
	req.userNotFound = userNotFound.error;
	next();
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

function getUserLocation(userName) {
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

function getUserTags(userId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT tags.tags FROM users_tags JOIN tags ON users_tags.tag_id = tags.id WHERE users_tags.user_id = ?',
				[userId],
				(err, result) => {
					if (err) reject(err);
					else {
						// console.log('bamboucha : ', result);
						const queryResult = result.map(tag => {
							return tag.tags;
						});
						// console.log('queryResult : ', queryResult);
						resolve(queryResult);
						connection.release();
					}
				}
			);
		});
	});
}

const getBrowseData = async (req, res, next) => {
	if (!isEmpty(req.userNotFound)) next();
	else {
		const userId = await getUserId(req.userNameConnected);
		const localisation = await getUserLocation(req.userNameConnected);
		req.localisation = localisation;
		const tags = await getUserTags(userId);
		req.tags = tags;
		next();
	}
};

router.get('/getBrowseLogedData', authToken, checkIfUserExists, getBrowseData, (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.userNotFound)) {
		backEndResponse.errors = req.userNotFound;
		backEndResponse.status = 1;
	} else {
		backEndResponse.localisation = req.localisation;
		backEndResponse.tags = req.tags;
		backEndResponse.status = 0;
	}
	res.send(backEndResponse);
});

module.exports = router;
