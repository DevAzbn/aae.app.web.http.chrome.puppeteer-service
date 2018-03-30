'use strict';

module.exports = async function(browser, page, azbn, argv) {
	
	//https://github.com/checkly/puppeteer-examples/
	
	if(azbn.mdl('bconfig').puppeteer.debug.save_trace) {
		await page.tracing.start({
			path : azbn.mdl('bconfig').puppeteer.path.traces + '/trace.json',
			categories: [
				'devtools.timeline',
			],
		});
	}
	
	const page2 = await browser.newPage();
	
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
	
	page.on('pageerror', function(_err) {
		/*
		сonsole.log('Page.Error', ':', _err);
		*/
	});
	
	page.on('request', function(_req) {
		
		let _u = _req.url();
		let is_bad = false;
		let _res = [
			'https://mc.yandex.ru',
			'https://www.google-analytics.com',
			'https://www.googletagmanager.com',
			//'top-fwz1.mail.ru',
			'https://vk.com/rtrg',
			'https://www.facebook.com/tr',
			'https://connect.facebook.net',
		];
		let _rex = new RegExp('(' + _res.join('|') + ')','ig');
		if(_rex.test(_u)) {
			
			console.log('Page.Blocked', ':', _u);
			_req.abort();
			
			/*
			_req.respond({
				status: 404,
				contentType: 'text/plain',
				body: '010'
			});
			*/
			
		} else {
			
			_req.continue();
			
		}
		
		/*
		if (request.resourceType() === 'image')
			request.abort();
		else
			request.continue();
		*/
		
	});
	
	page.on('response', function(_res) {
		/*
		_res.text().then(function(resp){
			console.log('Page.Response', ':', resp);
		});
		*/
	});
	
	/*
	await page.exposeFunction('aae__onclick', function(o) {
		console.log(o);
	});
	
	function __page__setListener(type) {
		return page.evaluateOnNewDocument(function(type) {
			
			function aae__getXPathTo(el) {
				if (typeof el == "string") return document.evaluate(el, document, null, 0, null)
				if (!el || el.nodeType != 1) return ''
				if (el.id) return "//*[@id='" + el.id + "']"
				var sames = [].filter.call(el.parentNode.children, function (x) { return x.tagName == el.tagName })
				return aae__getXPathTo(el.parentNode) + '/' + el.tagName.toLowerCase() + (sames.length > 1 ? '['+([].indexOf.call(sames, el)+1)+']' : '')
			}
			
			//document.body.scrollIntoView({
			//	block : 'start',
			//	behavior : 'smooth',
			//});
			
			document.addEventListener(type, function(event){
				//window.aae__onclick(aae__getXPathTo(event.target));
				console.log(aae__getXPathTo(event.target));
			}, false);
			
		}, type);
	}
	
	await __page__setListener('click');
	*/
	
	await page.setRequestInterception(true);
	
	//https://ooooooooo.ru/search/?text=url:www.ooooooooo.ru/*&lr=10&clid=2092371&p=1&numdoc=50
	await page.goto('http://azbn.ru/', {
		//waitUntil : 'load',
		waitUntil : 'domcontentloaded',
		//waitUntil : 'networkidle0',
		//waitUntil : 'networkidle2',
	});
	
	console.log('Page.DOMContentLoaded', ':', azbn.now());
	
	await page.waitFor(128);
	//await page.waitForNavigation()
	//await page.waitForSelector('h4.cart-items-header')
	
	if(azbn.mdl('bconfig').puppeteer.includes.scripts) {
		
		for(var i in azbn.mdl('bconfig').puppeteer.includes.scripts) {
			
			//await page.mainFrame().addScriptTag(azbn.mdl('bconfig').puppeteer.includes.scripts[i]);
			
		}
		
	}
	
	
	/*
	await page.waitFor(5000);
	const result = await page.evaluate(function(xp) {
		
		var aae__eventFire = function(el, etype){
			if(el) {
				if (el.fireEvent) {
					el.fireEvent('on' + etype);
				} else {
					var evObj = document.createEvent('Events');
					evObj.initEvent(etype, true, false);
					el.dispatchEvent(evObj);
				}
			}
		}
		
		var aae__byXPath = function(xpathToExecute){
			return document.evaluate(xpathToExecute, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		}
		
		var el = aae__byXPath(xp);
		aae__eventFire(el, 'click');
		
		return xp;
	}, '/html/body/div[2]/div[1]/div/div/div/div/div/ul/li[4]/a'.toLowerCase());
	
	console.log(result);
	*/
	
	
	/*
	
	
	const stories = await page.evaluate(function() {
		const anchors = Array.from(document.querySelectorAll('a.storylink'))
		return anchors.map(anchor => anchor.textContent).slice(0, 10)
	});
	console.log(stories);
	
	
	await page.hover('.playableTile__artwork')
	
	
	await page.focus('trix-editor')
	await page.keyboard.type('Just adding a title')
	
	
	await page.keyboard.type('Hello World!');
	await page.keyboard.press('ArrowLeft');

	await page.keyboard.down('Shift');
	for (let i = 0; i < ' World'.length; i++)
		await page.keyboard.press('ArrowLeft');
	await page.keyboard.up('Shift');

	await page.keyboard.press('Backspace');
	// Result text will end up saying 'Hello!'

	await page.keyboard.down('Shift');
	await page.keyboard.press('KeyA');
	await page.keyboard.up('Shift');
	
	
	await page.mouse.click(132, 103, {
		button: 'left'
	})
	
	
	await page.type('input#text', 'Just adding a title', {
		delay : 100,
	});
	
	
	await page.click('button.add-to-cart-btn.addToCart');
	
	
	// Wait for suggest overlay to appear and click "show all results".
	const allResultsSelector = '.devsite-suggest-all-results';
	await page.waitForSelector(allResultsSelector);
	await page.click(allResultsSelector);
	
	// Wait for the results page to load and display the results.
	const resultsSelector = '.gsc-results .gsc-thumbnail-inside a.gs-title';
	await page.waitForSelector(resultsSelector);
	
	// Extract the results from the page.
	const links = await page.evaluate(resultsSelector => {
		const anchors = Array.from(document.querySelectorAll(resultsSelector));
		return anchors.map(anchor => {
			const title = anchor.textContent.split('|')[0].trim();
			return `${title} - ${anchor.href}`;
		});
	}, resultsSelector);
	console.log(links.join('\n'));
	
	
	// Get the "viewport" of the page, as reported by the page.
	const dimensions = await page.evaluate(() => {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
			deviceScaleFactor: window.devicePixelRatio
		};
	});
	console.log('Dimensions:', dimensions);
	
	
	*/
	
	if(azbn.mdl('bconfig').puppeteer.make_screenshots.png) {
		await page.screenshot({
			path : azbn.mdl('bconfig').puppeteer.path.screenshots + '/default.png',
			fullPage : true,
		});
	}
	
	if(azbn.mdl('bconfig').puppeteer.make_screenshots.pdf && azbn.mdl('bconfig').puppeteer.launch.headless) {
		//await page.emulateMedia('screen');
		await page.pdf({
			path : azbn.mdl('bconfig').puppeteer.path.screenshots + '/default.pdf',
			width : azbn.mdl('bconfig').puppeteer.viewport.width,
			//format : 'A4',
		});
	}
	
	
	//page.removeListener('request', logRequest);
	
	if(azbn.mdl('bconfig').puppeteer.debug.save_trace) {
		await page.tracing.stop();
	}
	
	if(azbn.mdl('bconfig').puppeteer.browser.closeOnFinish) {
		await browser.close();
	}
	
	return null;
	
}