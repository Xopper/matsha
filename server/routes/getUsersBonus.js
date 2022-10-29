const router = require('express').Router();
const pool = require('../model/dbConnection');
const { getMaxListeners } = require('../model/dbConnection');

function getMen(gender) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute('SELECT COUNT(*) as `men` FROM `users` WHERE `gender` = ?', [gender], (err, result) => {
				if (err) reject(err);
				else {
					const queryResult = result[0].men;
					connection.release();
					resolve(queryResult);
				}
			});
		});
	});
}

function getWomen(gender) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'SELECT COUNT(*) as `women` FROM `users` WHERE `gender` = ?',
				[gender],
				(err, result) => {
					if (err) reject(err);
					else {
						const queryResult = result[0].women;
						connection.release();
						resolve(queryResult);
					}
				}
			);
		});
	});
}

const getAllUsers = async (req, res, next) => {
	const users = {};
	const men = await getMen('male');
	const women = await getWomen('female');
	let allUsers = men + women;
	users.men = men;
	users.women = women;
	users.allUsers = allUsers;
	req.users = users;
	next();
};

router.get('/getAllUsers', getAllUsers, (req, res) => {
	const backEndResponse = {};
	backEndResponse.users = req.users;
	res.send(backEndResponse);
});

module.exports = router;
