'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist').argv;

azbn.setMdl('config', require('./config/main'));

//azbn.setMdl('url', require('url'));

if(!argv.sc || argv.sc == '') {
	argv.sc = 'default';
}

azbn.setMdl('bconfig', require('./config/scenarios/' + argv.sc));

const puppeteer = require('puppeteer');

(async function(){
	
	const browser = await puppeteer.launch(azbn.mdl('bconfig').puppeteer.launch);
	const page = await browser.newPage();
	
	await page.setUserAgent(azbn.mdl('bconfig').puppeteer.user_agent);
	await page.setViewport(azbn.mdl('bconfig').puppeteer.viewport);
	
	await (require('./' + azbn.mdl('bconfig').puppeteer.path.scenarios + '/' + argv.sc + '.js'))(browser, page, azbn, app, argv);
	
})();