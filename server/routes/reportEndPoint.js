const router = require('express').Router();
const pool = require('../model/dbConnection');
const jwt = require('jsonwebtoken');
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
					const queryResult = result[0].id;
					connection.release();
					resolve(queryResult);
				}
			});
		});
	});
}
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
function checkIfUserIsReported(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `report` FROM `profile_reported` WHERE `reporter_id` = ? AND `reported_id` = ?',
				[currentUserId, userLookingForId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].report;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
function reportTheProfile(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `profile_reported`(`reporter_id`, `reported_id`) VALUES(?, ?)',
				[currentUserId, userLookingForId],
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

function affectFameRating(userId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `public_famerating` FROM `users` WHERE `id` = ?', [userId], (err, result) => {
				if (err) reject(err);
				else {
					const fameRatingAffected = result[0].public_famerating - 0.1;
					connection.execute(
						'UPDATE `users` SET `public_famerating` = ? WHERE `id` = ?',
						[fameRatingAffected, userId],
						(err, result) => {
							if (err) reject(err);
							else {
								const queryResult = result;
								connection.release();
								resolve(queryResult);
							}
						}
					);
				}
			});
		});
	});
}

const userChecker = async (req, res, next) => {
	let userErrors = '';
	const currentUserName = req.userNameConnected;
	const userNameToBeReported = req.body.userName;
	// check if user exists
	const userExists = await searchUser(userNameToBeReported);
	if (userExists === 0) {
		userErrors = 'User does not exist.';
		req.userErrors = userErrors;
		next();
	} else {
		const userToBeReportedId = await getUserId(userNameToBeReported);
		const currentUserId = await getUserId(currentUserName);
		const userIsReported = await checkIfUserIsReported(currentUserId, userToBeReportedId);
		if (userIsReported !== 0) {
			userErrors = 'User already reported.';
			req.userErrors = userErrors;
			// i chenged the logic of reporting :)
			// const unreportProfile = await unreportTheProfile(currentUserId, userToBeReportedId);
		} else {
			const reportProfile = await reportTheProfile(currentUserId, userToBeReportedId);
			const fameRating = await affectFameRating(userToBeReportedId);
		}
	}
	next();
};

router.post('/report', authToken, userChecker, (req, res) => {
	const backEndResponde = {};
	if (!isEmpty(req.userErrors)) {
		backEndResponde.errors = req.userErrors;
		backEndResponde.status = 1;
		res.send(backEndResponde);
	} else {
		backEndResponde.status = 0;
		res.send(backEndResponde);
	}
});
module.exports = router;
