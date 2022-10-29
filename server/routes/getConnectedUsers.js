const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../model/dbConnection');

const authToken = (req, res, next) => {
	if (req.headers.authorization) {
		const authKey = req.headers.authorization.split(' ')[1];
		if (authKey) {
			const authKey = req.headers.authorization.split(' ')[1];
			// console.log('wa l3adaab : ', authKey);
			jwt.verify(authKey, 'boul3al7ayat7obilanamnghirakma3ichach7obi00', (err, user) => {
				if (err) return res.status(403).send('Token Error');
				else {
					req.userNameConnected = user.userName;
					next();
				}
			});
		}
	}
};

function getActualUserId(userName) {
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

const getUserId = async (req, res, next) => {
	req.userId = await getActualUserId(req.userNameConnected);
	next();
};

function getConnectedUsers(userId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT users.user_name, users.id, users.profile_img FROM connected_users JOIN users on (connected_users.user_one = users.id OR connected_users.user_two = users.id ) WHERE (connected_users.user_one = ? OR connected_users.user_two = ?) AND users.id <> ?',
				[userId, userId, userId],
				(err, result) => {
					if (err) reject(err);
					else {
						if (result.length > 0) {
							const queryResult = result;
							connection.release();
							resolve(queryResult);
						} else {
							const queryResult = 'No matched Users';
							connection.release();
							resolve(queryResult);
						}
					}
				}
			);
		});
	});
}

const getConnectedUsersMLW = async (req, res, next) => {
	req.usersConnected = await getConnectedUsers(req.userId);
	next();
};

router.get('/', authToken, getUserId, getConnectedUsersMLW, (req, res) => {
	const backEndResponse = {};
	backEndResponse.connectedUsers = req.usersConnected;
	backEndResponse.status = 0;
	res.send(backEndResponse);
});

module.exports = router;
