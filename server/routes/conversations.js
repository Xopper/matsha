const router = require('express').Router();
const jwt = require('jsonwebtoken');
const pool = require('../model/dbConnection');

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
				if (err) return res.status(403).send('Token Error');
				else {
					req.userNameConnected = user.userName;
					next();
				}
			});
		}
	}
};

const bridge = (req, res, next) => {
	const errors = {};
	if (typeof req.body.receiver === 'undefined' || !req.body.receiver) errors.error = 'Unexpected parametters.';
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

function conversationMessages(senderId, receiverId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT `sender_id`, `receiver_id`, `messages` FROM `conversations` WHERE (`sender_id` = ? AND `receiver_id` = ?) OR (`receiver_id` = ? AND `sender_id` = ?)',
				[senderId, receiverId, senderId, receiverId],
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

function checkIfConvIsEmpty(senderId, receiverId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `empty` FROM `conversations` WHERE (`sender_id` = ? AND `receiver_id` = ?) OR (`receiver_id` = ? AND `sender_id` = ?)',
				[senderId, receiverId, senderId, receiverId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].empty;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

const getMessages = async (req, res, next) => {
	const getMessagesMsg = {};
	const conversation = {};
	if (!isEmpty(req.bridgeErrors)) next();
	else if (!isEmpty(req.connectionErrors)) next();
	else {
		const conversationEmpty = await checkIfConvIsEmpty(req.userId, req.body.receiver);
		if (conversationEmpty !== 0) {
			const messages = await conversationMessages(req.userId, req.body.receiver);
			conversation.messages = messages;
			req.conversation = conversation;
			next();
		} else {
			getMessagesMsg.emptyCnv = 'Empty Conversation be the first one to say HI.';
			req.message = getMessagesMsg;
			next();
		}
	}
};

router.post('/messages', authToken, bridge, connectionChecker, getMessages, (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.bridgeErrors)) {
		backEndResponse.errors = req.bridgeErrors;
		backEndResponse.status = 1;
	} else if (!isEmpty(req.connectionErrors)) {
		backEndResponse.errors = req.connectionErrors;
		backEndResponse.status = 1;
	} else if (!isEmpty(req.message)) {
		backEndResponse.message = req.message;
		backEndResponse.status = 0;
	} else {
		backEndResponse.conversation = req.conversation;
		backEndResponse.status = 0;
	}
	res.send(backEndResponse);
});

module.exports = router;
