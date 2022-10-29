const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./model/dbConnection');
const registrationRouter = require('./routes/registration');
const loginRouter = require('./routes/login');
const emailVerificationRouter = require('./routes/tokenverification');
const stepFormRouter = require('./routes/steFormValidation');
const getUserInfoRouter = require('./routes/getUserInfo');
const getUserPicsRouter = require('./routes/getUserPics');
const getUserPrefsRouter = require('./routes/getUserPrefs');
const userInfoValidatorRouter = require('./routes/userInfoValidator');
const userPrefsValidtorRouter = require('./routes/userPrefsValidator');
const userEditSecRouter = require('./routes/userSecValidator');
const userEditPicsRouter = require('./routes/userPicsValidator');
const authTokenValidationRouter = require('./routes/authTokenValidation');
const profileUserInfosRouter = require('./routes/profileInfos');
// 11-03-2021
const forgetPwdEmailCheckerRouter = require('./routes/forgetPasswordEmailChecker');
const PasswordTokenVerificationRouter = require('./routes/forgetPasswordTokenValidation');
// 12-03-2021
const getBockedProfilesRouter = require('./routes/getBlockedProfiles');
const reportEndPointRouter = require('./routes/reportEndPoint');
const blockEndPointRouter = require('./routes/blockEndPoint');
const likeEndPointRouter = require('./routes/likeEndPoint');
const resetPasswordRouter = require('./routes/resetPasswordEndPoint');

// 17-03-2021
const filterBysexPrefRouter = require('./routes/filterBySexPreferences');

// 19-03-2021
const browseLoggedData = require('./routes/browseLogedData');

// 22-03-2021
const getConnectedUsersRouter = require('./routes/getConnectedUsers');
const insertMessages = require('./routes/insertMessages');
// 23-03-2021
const getMessagesRouter = require('./routes/conversations');

// 24-03-2021
const setNotificationsRouter = require('./routes/setNotifications');

const getNotificationsRouter = require('./routes/getNotifications');
const getHistoryRouter = require('./routes/getHistory');
const deleteNotificationsRouter = require('./routes/deleteNotifications');
const deleteHistoryRouter = require('./routes/deleteHistory');
const unblockRouter = require('./routes/unblockEndPoint');
const getAllUsersBonusRouter = require('./routes/getUsersBonus');

const { CLIENT_RENEG_LIMIT } = require('tls');
const redis = require("redis");
const client = redis.createClient();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});


const users = {};
io.on('connection', socket => {
	socket.on('usersConnected', function (username) {
		if (username) {
			users[username] = socket;
			client.set(username, socket.id);
			io.emit('usersIsOnline', username);
		}
		socket.on('disconnect', () => {
			client.del(username);
			io.emit('usersIsOffline', username);
			pool.getConnection((err, connection) => {
				connection.execute(
					'UPDATE `users` SET `last_seen` = ? WHERE `user_name` = ?',
					[new Date(), username],
					(err, resut) => {
					}
				);
			});
		});
	});
	socket.on('logOut', function (username) {
		client.del(username);
		io.emit('usersIsOffline', username);
		pool.getConnection((err, connection) => {
			connection.execute(
				'UPDATE `users` SET `last_seen` = ? WHERE `user_name` = ?',
				[new Date(), username],
				(err, resut) => {}
			);
		});
	});
	socket.on('OnlineUser', function (data) {
		client.get(data, function (err, reply) {
			if (reply !== null) {
				socket.emit('usersIsOnline', data);
				// console.log(reply)
				// console.log('==================================', users[data])
				if (users[data]) {
					users[data].emit('viewd_profile', true);
				}
			} else {
				io.emit('usersIsOffline', data);
			}
		});
	});
	socket.on('like', function (data) {
		client.get(data, function (err, reply) {
			if (reply !== null) {
				
				if (users[data]) {
					console.log("hamza zaml", data)
					users[data].emit('viewd_profile', true);
				}
			}
		});
	});
	socket.on('newMsg', function (data) {
		client.get(data.reciverUsername, function (err, reply) {
			if (reply !== null) {
				console.log(users)
				if (users[data.reciverUsername]) {
					users[data.reciverUsername].emit('msgRec', data);
					users[data.reciverUsername].emit('notifMsg', true);
				}
			}
		});
	});
});
app.use(express.json({
	limit: '50mb', extended: true
}))
app.use(cors({
	origin : "http://localhost:3000"
}));


// app.use('/', (req, res) => res.send("Hello Patcha"));

app.use('/emailverification', emailVerificationRouter);
app.use('/authLogin', loginRouter);
app.use('/stepForm', stepFormRouter);

app.use('/authToken', authTokenValidationRouter);
app.use('/auth', registrationRouter);
app.use('/emailverification', emailVerificationRouter);
app.use('/authLogin', loginRouter);
app.use('/stepForm', stepFormRouter);
app.use('/getInfos', getUserInfoRouter);
app.use('/getPictures', getUserPicsRouter);
app.use('/getPreferences', getUserPrefsRouter);
app.use('/editProfileInfo', userInfoValidatorRouter);
app.use('/editPrefs', userPrefsValidtorRouter);
app.use('/editPwd', userEditSecRouter);
app.use('/editPics', userEditPicsRouter);
app.use('/profileUserInfos', profileUserInfosRouter);

// 11-03-2021
app.use('/forgetPwdEmailChecker', forgetPwdEmailCheckerRouter);
app.use('/passwordverification', PasswordTokenVerificationRouter);

// today 12-03-2021
app.use('/getBlockedProfiles', getBockedProfilesRouter);
app.use('/resetPassword', resetPasswordRouter);
// actions
app.use('/reportEndPoint', reportEndPointRouter);
app.use('/blockEndPoint', blockEndPointRouter);
app.use('/likeEndPoint', likeEndPointRouter);

// 17-03-2021
app.use('/filter', filterBysexPrefRouter);

// 19-03-2021
app.use('/browsedata', browseLoggedData);

// 22-03-2021
app.use('/getConnectedUsers', getConnectedUsersRouter);
app.use('/storeConversations', insertMessages);

app.use('/conversations', getMessagesRouter);

app.use('/setNotifications', setNotificationsRouter);
app.use('/getNotifications', getNotificationsRouter);
app.use('/getHistory', getHistoryRouter);
app.use('/deleteNotifications', deleteNotificationsRouter);
app.use('/deleteHistory', deleteHistoryRouter);
app.use('/unblock', unblockRouter);
app.use('/getUsers', getAllUsersBonusRouter);

server.listen(5000, () => console.log("running"));
