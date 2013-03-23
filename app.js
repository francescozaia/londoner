var express = require('express'),
	stylus = require('stylus'),
	nib = require('nib')

var app = express();
function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.use(nib())
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))

app.use(express.static(__dirname + '/public'));
app.get('/*', function (req, res) {
	res.render('layout', {
		title : 'Home',
		gatto : 'fff'
	});
})


var port = process.env.PORT || 3000;
app.listen(port);