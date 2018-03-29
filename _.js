'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist').argv;

azbn.setMdl('config', require('./config/main'));

azbn.setMdl('url', require('url'));

const puppeteer = require('puppeteer');

let runTask = async function() {
	
	let runTask_result = [];
	
	const browser = await puppeteer.launch({
		headless : false,
		ignoreHTTPSErrors : true,
		args :[

		],
		devtools : false,
		//userDataDir : '',
		//executablePath : '',
		//slowMo : 250,
	});
	
	const page = await browser.newPage();

	//await page.setUserAgent('DevAzbn');

	await page.setViewport({
		width : 1366,
		height : 768,
		//deviceScaleFactor : 1,
		//isMobile : true,
		//hasTouch : true,
		//isLandscape : true,
	});
	
	page.on('console', function(msg){
		//console.log('puppeteer log:', msg.args);
	});

	page.on('dialog', async function(dialog){
		сonsole.log(dialog.message());
		//dialog.accept([promptText])
		await dialog.dismiss();
		//await browser.close();
	});
	
	//http://fssprus.ru/torgi/action/city?data=5700000000000
	//http://fssprus.ru/torgi/ajax_search/?torgi[bidnumber]=&torgi[status]=5&torgi[torgpublishdate][from]=&torgi[torgpublishdate][to]=&torgi[propname]=&torgi[region]=5700000000000&torgi[city]=&torgi[startprice][from]=&torgi[startprice][to]=&torgi[torgexpiredate][from]=&torgi[torgexpiredate][to]=
	//http://fssprus.ru/torgi
	/*
	Accept:*<убрать>/*
	Accept-Encoding:gzip, deflate
	Accept-Language:ru,en;q=0.8
	Cache-Control:no-cache
	Connection:keep-alive
	Cookie:_ym_uid=15121217251005127179; _ym_isad=2; PHPSESSID=u6k1u4m540r1q8v1fren2vv7f0; _ym_visorc_9346069=w; sputnik_session=1512623870967|3
	DNT:1
	Host:fssprus.ru
	Pragma:no-cache
	Referer:http://fssprus.ru/torgi/
	User-Agent:Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 YaBrowser/17.10.1.1204 Yowser/2.5 Safari/537.36
	X-Requested-With:XMLHttpRequest
	
	Accept:*<убрать>/*
	Accept-Encoding:gzip, deflate
	Accept-Language:ru,en;q=0.8
	Cache-Control:no-cache
	Connection:keep-alive
	Cookie:_ym_uid=15121217251005127179; _ym_isad=2; PHPSESSID=u6k1u4m540r1q8v1fren2vv7f0; _ym_visorc_9346069=w; sputnik_session=1512623870967|3
	DNT:1
	Host:fssprus.ru
	Pragma:no-cache
	Referer:http://fssprus.ru/torgi/
	User-Agent:Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 YaBrowser/17.10.1.1204 Yowser/2.5 Safari/537.36
	X-Requested-With:XMLHttpRequest
	*/
	
	await page.goto('http://fssprus.ru/torgi', {
		waitUntil : [
			'domcontentloaded',
			//'load',
			//'networkidle2',
		],
	});
	
	//await page.waitFor(500);

	//https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
	
	//await page.mainFrame().$(selector)
	//page.mainFrame().url()
	//await page.$(selector)
	//await page.$$(selector)
	//await page.$eval('link[rel=preload]', el => el.href);
	//await page.$$eval('div', divs => divs.length);
	//await page.click('.test', {
	//	button <string> left, right, or middle, defaults to left.
	//	clickCount <number> defaults to 1. See UIEvent.detail.
	//	delay <number> Time to wait between mousedown and mouseup in milliseconds. Defaults to 0.
	//});
	//await page.type('#mytextarea', 'World', {delay: 100});
	//await page.waitForSelector(selector[, options])
	//await page.mainFrame().waitForFunction('window.innerWidth < 100');
	//await page.keyboard.type(CREDS.username);
	//await page.waitForNavigation();
	//await page.mainFrame().addScriptTag({
	//	url : '',
	//	path : '',
	//	content : '',	
	//})
	//await page.addStyleTag(options)
	//await page.authenticate({
	//	username : '',
	//	password : '',
	//})
	//await page.cookies(...urls)
	//await page.deleteCookie(...cookies)
	//await page.emulate(options)
	//await page.waitFor(selectorOrFunctionOrTimeout[, options[, ...args]])
	
	//await page.hover('.playableTile__artwork')
	
	//const inputElement = await page.$('input[type=submit]');
	//await inputElement.click();

	//elementHandle.boundingBox()

	//elementHandle.uploadFile(...filePaths)
	
	/*
	runTask_result = await page.evaluate(function(){
		let title = document.querySelector('title').innerText;
		return title;
	});

	await page.waitFor(500);
	*/

	var _table = '.results-frame .b-responsive-table table';

	await page.waitForSelector(_table);
	//var table = await page.$$(_table);
	const table = await page.$eval(_table, function(element) {
		return element.innerHTML;
	});

	var $ = azbn.mdl('web/http').parse(table);

	var trs = $('tr');
	trs.each(function(index){
		
		var tr = $(this);

		var
			notificationId = 0,
			lotId = 0,
			url = null
		;

		var as = tr.find('td:nth-child(2) a');
		as.each(function(index){
			var a = $(this);
			var href = a.attr('href');
			href = href + '';
			href = href.replace(/&amp;/ig, '&');
			url = azbn.mdl('url').parse(href, true, true);
			notificationId = url.query.notificationId;
			lotId = url.query.lotId;
		});
		
		var title = tr.find('td:nth-child(3)').html();
		
		var sum = tr.find('td:nth-child(4)').html();
		sum = sum + '';
		sum = sum.split('.');
		sum = sum[0];
		sum = sum.replace(/\s/ig, '');
		if(sum != '' && sum.length > 0) {
			sum = parseInt(sum);
		} else {
			sum = 0;
		}
		
		if(sum > 0) {
			runTask_result.push({
				notificationId : notificationId,
				lotId : lotId,
				title : title,
				sum : sum,
			});
		}

	});

	/*
	await page.screenshot({
		path : './data/yandex.ru.png',
		fullPage : true,
	});
	*/

	await browser.close();
	
	return runTask_result;
	
}

runTask().then(function(value){
    console.dir(value);
});
