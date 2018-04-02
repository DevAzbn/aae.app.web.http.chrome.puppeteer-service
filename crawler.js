'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist').argv;

azbn.setMdl('config', require('./config/main'));

//console.clear();

/*
var stdin = process.openStdin();
stdin.addListener('data', function(d) {
	// note:  d is an object, and when converted to a string it will
	// end with a linefeed.  so we (rather crudely) account for that  
	// with toString() and then trim() 
	console.log("you entered: [" + d.toString().trim() + "]");
});
*/

/*
process.stdin.setEncoding('utf8');
process.stdin.resume();

process.stdin.on('data', function(msg){
	
	console.log(msg);
	
});
*/

app.mdl('crawler').emit('addDoc', {
	source : '',
	href : 'http://azbn.ru/',
});

app.mdl('crawler').emit('enableWork', true);