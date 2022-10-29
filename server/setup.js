const data = require('./ahaloua.json');
const db = require('./model/dbConnection');

for (let i = 0; i < data.length; i++) {
	// console.log([data[i]]);
	db.query('INSERT INTO `users` set ?', [data[i]], (err, res) => {
		if (err) console.log(err);
	});
}
