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

const puppeteer = require('puppeteer');

(async function(){
	
	const browser = await puppeteer.launch(azbn.mdl('config').puppeteer.launch);
	const page = await browser.newPage();
	
	await page.setUserAgent(azbn.mdl('config').puppeteer.user_agent);
	await page.setViewport(azbn.mdl('config').puppeteer.viewport);
	
	await (require('./' + azbn.mdl('config').puppeteer.path.scenarios + '/' + argv.sc + '.js'))(puppeteer, browser, page, azbn);
	
})();