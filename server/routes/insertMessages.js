const router = require('express').Router();
const jwt = require('jsonwebtoken');
const pool = require('../model/dbConnection');
const { query } = require('../model/dbConnection');

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

function usersAreConnected(senderId, receiverId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `matched` FROM `connected_users` WHERE (`user_one` = ? AND `user_two` = ?) OR (`user_one` = ? AND `user_two` = ?)',
				[senderId, receiverId, receiverId, senderId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].matched;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

const bridge = (req, res, next) => {
	const errors = {};
	if (
		typeof req.body.receiver === 'undefined' ||
		!req.body.receiver ||
		typeof req.body.message === 'undefined' ||
		!req.body.message
	)
		errors.error = 'Unexpected parametters.';
	req.bridgeErrors = errors;
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

const connectionChecker = async (req, res, next) => {
	const errors = {};
	if (!isEmpty(req.bridgeErrors)) next();
	else {
		const userId = await getUserId(req.userNameConnected);
		req.userId = userId;
		const connected = await usersAreConnected(userId, req.body.receiver);
		if (connected === 0) {
			errors.matching = 'Users Are not connected';
			req.connectionErrors = errors;
		}
		next();
	}
};

function messageInsertion(senderId, receiverId, message) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `conversations`(`sender_id`, `receiver_id`, `messages`) VALUES(?, ?, ?)',
				[senderId, receiverId, message],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
function insertMessageNotif(fromId, toId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `notifications`(`from_id`, `to_id`, `type`, `notify_at`) VALUES(?, ?, 4, ?)',
				[fromId, toId, new Date()],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

const insertMessages = async (req, res, next) => {
	const errors = {};
	if (!isEmpty(req.bridgeErrors)) next();
	else if (!isEmpty(req.connectionErrors)) next();
	else {
		if (req.body.message.lenght > 200) errors.message = 'your message is too long';
		else {
			const messageInserted = await messageInsertion(req.userId, req.body.receiver, req.body.message);
			const messageNotification = await insertMessageNotif(req.userId, req.body.receiver);
		}
	}
	req.insertionError = errors;
	next();
};

router.post('/storeMessage', authToken, bridge, connectionChecker, insertMessages, (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.bridgeErrors)) {
		backEndResponse.errors = req.bridgeErrors;
		backEndResponse.status = 1;
	} else if (!isEmpty(req.connectionErrors)) {
		backEndResponse.errors = req.connectionErrors;
		backEndResponse.status = 1;
	} else if (!isEmpty(req.insertionError)) {
		backEndResponse.errors = req.insertionError;
		backEndResponse.status = 1;
	} else {
		backEndResponse.status = 0;
	}
	res.send(backEndResponse);
});
module.exports = router;
