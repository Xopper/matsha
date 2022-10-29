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

const bridge = (req, res, next) => {
	const errors = {};
	if (typeof req.body.notificationId === 'undefined' || !req.body.notificationId)
		errors.error = 'Unexpected parametters.';
	req.bridgeErrors = errors;
	next();
};

function deleteUserNotification(userId, notificationId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'DELETE FROM `notifications` WHERE `id` = ? AND `from_id` = ? AND `type` = 5',
				[notificationId, userId],
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

const deleteNotification = async (req, res, next) => {
	if (!isEmpty(req.bridgeErrors)) next();
	else {
		const userId = await getUserId(req.userNameConnected);
		console.log('>>', userId);
		console.log('??', req.userNameConnected);
		console.log('!!', req.body.notificationId);
		const notifDeleted = await deleteUserNotification(userId, req.body.notificationId);
		console.log('>>> ', notifDeleted);
		next();
	}
};

router.post('/deleteUserHistory', authToken, bridge, deleteNotification, (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.bridgeErrors)) {
		backEndResponse.errors = req.bridgeErrors;
		backEndResponse.status = 1;
	} else {
		backEndResponse.status = 0;
	}
	res.send(backEndResponse);
});

module.exports = router;
