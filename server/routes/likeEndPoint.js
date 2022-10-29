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
function checkIfUserIsLiked(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) AS `like` FROM `profile_likes` WHERE `liker_id` = ? AND `liked_id` = ?',
				[currentUserId, userLookingForId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].like;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
function likeTheProfile(currentUserId, userLookingForId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `profile_likes`(`liker_id`, `liked_id`) VALUES(?, ?)',
				[currentUserId, userLookingForId],
				(err, result) => {
					if (err) reject(err);
					else {
						console.log(currentUserId, userLookingForId);
						const queryResult = result;
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
const bridge = async (req, res, next) => {
	const errors = {};
	if (typeof req.body.userName === 'undefined' || !req.body.userName) errors.bridgeErr = 'unexpected parameters';
	req.bridgeErrors = errors;
	next();
};
function matcheUsers(currentUserId, userToBeLikedId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `connected_users`(`user_one`, `user_two`) VALUES(?, ?)',
				[currentUserId, userToBeLikedId],
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
function unmatcheUsers(currentUserId, userToBeLikedId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'DELETE FROM `connected_users` WHERE (`user_one` = ? AND `user_two` = ?) OR (`user_one` = ? AND `user_two` = ?)',
				[currentUserId, userToBeLikedId, userToBeLikedId, currentUserId],
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

function setNotification(fromId, toId, type) {
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

const userChecker = async (req, res, next) => {
	const userErrors = {};
	if (!isEmpty(req.bridgeErrors)) next();
	else {
		const currentUserName = req.userNameConnected;
		const userNameToBeLiked = req.body.userName;
		// check if user exists
		const userExists = await searchUser(userNameToBeLiked);
		if (userExists === 0) {
			userErrors.userNotFound = 'user does not exist';
			req.userErrors = userErrors;
			next();
		} else {
			const userToBeLikedId = await getUserId(userNameToBeLiked);
			const currentUserId = await getUserId(currentUserName);
			const userIsBlocked = await checkIfUserIsBlocked(currentUserId, userToBeLikedId);
			if (userIsBlocked !== 0) {
				userErrors.userBlocked = `You are blocking ${userNameToBeLiked}`;
				req.userErrors = userErrors;
				next();
			} else {
				// check if already liked
				const userIsLiked = await checkIfUserIsLiked(currentUserId, userToBeLikedId);
				let type = 0;
				if (userIsLiked === 0) {
					// like the profile
					const likeProfile = await likeTheProfile(currentUserId, userToBeLikedId);
					const fameRating = await affectFameRating(userToBeLikedId, '+');
					type = 1;
					// check if the actual user is already liked by this user
					const userIsLiked = await checkIfUserIsLiked(userToBeLikedId, currentUserId);
					if (userIsLiked) {
						const alreadyMatched = await checkIfMatched(currentUserId, userToBeLikedId);
						if (alreadyMatched === 0) {
							const match = await matcheUsers(currentUserId, userToBeLikedId);
							type = 3;
						}
					}
					const notif = await setNotification(currentUserId, userToBeLikedId, type);
				} else {
					// dislike the profile
					const dislikeProfile = await dislikeTheProfile(currentUserId, userToBeLikedId);
					const fameRating = await affectFameRating(userToBeLikedId, '-');
					type = 2;
					// check if the actual user is already liked by this user
					const userIsLiked = await checkIfUserIsLiked(userToBeLikedId, currentUserId);
					if (userIsLiked) {
						const unmatch = await unmatcheUsers(currentUserId, userToBeLikedId);
					}
					const notif = await setNotification(currentUserId, userToBeLikedId, type);
				}
			}
		}
		next();
	}
};
router.post('/like', authToken, bridge, userChecker, (req, res) => {
	const backEndResponde = {};
	if (!isEmpty(req.bridgeErrors)) {
		backEndResponde.errors = req.bridgeErrors;
		backEndResponde.status = 1;
	} else if (!isEmpty(req.userErrors)) {
		backEndResponde.errors = req.userErrors;
		backEndResponde.status = 1;
		res.send(backEndResponde);
	} else {
		backEndResponde.status = 0;
		res.send(backEndResponde);
	}
});
module.exports = router;
