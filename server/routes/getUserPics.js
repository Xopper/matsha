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

function getUserPictures(userName) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT `profile_img` as `avatarSrc`, `img_one` as `profilePic1`, `img_two` as `profilePic2`, `img_three` as `profilePic3`, `img_four`as `profilePic4` FROM `users` WHERE `user_name` = ?',
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
	const userPics = await getUserPictures(userNameConnected);
	req.userPics = userPics;
	next();
};

router.get('/pics', authToken, getUserData, (req, res) => {
	const backEndRes = {};
	backEndRes.userPics = req.userPics;
	backEndRes.status = 0;
	res.send(backEndRes);
});

module.exports = router;
