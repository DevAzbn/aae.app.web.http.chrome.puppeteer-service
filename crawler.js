'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist').argv;

azbn.setMdl('config', require('./config/main'));

app.mdl('crawler').emit('addDoc', {
	source : '',
	href : 'http://azbn.ru/',
});