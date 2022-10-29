const router = require('express').Router();
const pool = require('../model/dbconnection');
const jwt = require('jsonwebtoken');

const isEmpty = obj => {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
};

// const getToken = (req, res, next) => {
// 	if (req.headers.authorization) {
// 		const authKey = req.headers.authorization.split(' ')[1];
// 		if (authKey) {
// 			const authKey = req.headers.authorization.split(' ')[1];
// 			jwt.verify(authKey, 'mafhamnachwalakinma3lichlhalwassaoulfanid04', (err, decoded) => {
// 				if (err) return res.status(403).send('Token Error');
// 				else {
// 					req.userNameConnected = user.userName;
// 					next();
// 				}
// 			});
// 		}
// 	}
// };
function getToken(token) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, 'mafhamnachwalakinma3lichlhalwassaoulfanid04', (err, decoded) => {
			if (err) reject('err: ', err);
			resolve(decoded);
		});
	});
}
function checkUserAndValidateAccount(userName) {
	return new Promise((res, rej) => {
		pool.getConnection((err, connection) => {
			if (err) rej(err);
			connection.execute(
				'UPDATE `users` SET `verified`=?  WHERE `user_name`=?',
				[1, userName],
				(err, result) => {
					if (err) rej(err);
					res(result);
				}
			);
		});
	});
}

function checkIfTokenIsNull(userName) {
	return new Promise((res, rej) => {
		pool.getConnection((err, connection) => {
			if (err) rej(err);
			connection.execute('SELECT `token` FROM `users` WHERE `user_name` = ?', [userName], (err, result) => {
				if (err) rej(err);
				res(result[0].token);
			});
		});
	});
}
const tokenVerification = async (req, res, next) => {
	try {
		console.log('>>the token before <<: ', req.params.token);
		const tokenDecoded = await getToken(req.params.token);
		console.log('tokenDecoded :: ', tokenDecoded);
		req.decoded = tokenDecoded;
		const tokenIsNull = await checkIfTokenIsNull(req.decoded.userName);
		if (tokenIsNull === null) {
			req.error = 'Invalid token.';
			next();
		}
		next();
	} catch (err) {
		req.decoded = '';
		next();
	}
};
router.get('/passwordtokenverification/:token', tokenVerification, async (req, res) => {
	const backEndResponse = {};
	console.log('dandan', req.error);
	if (!isEmpty(req.error)) {
		console.log('Boss');
		backEndResponse.error = req.error;
		backEndResponse.status = 1;
		res.send(backEndResponse);
	} else if (!req.decoded) {
		console.log('sad9a??', req.decoded);
		backEndResponse.error = 'password Token validation went wrong.';
		backEndResponse.status = 1;
		res.send(backEndResponse);
	} else {
		const result = await checkUserAndValidateAccount(req.decoded.userName);
		console.log('>>Verified ?? << ', result);
		if (result.affectedRows === 1) console.log('the token has been verified succesfully');
		backEndResponse.userName = req.decoded.userName;
		backEndResponse.status = 0;
		res.send(backEndResponse);
	}
});
module.exports = router;
