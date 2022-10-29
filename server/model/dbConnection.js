const mysql2 = require('mysql2');

// for Allaoui im using http://192.168.99.105/ as host :)

const pool = mysql2.createPool({
	port: '6033',
	host: 'localhost',
	user: 'root', 
	password: 'myrootpass',
	database: 'matcha'
});

module.exports = pool;

// const pool = mysql2.createPool({
// 	connectionLimit: 10,
// 	host: 'localhost',
// 	user: 'root',
// 	password: 'thecraft98',
// 	database: 'matcha'
// });

// module.exports = pool;
