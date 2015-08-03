(function(module) {
    "use strict";

	var MarkdownToc = {},
		cheerio = require('cheerio');

	MarkdownToc.parse = function(data, callback) {
		var postContent = data.postData.content;
		var titleRegexp = /<h(.)>(.*?)<\/h(.)>/gm;
		var tocRegexp = /\[toc\]/mg;

		var titles = postContent.match(titleRegexp);
		var toc = postContent.match(tocRegexp);

		if(titles && titles.length && toc && toc.length) {

			var tocContent = '<div class="toc">';
			var ids = [];
			var uls = {};
			var parentNode = '';
			var parentObject = {};
			var $ = cheerio.load('<div class="toc"></div>');
			titles.forEach(function (title) {
				var str = title.replace(titleRegexp, '{"num":"$1","id":"$2"}');
				var object = JSON.parse(str);
				var id = object.id;
				var current = '';
				if(ids.indexOf(object.id) != -1) {
					id = object.id+'-'+ids.length;
				}
				ids.push(id);

				postContent = postContent.replace(title, '<h'+object.num+' id="'+id+'">'+object.id+'</h'+object.num+'>');

				var li = '<li><a href="#' + id + '">' + object.id + '</a></li>';
				var i = 1;

				if(!parentNode) {
					$('div').append('<ul></ul>');
					parentNode = $('div').children().first();
					while(i<object.num) {
						parentNode.append('<ul></ul>');
						parentNode = parentNode.children().last();
						i++;
					}
					parentNode.append(li);
					parentNode = parentNode.children().last();
				}else if(parentObject.num == object.num) {
					parentNode.append(li);
					parentNode = parentNode.children().last();
				}else{
					parentNode = $('div').children().first();
					while(i<object.num){
						parentNode.append('<ul></ul>');
						parentNode = parentNode.children().last();
						i++;
					}
					parentNode.append(li);
				}

				parentObject = object;

			});

			postContent = postContent.replace(tocRegexp, $.html());

			data.postData.content = postContent;
		}

        callback(null, data);
    };

    module.exports = MarkdownToc;
}(module));