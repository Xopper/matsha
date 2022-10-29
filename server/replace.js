const data = require('./data.json');
const fs = require('fs');
const path = require('path');

const users = data.map(elm => {
	// console.log(elm.email);
	const user = {};
	user['user_name'] = elm.username;
	user['first_name'] = elm.firstname;
	user['last_name'] = elm.lastname;
	user['email'] = elm.email;
	user['password'] = '$2b$10$yIDWIoYzIO3YgjL9QWMIP.wi1ICdY/XWxoxWLpt4Sc7lLM/mKwOcu';
	user['token'] = elm.token;
	user['authentication_token'] = elm.token;
	user['verified'] = 1;
	user['gender'] = elm.gender.toLowerCase();
	user['sexual_preference'] = elm.genderLooking.toLowerCase();
	user['birthdate'] = elm.birthday;
	user['biography'] = elm.bio;
	user['loged'] = 0;
	user['public_famerating'] = elm.rating;
	user['latitude'] = elm.latitude;
	user['longitude'] = elm.longitude;
	user['country'] = 'uknown';
	user['profile_img'] = elm.profilePic;
	user['complited'] = 1;
	return user;
});

// fs.writeFileSync('./tach.json', users);

let newData = JSON.stringify(users, null, 2);

fs.writeFile('ahaloua.json', newData, err => {
	if (err) throw err;
	console.log('Data written to file');
});

console.log('This is after the write call');

// fs.writeFileSync(path.resolve(__dirname, '.json'), JSON.stringify(users));

// console.log(users);
