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
const getActualUserId = async (req, res, next) => {
	console.log('user name : ', req.userNameConnected);
	const exists = await checkIfUserExists(req.userNameConnected);
	console.log('exists :: ', exists);
	const userId = await getUserId(req.userNameConnected);
	console.log(userId);
	req.userId = userId;
	next();
};

function deleteUsersTags(userId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('DELETE FROM `users_tags` WHERE `user_id` = ?', [userId], (err, result) => {
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

function updateGenderInterest(userId, values) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'UPDATE `users` SET `gender` = ?, `sexual_preference` = ? WHERE `id` = ?',
				[values.gender, values.interests, userId],
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

function checkIfTagExists(tag) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(`id`) AS `tag_exists` FROM `tags` WHERE `tags` = ?',
				[tag],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].tag_exists;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

function getTagId(tag) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT `id` FROM `tags` WHERE `tags` = ?', [tag], (err, result) => {
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

function insertTag(tag) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('INSERT INTO `tags`(`tags`) VALUES(?)', [tag], (err, result) => {
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

function checkIfUserHadTheTag(userId, tagId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(`id`) AS `userHadTag` FROM `users_tags` WHERE `tag_id` = ? AND `user_id` = ?',
				[tagId, userId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].userHadTag;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

function userAndTagInsertion(userId, tagId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'INSERT INTO `users_tags`(`tag_id`, `user_id`) VALUES(?, ?)',
				[tagId, userId],
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

const primaryValidation = (req, res, next) => {
	const primaryErrors = {};
	const values = req.body;
	console.log('req.body : ', req.body);
	console.log('values : ', values);
	if (values.gender === '' || typeof values.gender === undefined) primaryErrors.gender = 'Gender is required';
	else if (values.gender !== 'female' && values.gender !== 'male')
		primaryErrors.gender = 'Not a valid gender .Gender filed can only be female or male';

	if (values.interests === '' || typeof values.interests === undefined)
		primaryErrors.interests = 'Sex preference is required';
	else if (values.interests !== 'female' && values.interests !== 'male' && values.interests !== 'bi')
		primaryErrors.interests = 'Not a valid sex preference';

	if (values.tags.length === 0 || values.tags.length > 5)
		errors.tags = 'You have to set at least 1 tag and at most 5 tags';
	else {
		const errlentag = values.tags.filter(tag => {
			if (tag.length <= 1 || tag.length > 20) return true;
		});
		if (errlentag.length !== 0) primaryErrors.tags = 'Tags length must be between 1 and 20 characters';
	}
	req.primaryErrors = primaryErrors;
	next();
};

const updatePrefs = async (req, res, next) => {
	const errors = {};
	const values = req.body;
	if (!isEmpty(req.primaryErrors)) {
		req.errors = req.primaryErrors;
		next();
	} else {
		const genderInterestUpdated = await updateGenderInterest(req.userId, values);
		const usersTagsDeleted = await deleteUsersTags(req.userId);
		console.log('wewwe :: ', values.tags);
		req.updatedTags = values.tags;
		values.tags.forEach(async tag => {
			const tagExists = await checkIfTagExists(tag);
			if (tagExists === 0) {
				const tagInserted = await insertTag(tag);
			}
			const tagId = await getTagId(tag);
			// check if the user already had the tag
			const userHasTheTag = await checkIfUserHadTheTag(req.userId, tagId);
			if (userHasTheTag === 0) {
				const insertUserAndTag = await userAndTagInsertion(req.userId, tagId);
			}
		});
		next();
	}
	req.errors = errors;
	next();
};

function getUserTagsId(userId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT tags.tags FROM users_tags JOIN tags ON users_tags.tag_id = tags.id WHERE users_tags.user_id = ?',
				[userId],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result.map(tag => {
							return tag.tags;
						});
						resolve(queryResult);
						connection.release();
					}
				}
			);
		});
	});
}

router.post('/prefsValidator', authToken, getActualUserId, primaryValidation, updatePrefs, async (req, res) => {
	const backEndResponse = {};
	if (!isEmpty(req.errors)) {
		backEndResponse.errors = req.errors;
		backEndResponse.status = 1;
	} else {
		console.log(req.updatedTags);
		backEndResponse.tags = req.updatedTags;
		backEndResponse.status = 0;
	}
	res.send(backEndResponse);
});

module.exports = router;
