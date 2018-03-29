'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist').argv;

azbn.setMdl('config', require('./config/main'));

//azbn.setMdl('url', require('url'));

const puppeteer = require('puppeteer');

(async function(){
	
	//https://github.com/checkly/puppeteer-examples/
	
	const browser = await puppeteer.launch(azbn.mdl('config').puppeteer.launch);
	const page = await browser.newPage();
	
	/*
	await page.tracing.start({
		path : azbn.mdl('config').puppeteer.path.traces + '/trace.json',
		categories: [
			'devtools.timeline',
		],
	});
	*/
	
	await page.setViewport(azbn.mdl('config').puppeteer.viewport);
	
	/*
	const cookie = {
		name : 'login_email',
		value : 'set_by_cookie@domain.com',
		domain : '.paypal.com',
		url : 'https://www.paypal.com/',
		path : '/',
		httpOnly : true,
		secure : true,
	}
	await page.setCookie(cookie);
	*/
	
	page.on('console', function(msg){
		console.log('puppeteer log:', msg.args);
	});
	
	page.on('dialog', async function(dialog){
		сonsole.log(dialog.message());
		//dialog.accept([promptText])
		await dialog.dismiss();
		//await browser.close();
	});
	
	await page.goto('https://yandex.ru/search/?text=url:www.infoorel.ru/*&lr=10&clid=2092371&p=1&numdoc=50', {
		//waitUntil : 'domcontentloaded',
	});
	
	await page.waitFor(128);
	
	/*
	await page.type('input#text', 'Just adding a title', {
		delay : 100,
	});
	await page.click('button.add-to-cart-btn.addToCart');
	await page.waitForSelector('h4.cart-items-header')
	*/
	
	//await page.waitForNavigation()
	
	await page.screenshot({
		path : azbn.mdl('config').puppeteer.path.screenshots + '/yandex.ru.png',
		fullPage : true,
	});
	
	/*
	await page.pdf({
		path : azbn.mdl('config').puppeteer.path.screenshots + '/yandex.ru.pdf',
		format : 'A4',
	});
	*/
	
	//await page.tracing.stop();
	await browser.close();
	
})();