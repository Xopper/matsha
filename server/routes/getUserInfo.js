const router = require('express').Router();
const pool = require('../model/dbConnection');
const jwt = require('jsonwebtoken');

const authToken = (req, res, next) => {
	if (req.headers.authorization) {
		const authKey = req.headers.authorization.split(' ')[1];
		if (authKey) {
			const authKey = req.headers.authorization.split(' ')[1];
			// console.log('wa l3adaab : ', authKey);
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

function getUserInformations(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT `user_name` as `username`, `first_name` as `firstName`, `last_name` as `lastName`, `email`, `birthdate` as `birthDay`, `biography`, `public_famerating` as `fameRating`, `latitude` as `lat`, `longitude` as `lng` FROM `users` WHERE `user_name` = ?',
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

getUserData = async (req, res, next) => {
	const userNameConnected = req.userNameConnected;
	const userInfo = await getUserInformations(userNameConnected);
	req.userInfos = userInfo;
	next();
};

router.get('/infos', authToken, getUserData, (req, res) => {
	const backEndRes = {};
	backEndRes.userInfos = req.userInfos;
	backEndRes.status = 0;
	res.send(backEndRes);
});

module.exports = router;
