'use strict';

module.exports = async function(puppeteer, browser, page, azbn) {
	
	//https://github.com/checkly/puppeteer-examples/
	
	/*
	await page.tracing.start({
		path : azbn.mdl('config').puppeteer.path.traces + '/trace.json',
		categories: [
			'devtools.timeline',
		],
	});
	*/
	
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
	
	//await page.setRequestInterception(true);
	
	page.on('console', function(msg){
		if(msg.args.length) {
			for(var i = 0; i < msg.args.length; i++) {
				var o = msg.args[i];
				console.log('puppeteer log:', o._remoteObject.value);
			}
		}
	});
	
	page.on('dialog', async function(dialog){
		сonsole.log(dialog.message());
		//dialog.accept([promptText])
		await dialog.dismiss();
		//await browser.close();
	});
	
	page.on('pageerror', function(_err) {
		//console.log(_req.url);
	});
	
	page.on('request', function(_req) {
		//console.log(_req.url());
		/*
		_req.respond({
			status: 404,
			contentType: 'text/plain',
			body: 'Not Found!'
		});
		*/
	});
	
	page.on('response', function(_res) {
		//console.log(_res.text());
	});
	
	//https://ooooooooo.ru/search/?text=url:www.ooooooooo.ru/*&lr=10&clid=2092371&p=1&numdoc=50
	await page.goto('http://azbn.ru/', {
		//waitUntil : 'domcontentloaded',
	});
	
	await page.waitFor(128);
	//await page.waitForNavigation()
	//await page.waitForSelector('h4.cart-items-header')
	
	if(azbn.mdl('config').puppeteer.includes.scripts) {
		
		for(var i in azbn.mdl('config').puppeteer.includes.scripts) {
			
			await page.mainFrame().addScriptTag(azbn.mdl('config').puppeteer.includes.scripts[i]);
			
		}
		
	}
	
	/*
	await page.type('input#text', 'Just adding a title', {
		delay : 100,
	});
	await page.click('button.add-to-cart-btn.addToCart');
	*/
	
	if(azbn.mdl('config').puppeteer.make_screenshots.png) {
		await page.screenshot({
			path : azbn.mdl('config').puppeteer.path.screenshots + '/default.png',
			fullPage : true,
		});
	}
	
	if(azbn.mdl('config').puppeteer.make_screenshots.pdf && azbn.mdl('config').puppeteer.launch.headless) {
		//await page.emulateMedia('screen');
		await page.pdf({
			path : azbn.mdl('config').puppeteer.path.screenshots + '/default.pdf',
			width : azbn.mdl('config').puppeteer.viewport.width,
			//format : 'A4',
		});
	}
	
	
	//page.removeListener('request', logRequest);
	//await page.tracing.stop();
	await browser.close();
	
	return null;
	
}