const express = require('express'),
	app = express(),
	PORT = process.env.PORT || 8080,
	fs = require('fs'),
	path = require("path"),
	bodyParser = require('body-parser');

app.use('/public', express.static('dist'));
app.use('/static', express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/photo-booth', (req, res) => {
	res.sendFile(path.join(__dirname + '/src/pages/photo-booth.html'));
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/src/pages/index.html'));
});

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`)
});
