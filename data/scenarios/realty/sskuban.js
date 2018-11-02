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

		case 1 : {

			let items = app.loadJSON('crawler/results/' + argv.sc + '/0');

			if(items && items.length) {

				for(let j in items) {

					var item = items[j];

					await page.goto(azbn.mdl('bconfig').site.path.root + item.href, {
						//waitUntil : 'load',
						waitUntil : 'domcontentloaded',
					});
					
					if(azbn.mdl('bconfig').puppeteer.includes.scripts) {
						
						for(var i in azbn.mdl('bconfig').puppeteer.includes.scripts) {
							
							await page.mainFrame().addScriptTag(azbn.mdl('bconfig').puppeteer.includes.scripts[i]);
							
						}
						
					}

					let images_cont = '.content-wrapper-new .w-slider';
					let images_selector = images_cont + ' .kompleks-slide';
					
					await page.waitForSelector(images_cont);

					let images = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);

										let p = item.get(0).style.backgroundImage.match(/^url\("(.*)"\)$/);
										let img = p && p[1] || '';

										result.push(img);
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, images_selector);

					items[j].slider = images;



					let content_cont = '.content-wrapper-new .section-wrap';
					let content_selector = content_cont + ' .content-text-wrap';

					await page.waitForSelector(content_cont);

					let content = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);

										result.push(item.text().trim());
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, content_selector);

					items[j].content = content;





					let params_cont = '.content-wrapper-new .section-wrap .feature5-row-wrap';
					let params_selector = params_cont + ' .feature5-item-wrap';

					await page.waitForSelector(params_cont);

					let params = await page.evaluate(resultsSelector => {
				
						let result = {};
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);

										let k = item.find('.text-15').text().trim();
										let v = item.find('.text-20').text().trim();

										result[k] = v;
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, params_selector);

					items[j].params = params;








					let docs_cont = '.content-wrapper-new .rich-docs';
					let docs_selector = docs_cont + ' a';

					await page.waitForSelector(docs_cont);

					let docs = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);

										result.push({
											href : item.attr('href') || '',
											title : item.text().trim(),
										});
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, docs_selector);

					items[j].docs = docs;











					let plan_cont = '.content-wrapper-new #planirovki_fontany.section-wrap';
					let plan_selector = plan_cont + ' .w-tab-pane[data-w-tab] .room-all-wrapper .w-dyn-item a';

					await page.waitForSelector(plan_cont);

					let plans = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);
										let cont = item.closest('.w-tab-pane[data-w-tab]');

										let info = item.find('.room-opis-wrapper');

										result.push({
											href : item.attr('href') || null,
											title : info.find('.kv-price-k').text().trim(),
											area : info.find('.kv-prce .h-card-etap').text().trim(),
											cat : cont.attr('data-w-tab') || 0,
										});
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, plan_selector);

					items[j].plans = plans;



				}

				app.saveJSON('crawler/results/' + argv.sc + '/' + step, items);

			}

		}
		break;

		case 2 : {

			let items = app.loadJSON('crawler/results/' + argv.sc + '/1');

			if(items && items.length) {

				for(let j in items) {

					var item = items[j];

					if(item.plans && item.plans.length) {

						for(var pi = 0; pi < item.plans.length; pi++) {

							var plan = item.plans[pi];

							await page.goto(azbn.mdl('bconfig').site.path.root + plan.href, {
								//waitUntil : 'load',
								waitUntil : 'domcontentloaded',
							});
							
							if(azbn.mdl('bconfig').puppeteer.includes.scripts) {
								
								for(var i in azbn.mdl('bconfig').puppeteer.includes.scripts) {
									
									await page.mainFrame().addScriptTag(azbn.mdl('bconfig').puppeteer.includes.scripts[i]);
									
								}
								
							}

							let image_cont = '.content-wrapper-new div .wrap';
							let image_selector = image_cont + ' img.image-159:nth-child(1)';
							
							await page.waitForSelector(image_cont);

							let image = await page.evaluate(resultsSelector => {
						
								let result = null;
				
								if(jQuery) {
									(function($){
				
										var items = $(resultsSelector);
				
										if(items.length) {
				
											items.each(function(index){
				
												let item = $(this);

												result = item.attr('src') || null;;
				
											});
				
										}
				
									})(jQuery);
								}
								
								return result;
				
							}, image_selector);

							item.plans[pi].img = image;

						}

					}

				}

				app.saveJSON('crawler/results/' + argv.sc + '/' + step, items);

			}

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