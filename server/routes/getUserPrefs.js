const router = require('express').Router();
const pool = require('../model/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
function getUserPrefs(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT `gender`, `sexual_preference` FROM `users` WHERE `user_name` = ?',
				[userName],
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

// http://localhost:5000/getPreferences/prefs
// Authorization
// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6ImhyYWZpIiwiaWF0IjoxNjE1MTk4MjYwfQ.rIkuBx2dZHJjWmA9KhuB6aXsEq0njnGm-8vdJ5WAXZw

getUserData = async (req, res, next) => {
	const userNameConnected = req.userNameConnected;
	const userPrefs = {};
	const userId = await getUserId(userNameConnected);
	const userPreferences = await getUserPrefs(userNameConnected);
	const userTags = await getUserTagsId(userId);
	userPrefs.gender = userPreferences[0].gender;
	userPrefs.sexual_preference = userPreferences[0].sexual_preference;
	console.log(userPrefs);
	req.userTags = userTags;
	req.userPrefs = userPrefs;
	next();
};
router.get('/prefs', authToken, getUserData, async (req, res) => {
	const backEndResponse = {};
	backEndResponse.userPrefs = req.userPrefs;
	backEndResponse.userTags = req.userTags;
	res.send(backEndResponse);
});
module.exports = router;
