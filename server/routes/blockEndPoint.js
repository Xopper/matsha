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
function checkIfUserIsBlocked(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `block` FROM `profile_blocks` WHERE `blocker_id` = ? AND `blocked_id` = ?',
				[currentUserId, userLookingForId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].block;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
function blockTheProfile(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `profile_blocks` (`blocker_id`, `blocked_id`) VALUES(?, ?)',
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
function unblockTheProfile(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'DELETE FROM `profile_blocks` WHERE `blocker_id` = ? AND `blocked_id` = ?',
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
function affectFameRating(userId, sign) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `public_famerating` FROM `users` WHERE `id` = ?', [userId], (err, result) => {
				if (err) reject(err);
				else {
					let fameRatingAffected = result[0].public_famerating;
					if (sign === '+') {
						fameRatingAffected = result[0].public_famerating + 0.1;
					} else if (sign === '-') {
						fameRatingAffected = result[0].public_famerating - 0.1;
					}
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

function checkIfIamBlocked(userLookingForId, currentUserId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `block` FROM `profile_blocks` WHERE `blocker_id` = ? AND `blocked_id` = ?',
				[userLookingForId, currentUserId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].block;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

function likedProfile(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `liked` FROM `profile_likes` WHERE `liker_id` = ? AND `liked_id` = ?',
				[currentUserId, userLookingForId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].liked;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

function dislikeTheProfile(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'DELETE FROM `profile_likes` WHERE `liker_id` = ? AND `liked_id` = ?',
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

function checkIfMatched(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `matched` FROM `connected_users` WHERE (`user_one` = ? AND `user_two` = ?) OR (`user_one` = ? AND `user_two` = ?)',
				[currentUserId, userLookingForId, userLookingForId, currentUserId],
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

function unmatchUsers(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'DELETE FROM `connected_users` WHERE (`user_one` = ? AND `user_two` = ?) OR (`user_one` = ? AND `user_two` = ?)',
				[currentUserId, userLookingForId, userLookingForId, currentUserId],
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

const userChecker = async (req, res, next) => {
	const userErrors = {};
	const currentUserName = req.userNameConnected;
	const userNameToBeBlocked = req.body.userName;
	// check if user exists
	const userExists = await searchUser(userNameToBeBlocked);
	if (userExists === 0) {
		userErrors.userNotFound = 'user does not exist';
		req.userErrors = userErrors;
		next();
	} else {
		const userToBeBlockedId = await getUserId(userNameToBeBlocked);
		const currentUserId = await getUserId(currentUserName);
		const iamBlocked = await checkIfIamBlocked(userToBeBlockedId, currentUserId);
		if (iamBlocked === 0) {
			const userIsBlocked = await checkIfUserIsBlocked(currentUserId, userToBeBlockedId);
			console.log('userIsBlocked :: ', userIsBlocked);
			if (userIsBlocked !== 0) {
				const unblockProfile = await unblockTheProfile(currentUserId, userToBeBlockedId);
				const fameRating = await affectFameRating(userToBeBlockedId, '+');
			} else {
				const blockProfile = await blockTheProfile(currentUserId, userToBeBlockedId);
				const checkIfLiked = await likedProfile(currentUserId, userToBeBlockedId);
				if (checkIfLiked !== 0) {
					const dislikeProfile = await dislikeTheProfile(currentUserId, userToBeBlockedId);
					const areMatched = await checkIfMatched(currentUserId, userToBeBlockedId);
					console.log('areMatched :: ', areMatched);
					if (areMatched !== 0) {
						const unmatch = await unmatchUsers(currentUserId, userToBeBlockedId);
					}
				}
				const fameRating = await affectFameRating(userToBeBlockedId, '-');
			}
		}
		next();
	}
};
router.post('/block', authToken, userChecker, (req, res) => {
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
