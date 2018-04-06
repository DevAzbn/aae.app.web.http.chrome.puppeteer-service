'use strict';

module.exports = async function(browser, page, azbn, app, argv) {
	
	const chalk = require('chalk');

	const cookie = {
		name : 'i',
		value : 'sRFUWzEu2SBW5LCfF9U9GHqCcGOqjvKfXAh/rh3EsgGbPsTcr6sMhd4VuUHkm35X2UxP2EAOE7QJkFYFJPPPO2+OF0w=',
		domain : '.yandex.ru',
		url : 'https://yandex.ru/',
		path : '/',
		httpOnly : true,
		secure : true,
	}
	await page.setCookie(cookie);

	const rpn = require('request-promise-native').defaults({
		headers : {
			'User-Agent' : azbn.mdl('bconfig').puppeteer.user_agent,
			// 'content-type': 'application/x-www-form-urlencoded' // Is set automatically
		},
	});

	const cheerio = require('cheerio');
	
	if(azbn.mdl('bconfig').puppeteer.debug.save_trace) {
		await page.tracing.start({
			path : azbn.mdl('bconfig').puppeteer.path.traces + '/trace.json',
			categories: [
				'devtools.timeline',
			],
		});
	}
	
	page.on('console', function(msg){
		if(msg.args.length) {
			for(var i = 0; i < msg.args.length; i++) {
				var o = msg.args[i];
				console.log('Page.Console', ':', o._remoteObject.value);
			}
		}
	});
	
	page.on('dialog', async function(dialog){
		//сonsole.log('Page.Dialog', ':', dialog.message());
		//dialog.accept([promptText])
		//await dialog.dismiss();
		//await browser.close();
	});
	
	await page.setRequestInterception(false);
	
	//'https://yandex.ru/search/?text=' + argv.query + '&lr=10&clid=2092371&p=1&numdoc=50'
	await page.goto('https://yandex.ru/', {
		//waitUntil : 'load',
		waitUntil : 'domcontentloaded',
	});

	chalk.green('domcontentloaded');

	let selector__input = 'form[action="https://yandex.ru/search/"] input#text';
	let selector__button = 'form[action="https://yandex.ru/search/"] .search2__button button[type="submit"]';
	let selector__links = '.serp-item:not(.serp-adv-item) .link.organic__url';

	await page.waitForSelector(selector__input);
	await page.click(selector__input);
	await page.type(selector__input, argv.query, {
		delay : 210,
	});
	await page.waitFor(1024);
	await page.click(selector__button);
	
	chalk.green('after button click');

	await page.waitForSelector(selector__links);
	await page.waitFor(128);

	var _url = page.url();

	await page.goto(_url + '&clid=2092371&p=1&numdoc=50', {
		//waitUntil : 'load',
		waitUntil : 'domcontentloaded',
	});

	await page.waitFor(256);
	
	if(azbn.mdl('bconfig').puppeteer.includes.scripts) {
		
		for(var i in azbn.mdl('bconfig').puppeteer.includes.scripts) {
			
			//await page.mainFrame().addScriptTag(azbn.mdl('bconfig').puppeteer.includes.scripts[i]);
			
		}
		
	}

	let links = await page.evaluate(resultsSelector => {
		let result = [];
		const anchors = Array.from(document.querySelectorAll(resultsSelector));
		for(let i = 0; i < anchors.length; i++) {
			let href = anchors[i].getAttribute('href') || '';
			if(href && href != '') {
				result.push({
					href : anchors[i].getAttribute('href'),
					title : anchors[i].innerHTML.replace(/<\/?[^>]+>/g,''),
				});
			}
		}
		return result;
	}, selector__links);
	
	if(links.length) {
		for(let i = 0; i < links.length; i++) {
			let p = links[i];

			if(!(/^\/\//.test(p.href))) {
				console.log(p.href);
				rpn({
					method : 'GET',
					uri : p.href,
					//transform2xxOnly : true,
					transform : function(body, response, resolveWithFullResponse) {
						
						// /^2/.test('' + response.statusCode)
						
						if(/application\/json/.test(response.headers['content-type'])) {
							
							//console.log('json');
							
							return JSON.parse(body);
							
						} else if(/text\/html/.test(response.headers['content-type'])) {
							
							//console.log('html');
							
							if(/^2/.test('' + response.statusCode)) {
								
							}
							
							return cheerio.load(body, {
								normalizeWhitespace : true,
								decodeEntities : false,
								//xmlMode : true,
								//withDomLvl1: true,
							});
							
						} else {
							
							//console.log(response.headers['content-type']);
							
							return body;
							
						}
						
					},
				})
				.then(function($) {
					
					if(typeof $ == 'function') {
						
						var _html = $.html();
						
						links[i]['phone'] = _html.match(/([\+\-\s\(\)0-9]){7,}/ig);
						links[i]['email'] = _html.match(/([a-z0-9_\.\+-]+)@([a-z0-9_\.-]+)\.([a-z\.]{2,6})/ig);

						app.saveJSON('crawler/results/' + argv.sc + '_' + argv.query, links);

					}
					
				})
				.catch(function(err) {
					
					//console.log(err);
					
				})
				;

			}

		}
	}

	//app.saveJSON('crawler/results/' + argv.sc + '_' + argv.query, links);
	
	chalk.red('result saved');

	if(azbn.mdl('bconfig').puppeteer.make_screenshots.png) {
		await page.screenshot({
			path : azbn.mdl('bconfig').puppeteer.path.screenshots + '/' + argv.sc + '.png',
			fullPage : true,
		});
	}
	
	if(azbn.mdl('bconfig').puppeteer.make_screenshots.pdf && azbn.mdl('bconfig').puppeteer.launch.headless) {
		//await page.emulateMedia('screen');
		await page.pdf({
			path : azbn.mdl('bconfig').puppeteer.path.screenshots + '/' + argv.sc + '.pdf',
			width : azbn.mdl('bconfig').puppeteer.viewport.width,
			//format : 'A4',
		});
	}
	
	if(azbn.mdl('bconfig').puppeteer.debug.save_trace) {
		await page.tracing.stop();
	}
	
	if(azbn.mdl('bconfig').puppeteer.browser.closeOnFinish) {
		await browser.close();
	}
	
	return null;
	
}