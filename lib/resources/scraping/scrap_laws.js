var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var util = require('util');

var url2014 = 'http://www.asambleanacional.gob.ec/tramite-de-las-leyes.html#ancla2014';
var url2013 = 'http://www.asambleanacional.gob.ec/tramite-de-las-leyes-2013.html#ancla2013';
var url2012 = 'http://www.asambleanacional.gob.ec/legislacion/tramite-de-leyes/tramite-de-leyes-2012.html#ancla2012';
var url2011 = 'http://www.asambleanacional.gob.ec/legislacion/tramite-de-leyes/tramite-de-leyes-2011.html#ancla2011';
var url2010 = 'http://www.asambleanacional.gob.ec/legislacion/tramite-de-leyes/tramite-de-leyes-2010.html#ancla2010';
var url2009 = 'http://www.asambleanacional.gob.ec/legislacion/tramite-de-leyes/tramite-de-leyes-2009.html#ancla2009';

var makeJsonObject = function(date, title, originalText, author, stat, object) {
	object += 	'{ "date" : "' + date + '", ' +
							'"title" : "' + title + '", ' +
							'"author" : "' + author + '", ' +
							'"project" : { "date" : "' + date + '", "url" : "' + originalText + '" }, ';
	if (stat[0] != "" || typeof stat[0] != 'undefined')
		object += '"CAL" : { "date" : "' + date + '", "url" : "' + stat[0] + '" }, ';
	else
		object += '"CAL" : { "date" : "", "url" : "" }, ';
	if (stat[1] != "" || typeof stat[1] != 'undefined')
		object += '"FirstDebate" : { "date" : "' + date + '", "url" : "' + stat[1] + '" }, ';
	else
		object += '"FirstDebate" : { "date" : "", "url" : "" }, ';
	if (stat[2] != "" || typeof stat[2] != 'undefined')
		object += '"SecondDebate" : { "date" : "' + date + '", "url" : "' + stat[2] + '" }, ';
	else
		object += '"SecondDebate" : { "date" : "", "url" : "" }, ';
	if (stat[3] != "" || typeof stat[3] != 'undefined')
		object += '"HouseApproval" : { "date" : "' + date + '", "url" : "' + stat[3] + '" }, ';
	else
		object += '"HouseApproval" : { "date" : "", "url" : "" }, ';
	if (stat[4] != "" || typeof stat[4] != 'undefined')
		object += '"ParcialOBJ" : { "date" : "' + date + '", "url" : "' + stat[4] + '" }, ';
	else
		object += '"ParcialOBJ" : { "date" : "", "url" : "" }, ';
	if (stat[5] != "" || typeof stat[5] != 'undefined')
		object += '"TotalOBJ" : { "date" : "' + date + '", "url" : "' + stat[5] + '" }, ';
	else
		object += '"TotalOBJ" : { "date" : "", "url" : "" }, ';
	if (stat[6] != "" || typeof stat[6] != 'undefined')
		object += '"DefinitiveText" : { "date" : "' + date + '", "url" : "' + stat[6] + '" }, ';
	else
		object += '"DefinitiveText" : { "date" : "", "url" : "" }, ';
	if (stat[7] != "" || typeof stat[7] != 'undefined')
		object += '"OfficialRegistry" : { "date" : "' + date + '", "url" : "' + stat[7] + '" } }\n';
	else
		object += '"OfficialRegistry" : { "date" : "", "url" : "" } }\n';
	return (object);
}

// this is for year 2014 and part of 2013
var tableScrap = function(stat, body, index, value, my_this) {
	$ = cheerio.load(body);
		var date = $(my_this).find('td div.mep_fecha_proyecto span.mep_date').text().trim();
		var title = $(my_this).find('td div.mep_estado div.mep_title a span').text().trim();
		var originalText = $(my_this).find('td td div a').attr('href');
		var author = $(my_this).find('td div div.mep_autor').text().trim();
		var cell = $(my_this).find('tr');
		var children = $(cell).children();
		var i = 0;
		$(children).each(function(index, value) {
			if (index > 3)
			{
				stat[i] = $(this).find('td a').attr('href');
				i++;
			}
		});
		if (date && title && author && originalText)
		{
			var object = '';
			object = makeJsonObject(date, title, originalText, author, stat, object);
			fs.appendFile('asam_laws.json', object, function(err) {
				if (err)
					return (console.log(err));
			});
		}
}

// this is for years 2012, 2011, 2010 and 2009
var singleTableScrap = function(stat, body) {
	$('tbody.mep_tablebody tr').each(function(index, value) {
		var date = $(this).find('td div.mep_fecha_proyecto span.mep_date').text().trim();
		var title = $(this).find('td div.mep_estado div.mep_title a').text().trim();
		var author = $(this).find('td div div.mep_autor').text().trim();
		var originalText = $(this).find('td td div a').attr('href');
		var children = $(this).children();
		var i = 0;
		$(children).each(function(otherIndex, otherValue) {
			if (otherIndex > 3)
			{
				stat[i] = $(this).find('td a').attr('href');
				i++;
			}
		});
		if (date && title && author && originalText)
		{
			var object = '';
			object = makeJsonObject(date, title, originalText, author, stat, object);
			fs.appendFile('asam_laws.json', object, function(err) {
				if (err)
					return (console.log(err));
			});
		}
	});
}

//********************************************** 2014 *******************************//
//request(url2014, function(err, resp, body) {
//	if (err)
//	{
//		console.log(err);
//		throw (err);
//	}
//	var stat = [];
//	$ = cheerio.load(body);
//	$('tbody.mep_tablebody').each(function(index, value) {
//		var my_this = this;
//		tableScrap(stat, body, index, value, my_this);
//	});
//});
//********************************************** 2014 *******************************//

//********************************************** 2013 *******************************//
//request(url2013, function(err, resp, body) {
//	if (err)
//	{
//		console.log(err);
//		throw (err);
//	}
//	var stat = [];
//	$ = cheerio.load(body);
//	$('tbody.mep_tablebody').each(function(index, value) {
//		var my_this = this;
//		if (index < 26)
//			tableScrap(stat, body, index, value, my_this);
//		else if (index === 26)
//		{
//			var cell = $(this).find('tr.mep_row_1');
//			$(cell).each(function(innerIndex, innerValue) {
//				var date = $(this).find('td div.mep_fecha_proyecto span.mep_date').text().trim();
//				var title = $(this).find('td div.mep_estado div.mep_title a span').text().trim();
//				if (innerIndex === 1)
//					title = $(this).find('td div.mep_estado div.mep_title a').text().trim();
//				var author = $(this).find('td div div.mep_autor').text().trim();
//				var originalText = $(my_this).find('td td div a').attr('href');
//				var innerCell = $(this).find('tr');
//				var children = $(innerCell).children();
//				var i = 0;
//				$(children).each(function(otherIndex, otherValue) {
//					if (otherIndex > 3)
//					{
//						stat[i] = $(this).find('td a').attr('href');
//						i++;
//					}
//				});
//				if (date && title && author && originalText)
//				{
//					var object = '';
//					object = makeJsonObject(date, title, originalText, author, stat, object);
//					fs.appendFile('asam_laws.json', object, function(err) {
//						if (err)
//						return (console.log(err));
//					});
//				}
//			});
//		}
//		else if (index === 27)
//			tableScrap(stat, body, index, value, my_this);
//		else if (index === 28)
//		{
//			var otherTable = $(this).find('tr');
//			$(otherTable).each(function(innerIndex, innerValue) {
//				var date = $(this).find('td div.mep_fecha_proyecto span.mep_date').text().trim();
//				var title;
//				if (innerIndex < 2)
//					title = $(this).find('td div.mep_estado div.mep_title a span').text().trim();
//				else
//					title = $(this).find('td div.mep_estado div.mep_title a').text().trim();
//				var author = $(this).find('td div div.mep_autor').text().trim();
//				var originalText = $(my_this).find('td td div a').attr('href');
//				var children = $(this).children();
//				var i = 0;
//				$(children).each(function(otherIndex, otherValue) {
//					if (otherIndex > 3)
//					{
//						stat[i] = $(this).find('td a').attr('href');
//						i++;
//					}
//				});
//				if (date && title && author && originalText)
//				{
//					var object = '';
//					object = makeJsonObject(date, title, originalText, author, stat, object);
//					fs.appendFile('asam_laws.json', object, function(err) {
//						if (err)
//						return (console.log(err));
//					});
//				}
//			});
//		}
//	});
//});
//********************************************** 2013 *******************************//
//
////********************************************** 2012 *******************************//
//request(url2012, function(err, resp, body) {
//	if (err)
//	{
//		console.log(err);
//		throw (err);
//	}
//	$ = cheerio.load(body);
//	var stat = [];
//	singleTableScrap(stat, body);
//});
////********************************************** 2012 *******************************//
//
////********************************************** 2011 *******************************//
//request(url2011, function(err, resp, body) {
//	if (err)
//	{
//		console.log(err);
//		throw (err);
//	}
//	$ = cheerio.load(body);
//	var stat = [];
//	singleTableScrap(stat, body);
//});
////********************************************** 2011 *******************************//
//
////********************************************** 2010 *******************************//
//request(url2010, function(err, resp, body) {
//	if (err)
//	{
//		console.log(err);
//		throw (err);
//	}
//	$ = cheerio.load(body);
//	var stat = [];
//	singleTableScrap(stat, body);
//});
////********************************************** 2010 *******************************//
//
////********************************************** 2009 *******************************//
request(url2009, function(err, resp, body) {
	if (err)
	{
		console.log(err);
		throw (err);
	}
	$ = cheerio.load(body);
	var stat = [];
	singleTableScrap(stat, body);
});
////********************************************** 2009 *******************************//
