const router = require('express').Router();
const pool = require('../model/dbConnection');
const isBase64 = require('is-base64');
const jwt = require('jsonwebtoken');

const isEmpty = obj => {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
};
// header coming from front-end looks like :
// headers: {"Authorization" : `Bearer ${token}`}

// const authToken = (req, res, next) =>{
//     const authHeader = req.headers['Authorization']
//     const token = authHeader && authHeader.spit(' ')[1]
//     if (token === null) return res.sendStatus(401)

//     jwt.verify(token, "thesecretshit", (err, user) =>{
//         if (err) return res.sendStatus(403);
//         req.user = user;
//     })
//     next();
// }

function isValidDate(str) {
	// STRING FORMAT yyyy-mm-dd
	if (str == '' || str == null) {
		return false;
	}

	// m[1] is year 'YYYY' * m[2] is month 'MM' * m[3] is day 'DD'
	var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);

	// STR IS NOT FIT m IS NOT OBJECT
	if (m === null || typeof m !== 'object') {
		return false;
	}

	// CHECK m TYPE
	if (typeof m !== 'object' && m !== null && m.size !== 3) {
		return false;
	}

	var ret = true; //RETURN VALUE
	var thisYear = new Date().getFullYear(); //YEAR NOW
	var minYear = 1900; //MIN YEAR

	// YEAR CHECK
	if (m[1].length < 4 || m[1] < minYear || m[1] > thisYear) {
		ret = false;
	}
	// MONTH CHECK
	if (m[2].length < 2 || m[2] < 1 || m[2] > 12) {
		ret = false;
	}
	// DAY CHECK
	if (m[3].length < 2 || m[3] < 1 || m[3] > 31) {
		ret = false;
	}

	return ret;
}

const stepFormTrimedValues = values => {
	const valuesTrimed = {};

	console.log("lng, lat", values.latitude, values.latitude)

	// console.log(values.tags)

	valuesTrimed.gender = values.gender.trim();
	valuesTrimed.interests = values.interests.trim();
	valuesTrimed.bio = values.bio.trim();
	valuesTrimed.birthday = values.birthday.trim();
	valuesTrimed.profilePic1 = values.profilePic1.trim();
	valuesTrimed.profilePic2 = values.profilePic2.trim();
	valuesTrimed.profilePic3 = values.profilePic3.trim();
	valuesTrimed.profilePic4 = values.profilePic4.trim();
	valuesTrimed.profilePic5 = values.profilePic5.trim();
	valuesTrimed.country = values.country.trim();
	valuesTrimed.latitude = values.latitude;
	valuesTrimed.longitude = values.longitude;
	valuesTrimed.tags = [];
	values.tags.forEach(tag => {
		valuesTrimed.tags.push(tag.name.trim());
	});
	return valuesTrimed;
};

const primaryValidation = values => {
	const errors = {};

	if (values.gender === '' || typeof values.gender === undefined) errors.gender = 'Gender is required';
	else if (values.gender !== 'female' && values.gender !== 'male')
		errors.gender = 'Not a valid gender .Gender filed can only be female or male';

	if (values.interests === '' || typeof values.interests === undefined)
		errors.interests = 'Sex preference is required';
	else if (values.interests !== 'female' && values.interests !== 'male' && values.interests !== 'bi')
		errors.interests = 'Not a valid sex preference';

	if (values.bio === '' || typeof values.bio === undefined) errors.bio = 'Biography is required';
	else if (values.bio.length < 8 || values.bio.length > 500)
		errors.bio = 'Biography field length can be only between 8 and 500 characters';

	if (values.birthday === '' || typeof values.birthday === undefined) errors.birthday = 'Birthdate is required';
	else if (!isValidDate(values.birthday)) errors.birthday = 'Not a valid date';
	// we can add min and max age

	if (values.profilePic1 === '' || values.profilePic1 === undefined) errors.profilePic1 = 'Profile image is required';
	// images validation to be continued
	// console.log(values.tags.length)
	if (values.tags.length === 0 || values.tags.length > 5)
		errors.tags = 'You have to set at least 1 tag and at most 5 tags';
	else {
		const errlentag = values.tags.filter(tag => {
			if (tag.length <= 1 || tag.length > 20) return true;
		});
		if (errlentag.length !== 0) errors.tags = 'Tags length must be between 1 and 20 characters';
	}
	if (!values.country || values.country.trim() === '') {
		errors.country = 'Country is required field.';
	} else if (!/^[a-zA-Z]+$/.test(values.username)) {
		errors.country = 'Invalid country.';
	}

	return errors;
};

const base64ImageValidation = image => {
	let error = '';
	const imageSignature = image.split(',')[0];
	const base64String = image.split(',')[1];
	const jpegMagicNum = 'ffd8';
	const pngMagicNum = '89504e470d0a1a0a';

	try {
		let responde = isBase64(base64String);
		console.log(responde);
	} catch (err) {
		console.log('9laaawi');
		return (error = 'issue with V8 choose another image please');
	}

	if (!isBase64(base64String)) error = 'not a valid base64 ]]';
	// else {
	// 	if (imageSignature === 'data:image/png;base64') {
	// 		console.log(";;;;;;")
	// 		const buffer = Buffer.from(base64String, 'base64');
	// 		let strMagicNum = buffer.toString('hex', 0, 8);
	// 		if (strMagicNum !== pngMagicNum) error = 'not a valid base64 }}';
	// 	} else if (imageSignature === 'data:image/jpeg;base64' || imageSignature === 'data:image/jpg;base64') {
	// 		const buffer = Buffer.from(base64String, 'base64');
	// 		let strMagicNum = buffer.toString('hex', 0, 2);
	// 		if (strMagicNum !== jpegMagicNum) error = 'not a valid base64';
	// 	} else error = 'not a valid base64';
	// }
	return error;
};

const stepFormValidator = (req, res, next) => {
	const values = req.body;
	const trimedValues = stepFormTrimedValues(values);
	const primaryErrors = primaryValidation(trimedValues);
	const errors = primaryErrors;
	console.log('errors 1: ', errors);

	if (trimedValues.profilePic1)
		if (base64ImageValidation(trimedValues.profilePic1) !== '')
			errors.profileImgErr = base64ImageValidation(trimedValues.profilePic1);
	if (trimedValues.profilePic2)
		if (base64ImageValidation(trimedValues.profilePic2) !== '')
			errors.imgOneErr = base64ImageValidation(trimedValues.profilePic2);
	if (trimedValues.profilePic3)
		if (base64ImageValidation(trimedValues.profilePic3) !== '')
			errors.imgTwoErr = base64ImageValidation(trimedValues.profilePic3);
	if (trimedValues.profilePic4)
		if (base64ImageValidation(trimedValues.profilePic4) !== '')
			errors.imgThreeErr = base64ImageValidation(trimedValues.profilePic4);
	if (trimedValues.profilePic5)
		if (base64ImageValidation(trimedValues.profilePic5) !== '')
			errors.imgFourErr = base64ImageValidation(trimedValues.profilePic5);
	if ((values.latitude < -90.0 || values.latitude > 90.0) && (values.longitude < -180.0 || values.longitude > 180.0))
		errors.locationErr = 'Not a valid location';

	console.log('errors 2: ', errors);
	if (!isEmpty(errors)) req.errors = errors;
	else req.values = trimedValues;
	next();
};

// authentication token validation
const authToken = (req, res, next) => {
	// jwt;
	if (req.headers.authorization) {
		const authKey = req.headers.authorization.split(' ')[1];
		// console.log('>>', authKey);
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

function completeData(userName, values) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			connection.execute(
				'UPDATE `users` SET `gender`=?, `sexual_preference`=?, `birthdate`=?, `biography`=?, `latitude`=?, `longitude`=?, `profile_img`=?, `img_one`=?, `img_two`=?, `img_three`=?, `img_four`=?, `country` = ?,  `complited` = ? WHERE `user_name`=?',
				[
					values.gender,
					values.interests,
					values.birthday,
					values.bio,
					values.latitude,
					values.longitude,
					values.profilePic1,
					values.profilePic2,
					values.profilePic3,
					values.profilePic4,
					values.profilePic5,
					values.country,
					1,
					userName
				],
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

const registerStepFormData = async (userName, values) => {
	// get usr id
	// console.log(values)
	const userId = await getUserId(userName);
	const dataregistred = await completeData(userName, values);

	// new try
	values.tags.forEach(async tag => {
		const tagExists = await checkIfTagExists(tag);
		if (tagExists === 0) {
			const tagInserted = await insertTag(tag);
		}
		const tagId = await getTagId(tag);
		// check if the user already had the tag
		const userHasTheTag = await checkIfUserHadTheTag(userId, tagId);
		if (userHasTheTag === 0) {
			const insertUserAndTag = await userAndTagInsertion(userId, tagId);
		}
	});
};

router.post('/stepFormValidator', authToken, stepFormValidator, async (req, res) => {
	const backEndRespond = {};
	// console.log("inside the post : ", req.errors);
	if (!isEmpty(req.errors) || req.errors !== undefined) {
		backEndRespond.errors = req.errors;
		backEndRespond.status = 1;
	} else {
		// check when it has to register the step form data
		backEndRespond.status = 0;
		console.log(req.userNameConnected);
		registerStepFormData(req.userNameConnected, req.values);
	}
	res.send(backEndRespond);
});

module.exports = router;
