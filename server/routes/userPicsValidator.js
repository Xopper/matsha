// user security

const router = require('express').Router();
const pool = require('../model/dbConnection');
const jwt = require('jsonwebtoken');
const isBase64 = require('is-base64');

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
					if (result === undefined || result === [] || result.length === 0) {
						connection.release();
						resolve(false);
					} else {
						const queryResult = result[0].id;
						connection.release();
						resolve(queryResult);
					}
				}
			});
		});
	});
}

const getActualUserId = async (req, res, next) => {
	const userId = await getUserId(req.userNameConnected);
	req.userId = userId;
	next();
};

const base64ImageValidation = image => {
	let error = '';
	const imageSignature = image.split(',')[0];
	const base64String = image.split(',')[1];
	const jpegMagicNum = 'ffd8';
	const pngMagicNum = '89504e470d0a1a0a';




	try {
		let responde = isBase64(base64String);
	} catch (err) {
		return (error = 'issue with V8 choose another image please');
	}

	if (!isBase64(base64String)) error = 'not a valid base64';
	else {
		if (imageSignature === 'data:image/png;base64') {
			const buffer = Buffer.from(base64String, 'base64');
			let strMagicNum = buffer.toString('hex', 0, 8);
			if (strMagicNum !== pngMagicNum) error = 'not a valid base64';
		} else if (imageSignature === 'data:image/jpeg;base64' || imageSignature === 'data:image/jpg;base64') {
			const buffer = Buffer.from(base64String, 'base64');
			let strMagicNum = buffer.toString('hex', 0, 2);
			if (strMagicNum !== jpegMagicNum) error = 'not a valid base64';
		} else error = 'not a valid base64';
	}
	return error;
};

function updatePics(userId, pics) {
	console.log(pics);
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) reject(err);
			connection.execute(
				'UPDATE `users` SET `profile_img` = ?, `img_one` = ?, `img_two` = ?, `img_three` = ? , `img_four` = ? WHERE `id` = ?',
				[pics.avatarSrc, pics.profilePic1, pics.profilePic2, pics.profilePic3, pics.profilePic4, userId],
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

const validatePics = (req, res, next) => {
	const picsErrs = {};
	// console.log(req.body)
	if (req.body.avatarSrc === '') picsErrs.avatarPic = 'Profile Image is required';
	else {
		if (base64ImageValidation(req.body.avatarSrc) !== '')
			picsErrs.avatarPic = base64ImageValidation(req.body.avatarSrc);
	}
	if (req.body.profilePic1)
		if (base64ImageValidation(req.body.profilePic1) !== '')
			picsErrs.imgOneErr = base64ImageValidation(req.body.profilePic1);
	if (req.body.profilePic2)
		if (base64ImageValidation(req.body.profilePic2) !== '')
			picsErrs.imgTwoErr = base64ImageValidation(req.body.profilePic2);
	if (req.body.profilePic3)
		if (base64ImageValidation(req.body.profilePic3) !== '')
			picsErrs.imgThreeErr = base64ImageValidation(req.body.profilePic3);
	if (req.body.profilePic4)
		if (base64ImageValidation(req.body.profilePic4) !== '')
			picsErrs.imgFourErr = base64ImageValidation(req.body.profilePic4);
	req.picsErrs = picsErrs;
	next();
};

router.post('/editPicsValidator', authToken, getActualUserId, validatePics, async (req, res) => {
	const backEndRes = {};
	if (!isEmpty(req.picsErrs)) {
		backEndRes.errors = req.picsErrs;
		backEndRes.status = 1;
		res.send(backEndRes);
	} else {
		const picsUpdated = await updatePics(req.userId, req.body);
		backEndRes.status = 0;
		res.send(backEndRes);
	}
});

module.exports = router;
