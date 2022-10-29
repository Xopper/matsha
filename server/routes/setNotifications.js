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
	if (typeof req.body.to === 'undifined' || !req.body.to || typeof req.body.type === 'undifined' || !req.body.type)
		errors.bridgeErr = 'unexpected parameters';
	req.bridgeErrors = errors;
	next();
};

function insertNotif(fromId, toId, type) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `notifications`(`from_id`, `to_id`, `type`, `notify_at`) VALUES(?, ?, ?, ?)',
				[fromId, toId, type, new Date()],
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

const setNotification = async (req, res, next) => {
	const errors = {};
	if (!isEmpty(req.bridgeErrors)) next();
	else {
		const userId = await getUserId(req.userNameConnected);
		const userExists = await checkIfUserExists(req.body.to);
		console.log(req.body.to);
		if (userExists !== 0) {
			const toId = await getUserId(req.body.to);
			const notifSeted = await insertNotif(userId, toId, req.body.type);
		} else {
			errors.user = 'User does not exists.';
			req.userErrors = errors;
		}
		next();
	}
};

router.post('/messages', authToken, bridge, setNotification, (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.bridgeErrors)) {
		backEndResponse.errors = req.bridgeErrors;
		backEndResponse.status = 1;
	} else if (!isEmpty(req.userErrors)) {
		backEndResponse.errors = req.userErrors;
		backEndResponse.status = 1;
	} else {
		backEndResponse.conversation = req.conversation;
		backEndResponse.status = 0;
	}
	res.send(backEndResponse);
});

module.exports = router;
