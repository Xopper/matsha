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
	if (typeof req.body.to === 'undifined' || !req.body.to) errors.bridgeErr = 'unexpected parameters';
	req.bridgeErrors = errors;
	next();
};

function insertNotif(fromId, toId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `notifications`(`from_id, to_id`, `type`) VALUES(?, ?, 5)',
				[fromId, toId],
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

function getUserId(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `id` from `users` WHERE `user_name`', [userName], (err, result) => {
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

const setNotification = async (res, req, next) => {
	if (!isEmpty(req.bridgeErrors)) next();
	else {
		const userId = getUserId(req.userNameConnected);
		const notifSeted = await insertNotif(userId, req.to);
		next();
	}
};

router.post('/messages', authToken, bridge, setNotification, (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.bridgeErrors)) {
		backEndResponse.errors = req.bridgeErrors;
		backEndResponse.status = 1;
	} else {
		backEndResponse.conversation = req.conversation;
		backEndResponse.status = 0;
	}
	res.send(backEndResponse);
});

module.exports = router;
