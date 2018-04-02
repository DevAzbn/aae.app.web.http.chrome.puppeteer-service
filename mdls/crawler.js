'use strict';

const EventEmitter = require('events');

class Crawler extends EventEmitter {}

const url = require('url');
const path = require('path');

const rpn = require('request-promise-native').defaults({
	headers : {
		'User-Agent' : 'PuppeteerServiceBrowser',
		// 'content-type': 'application/x-www-form-urlencoded' // Is set automatically
	},
});

const cheerio = require('cheerio');

var _ = function(app, p) {
	
	var azbn = app.azbn;
	
	var ctrl = new Crawler();
	
	ctrl.__queue = {};
	
	ctrl.__queue.count = 0;
	
	ctrl.__queue.queue = [];
	
	ctrl.__queue.queue_status = {};
	
	ctrl.__queue.interval = setInterval(function(){
		
		ctrl.emit('nextDoc');
		
	}, azbn.mdl('config').crawler.interval);
	
	ctrl.__queue.add = function(o) {
		
		ctrl.__queue.queue.push(o);
		
		console.log('added', o.href);
		
		/*
		if(ctrl.__queue.queue.length > 0) {
			ctrl.emit('nextDoc');
		}
		*/
		
	}
	
	ctrl.on('addDoc', function(o) {
		
		//var _h = o.href;
		//_h = _h.replace(/^http\:/i, '');
		//_h = _h.replace(/^https\:/i, '');
		//
		//if(!ctrl.__queue.queue_status[_h]) {
			ctrl.__queue.add(o);
		//}
		
	});
	
	ctrl.on('nextDoc', function() {
		
		if(ctrl.__queue.queue.length > 0) {
			
			var doc = ctrl.__queue.queue.shift();
			
			var _h = doc.href;
			_h = _h.replace(/^http\:/i, '');
			_h = _h.replace(/^https\:/i, '');
			
			if(ctrl.__queue.queue_status[_h]) {
				
			} else {
				
				ctrl.__queue.queue_status[_h] = true;
				
				ctrl.emit('findChildrenLinks', doc);
				
			}
			
		}
		
	});
	
	ctrl.on('findChildrenLinks', function(doc) {
		
		console.log('load', doc.href);
		
		rpn({
			method : 'GET',
			uri : doc.href,
			//transform2xxOnly : true,
			transform : function(body, response, resolveWithFullResponse) {
				
				// /^2/.test('' + response.statusCode)
				if(/^2/.test('' + response.statusCode)) {
					
					app.mdl('filemngr').saveContent(doc.href, body);
					app.mdl('filemngr').saveHeaders(doc.href, response.headers);
					
				}
				
				if(/application\/json/.test(response.headers['content-type'])) {
					
					//console.log('json');
					
					return JSON.parse(body);
					
				} else if(/text\/html/.test(response.headers['content-type'])) {
					
					//console.log('html');
					
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
				
				var arr = [];
				
				$('a').each(function(__index, __element) {
					
					var a__href = $(this).attr('href') || '';
					
					if(a__href && a__href != '') {
						arr.push(a__href);
					}
					
				});
				
				ctrl.analizeLinkArray(arr, doc.href);
				
				//console.log('all links');
				
			}
			
		})
		.catch(function(err) {
			
			console.log(err);
			
		})
		;
		
	});
	
	ctrl.analizeLinkArray = function(links, source){
		
		if(links.length) {
			
			for(var i = 0; i < links.length; i++) {
				
				ctrl.analizeLink(links[i], source, function(parsed_link, parent_link) {
					
					var _h = parsed_link;
					_h = _h.replace(/^http\:/i, '');
					_h = _h.replace(/^https\:/i, '');
					
					if(!ctrl.__queue.queue_status[_h]) {
						ctrl.emit('addDoc', {
							source : parent_link,
							href : parsed_link,
						});
					}
					
				});
				
			}
			
		}
		
	}
	
	ctrl.analizeLink = function(href, source, cb) {
		
		//console.log('anal', href);
		
		var res = {
			href : url.parse(href || ''),
			source : url.parse(source || ''),
		};
		
		if(href == 0) {
			
			// пустая ссылка
			
		} else if(res.href.protocol == 'http:' || res.href.protocol == 'https:') {
			
			// абсолютные пути с указанием протокола
			
			if(
				(res.href.hostname == res.source.hostname)
				||
				(('www.' + res.href.hostname) == res.source.hostname)
				||
				(res.href.hostname == ('www.' + res.source.hostname))
				||
				(source == null)
				||
				(source == '')
			) {
				
				var _href = href;
				
				res.href = url.parse(_href);
				
				cb(href, source);
				
			}
			
		} else if(href[0] == '/' && href[1] && href[1] != '/') {
			
			// абсолютный путь на сайте
			
			var _href = url.resolve(res.source.protocol + '//' + res.source.host, href);
			
			res.href = url.parse(_href);
			
			cb(_href, source);
			
		} else if(href[0] == '/' && href[1] == '/') {
			
			// абсолютный путь без протокола
			
			var _href = url.resolve(res.source.protocol, href);
			
			res.href = url.parse(_href);
			
			cb(_href, source);
			
		} else if(href[0] == '#') {
			
			// ссылка-якорь
			
		} else if(app.azbn.inArray(res.href.protocol, ['callto:', 'mailto:', 'skype:', 'tel:', 'javascript:'])) {
			
			// не http-протоколы
			
		} else {
			
			// путь к файлу в той же папке
			
			if(res.source.pathname[res.source.pathname.length - 1] == '/') {
				
				// источник ссылки - папка
				
				var _href = url.resolve(res.source.protocol + '//' + res.source.host + res.source.pathname, href);
				
				res.href = url.parse(_href);
				
				cb(_href, source);
				
			} else {
				
				var _dir = path.dirname(res.source.pathname);
				
				if(_dir.length > 1) {
					
				} else {
					
					_dir = '';
					
				}
				
				// источник ссылки - файл-сосед
				
				var _href = url.resolve(res.source.protocol + '//' + res.source.host + _dir + '/', href);
				
				res.href = url.parse(_href);
				
				cb(_href, source);
				
			}
				
		}
		
	}
	
	return ctrl;
	
};

module.exports = _;