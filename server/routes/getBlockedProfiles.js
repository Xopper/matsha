const router = require('express').Router();
const pool = require('../model/dbConnection');
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
function checkIfUserExists(userName) {
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
// http://localhost:5000/getBlockedProfiles/profieBocked
// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6ImhyYWZpIiwiaWF0IjoxNjE1NDU4OTQzfQ.Sg-Y3vrRzXBiPDtUjXPTJxBcACwB5duIB8hRhW6iqFs
function getProfiles(userId) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT `users`.`id`, `users`.`user_name`, `users`.`profile_img` from `profile_blocks` JOIN `users` ON `profile_blocks`.`blocked_id` = `users`.`id` WHERE `profile_blocks`.`blocker_id` = ?',
				[userId],
				(err, result) => {
					if (err) reject(err);
					else {
						console.log(result);
						const queryResult = result.map(({ id, user_name, profile_img }) => {
							const usr = {};
							usr.id = id;
							usr.username = user_name;
							usr.avatar = profile_img;
							return usr;
						});
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}
const getBockedProfiles = async (req, res, next) => {
	const userExists = await checkIfUserExists(req.userNameConnected);
	console.log('userName : ', req.userNameConnected);
	console.log('userExists : ', userExists);
	if (userExists === 1) {
		const userId = await getUserId(req.userNameConnected);
		const profileBlocked = await getProfiles(userId);
		req.profileBlocked = profileBlocked;
		next();
	}
	next();
};
router.get('/Bockedprofiles', authToken, getBockedProfiles, (req, res) => {
	const backEndResponse = {};
	console.log(req.profileBlocked);
	if (req.profileBlocked === []) {
		backEndResponse.profileBlocked = 'No profile is blocked';
		backEndResponse.status = 0;
		res.send(backEndResponse);
	} else {
		backEndResponse.profileBlocked = req.profileBlocked;
		backEndResponse.status = 0;
		res.send(backEndResponse);
	}
});
module.exports = router;
