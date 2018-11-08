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

			await page.goto(azbn.mdl('bconfig').site.path.root + '/novostrojki/', {
				//waitUntil : 'load',
				waitUntil : 'domcontentloaded',
			});

			chalk.green('domcontentloaded');

			if(azbn.mdl('bconfig').puppeteer.includes.scripts) {
				
				for(var i in azbn.mdl('bconfig').puppeteer.includes.scripts) {
					
					await page.mainFrame().addScriptTag(azbn.mdl('bconfig').puppeteer.includes.scripts[i]);
					
				}
				
			}

			let items_cont = '.novostrojki-list .owl-stage';
			let items = items_cont + ' .owl-item a.novostrojki-list-item';

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
									
									//let p = item.parent().get(0).style.backgroundImage.match(/^url\("(.*)"\)$/);
									//let img = p && p[1] || '';

									result.push({
										href : href,
										title : (item.find('h2').text()).trim().replace(/[«»\"\']/gim, ''),
										adr : (item.find('ul li:nth-child(2)').text()).trim(),
										final : (item.find('ul li:nth-child(3)').text()).trim(),
										cost : (item.find('ul li.novostrojki-list-item-price span').text()).trim().replace(/[^0-9]/gim, ''),
										img : '',
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

					await page.goto(item.href, {//azbn.mdl('bconfig').site.path.root + 
						//waitUntil : 'load',
						waitUntil : 'domcontentloaded',
					});
					
					if(azbn.mdl('bconfig').puppeteer.includes.scripts) {
						
						for(var i in azbn.mdl('bconfig').puppeteer.includes.scripts) {
							
							await page.mainFrame().addScriptTag(azbn.mdl('bconfig').puppeteer.includes.scripts[i]);
							
						}
						
					}

					let images_cont = '.single-novostrojki-about .single-novostrojki-about-slider';
					let images_selector = images_cont + ' .owl-stage .owl-item img';
					
					await page.waitForSelector(images_cont);

					let images = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);

										//let p = item.get(0).style.backgroundImage.match(/^url\("(.*)"\)$/);
										//let img = p && p[1] || '';

										let img = item.attr('src') || '';

										if(img != '') {
											result.push(img);
										}

									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, images_selector);

					items[j].slider = images;



					let content_cont = '.single-novostrojki-about .single-novostrojki-about-wrapper';
					let content_selector = content_cont + ' .single-novostrojki-about-text';

					await page.waitForSelector(content_cont);

					let content = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);

										result.push(item.html().trim());
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, content_selector);

					items[j].content = content;





					let params_cont = '.single-novostrojki-about .single-novostrojki-description';
					let params_selector = params_cont + ' .single-novostrojki-about-item';

					await page.waitForSelector(params_cont);

					let params = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);

										let img = item.find('img').attr('src') || '';

										let k = item.find('strong').text().trim();
										let v = item.find('p:nth-child(3)').text().trim();

										result.push({
											img : img,
											title : k,
											content : v,
										})
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, params_selector);

					items[j].params = params;








					let docs_cont = '#docs .documentation-list';
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
											title : item.text().trim().replace(/[«»\"\']/gim, ''),
										});
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, docs_selector);

					items[j].docs = docs;







					let plan_cont = '.single-novostrojki-layout .single-novostrojki-layout-wrap';
					let plan_selector = plan_cont + ' .single-novostrojki-layout-item';

					await page.waitForSelector(plan_cont);

					let plans = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);
										//let cont = item.closest('.w-tab-pane[data-w-tab]');

										//let info = item.find('.room-opis-wrapper');

										result.push({
											//href : item.attr('href') || null,
											img : item.find('.owl-stage .owl-item a.fancybox').attr('href') || '',
											title : item.children('h3').text().trim(),
											area : ((item.find('.owl-stage .owl-item h3').text().trim()).split(' '))[1],
											cost : item.find('p span').text().trim().replace(/[^0-9]/gim, ''),
											//cat : cont.attr('data-w-tab') || 0,
										});
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, plan_selector);

					items[j].plans = plans;






					let photo_cont = '#progress';
					let photo_page_selector = photo_cont + ' .latest-news .latest-news-content h2 a';

					await page.waitForSelector(photo_cont);

					let photo_pages = await page.evaluate(resultsSelector => {
				
						let result = [];
		
						if(jQuery) {
							(function($){
		
								var items = $(resultsSelector);
		
								if(items.length) {
		
									items.each(function(index){
		
										let item = $(this);
										//let cont = item.closest('.w-tab-pane[data-w-tab]');

										//let info = item.find('.room-opis-wrapper');

										result.push({
											href : item.attr('href') || '',
											title : item.text().trim(),
											photos : [],
											//cat : cont.attr('data-w-tab') || 0,
										});
		
									});
		
								}
		
							})(jQuery);
						}
						
						return result;
		
					}, photo_page_selector);

					items[j].photo_pages = photo_pages;




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

					if(item.photo_pages && item.photo_pages.length) {

						for(let k = 0; k < item.photo_pages.length; k++) {

							let photo_page = item.photo_pages[k];

							if(photo_page.href != '') {

								await page.goto(photo_page.href, {//azbn.mdl('bconfig').site.path.root + 
									//waitUntil : 'load',
									waitUntil : 'domcontentloaded',
								});
								
								if(azbn.mdl('bconfig').puppeteer.includes.scripts) {
									
									for(var i in azbn.mdl('bconfig').puppeteer.includes.scripts) {
										
										await page.mainFrame().addScriptTag(azbn.mdl('bconfig').puppeteer.includes.scripts[i]);
										
									}
									
								}

								let photo_cont = '.single-post .single-post-content';
								let photo_selector = photo_cont + ' a.fancybox';

								await page.waitForSelector(photo_cont);

								let photos = await page.evaluate(resultsSelector => {
							
									let result = [];
					
									if(jQuery) {
										(function($){
					
											var items = $(resultsSelector);
					
											if(items.length) {
					
												items.each(function(index){
					
													let item = $(this);
													//let cont = item.closest('.w-tab-pane[data-w-tab]');

													//let info = item.find('.room-opis-wrapper');
													let src = item.attr('href') || '';

													if(src != '') {
														result.push(src);
													}

												});
					
											}
					
										})(jQuery);
									}
									
									return result;
					
								}, photo_selector);

								items[j].photo_pages[k].photos = photos;

							}

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