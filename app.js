const express = require('express'),
	app = express(),
	PORT = process.env.PORT || 8080,
	fs = require('fs'),
	path = require("path"),
	bodyParser = require('body-parser');

app.use('/public', express.static('dist'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/submit', (req, res) => {
	res.sendFile(path.join(__dirname + '/src/pages/submit.html'));
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/src/pages/index.html'));
});

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`)
});
