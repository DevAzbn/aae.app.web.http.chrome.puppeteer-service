'use strict';

module.exports = async function(browser, page, azbn, app, argv) {
	
	const chalk = require('chalk');

	let step = argv.step || 0;

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

	switch(step) {

		case 0 : {

			await page.goto(azbn.mdl('bconfig').site.path.root + '/novostrojki-krasnodara', {
				//waitUntil : 'load',
				waitUntil : 'domcontentloaded',
			});

			chalk.green('domcontentloaded');

			if(azbn.mdl('bconfig').puppeteer.includes.scripts) {
				
				for(var i in azbn.mdl('bconfig').puppeteer.includes.scripts) {
					
					await page.mainFrame().addScriptTag(azbn.mdl('bconfig').puppeteer.includes.scripts[i]);
					
				}
				
			}

			let items_cont = '.w-tab-pane:nth-child(1) .w-dyn-list .w-dyn-items';
			let items = items_cont + ' .w-dyn-item .card-link';

			await page.waitForSelector(items_cont);

			let links = await page.evaluate(resultsSelector => {
				
				let result = [];

				if(jQuery) {
					(function($){

						var items = $(resultsSelector);

						if(items.length) {

							items.each(function(index){

								let item = $(this);
								href = item.attr('href');
								if(href && href != '') {
									
									let p = item.parent().get(0).style.backgroundImage.match(/^url\("(.*)"\)$/);
									let img = p && p[1] || '';

									result.push({
										href : href,
										title : (item.find('.card-headline').text()).trim(),
										adr : (item.find('.tagline-2').text()).trim(),
										final : (item.find('.label-green .label-text').text()).trim(),
										img : img,
									});

								}

							});

						}

					})(jQuery);
				}
				
				return result;

			}, items);

			app.saveJSON('crawler/results/' + argv.sc + '/' + step, links);

			chalk.red('result saved');

		}
		break;

		default : {

		}
		break;

	}

	if(azbn.mdl('bconfig').puppeteer.browser.closeOnFinish) {
		await browser.close();
	}

	return null;
	
}