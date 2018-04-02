'use strict';

const url = require('url');
const path = require('path');

var _ = function(app, p) {
	
	var azbn = app.azbn;
	
	var ctrl = {
		
		getPathname : function(href) {
			
			var _href = url.parse(href || '');
			
			return _href.pathname;
			
		},
		
		getBasename : function(href) {
			
			return path.basename(ctrl.getPathname(href));
			
		},
		
		getExt : function(href) {
			
			var parsed = path.parse(ctrl.getBasename(href));
			
			parsed.ext = parsed.ext || '.html';
			if(parsed.ext == '') {
				parsed.ext = '.html';
			}
			
			return parsed.ext;
			
		},
		
		buildPathByUrl : function(href) {
			
			var res = null;
			
			if(href && href != '') {
				
				var _href = url.parse(href || '');
				
				var _path = 'sites/' + _href.host + _href.pathname;
				
				app.mkDataDir(_path);
				
				res = _path;
				
			}
			
			return res;
			
		},
		
		saveContent : function(href, content) {
			
			if(href && content && href != '' && content != '') {
				
				var _path = ctrl.buildPathByUrl(href);
				
				var _ft = azbn.formattime();
				
				app.saveFile(_path + '/body.' + azbn.formattime() + '.html', body);
				
			}
			
		},
		
		saveHeaders : function(href, headers) {
			
			if(href && headers && href != '') {
				
				var _path = ctrl.buildPathByUrl(href);
				
				var _ft = azbn.formattime();
				
				app.saveJSON(_path + '/headers.' + azbn.formattime(), headers);
				
			}
			
		},
		
		saveData : function(href, data) {
			
			if(href && data && href != '') {
				
				var _path = ctrl.buildPathByUrl(href);
				
				var _ft = azbn.formattime();
				
				app.saveJSON(_path + '/data.' + azbn.formattime(), data);
				
			}
			
		},
		
	};
	
	return ctrl;
	
};

module.exports = _;