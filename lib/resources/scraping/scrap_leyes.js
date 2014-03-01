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

setTimeout(singleTableScrap, 1000);

// Prints the status of the law, we can reach the document by getting the href of the a tag
var makeJsonObject = function(code, date, title, author, stat, object) {
	object += 	"{ 'code' : '" + code + "', " +
							"'date' : '" + date + "', " +
							"'title' : '" + title + "', " +
							"'author' : '" + author + "', ";
	if (stat[0] != "")
		object += "'CAL' : 'SI', ";
	else
		object += "'CAL' : 'NO', ";
	if (stat[1] != "")
		object += "'First Debate' : 'SI', " ;
	else
		object += "'First Debate' : 'NO', ";
	if (stat[2] != "")
		object += "'Second Debate' : 'SI', ";
	else
		object += "'Second Debate' : 'NO', ";
	if (stat[3] != "")
		object += "'Pleno Approval' : 'SI', ";
	else
		object += "'Pleno Approval' : 'NO', ";
	if (stat[4] != "")
		object += "'Parcial OBJ' : 'SI', ";
	else
		object += "'Parcial OBJ' : 'NO', ";
	if (stat[5] != "")
		object += "'Total OBJ' : 'SI', ";
	else
		object += "'Total OBJ' : 'NO', ";
	if (stat[6] != "")
		object += "'Definitive Text' : 'SI', ";
	else
		object += "'Definitive Text' : 'NO', ";
	if (stat[7] != "")
		object += "'Official Registry' : 'SI' }\n";
	else
		object += "'Official Registry' : 'NO' }\n";
	return (object);
}

// this is for years 2014 and 2013
var tableScrap = function(stat, body, index, value, my_this) {
	$ = cheerio.load(body);
		var code = $(my_this).find('td div.mep_codigo span').text().trim();
		var date = $(my_this).find('td div.mep_fecha_proyecto span.mep_date').text().trim();
		var title = $(my_this).find('td div.mep_estado div.mep_title a span').text().trim();
		var author = $(my_this).find('td div div.mep_autor').text().trim();
		var cell = $(my_this).find('tr');
		var children = $(cell).children();
		var i = 0;
		$(children).each(function(index, value) {
			if (index > 3)
			{
				stat[i] = $(this).find('td a');
				i++;
			}
		});
		if (code && date && title && author)
		{
			var object = '';
			object = makeJsonObject(code, date, title, author, stat, object);
			fs.appendFile('asam_laws.json', object, function(err) {
				if (err)
					return (console.log(err));
			});
		}
}

// this is for years 2012, 2011, 2010 and 2009
var singleTableScrap = function(stat, body) {
	$('tbody.mep_tablebody tr').each(function(index, value) {
		var code = $(this).find('td div.mep_codigo span').text().trim();
		if (!code)
			code = $(this).find('td div.mep_codigo').text().trim();
		var date = $(this).find('td div.mep_fecha_proyecto span.mep_date').text().trim();
		var title = $(this).find('td div.mep_estado div.mep_title a').text().trim();
		var author = $(this).find('td div div.mep_autor').text().trim();
		var children = $(this).children();
		var i = 0;
		$(children).each(function(otherIndex, otherValue) {
			if (otherIndex > 3)
			{
				stat[i] = $(this).find('td a');
				i++;
			}
		});
		if (code && date && title && author)
		{
			var object = '';
			object = makeJsonObject(code, date, title, author, stat, object);
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
//(request(url2013, function(err, resp, body) {
//(	if (err)
//(	{
//(		console.log(err);
//(		throw (err);
//(	}
//(	var stat = [];
//(	$ = cheerio.load(body);
//(	$('tbody.mep_tablebody').each(function(index, value) {
//(		var my_this = this;
//(		if (index < 25)
//(			tableScrap(stat, body, index, value, my_this);
//(		else if (index === 25)
//(		{
//(			var cell = $(this).find('tr.mep_row_1');
//(			$(cell).each(function(innerIndex, innerValue) {
//(				var code = $(this).find('td div.mep_codigo span').text().trim();
//(				var date = $(this).find('td div.mep_fecha_proyecto span.mep_date').text().trim();
//(				var title = $(this).find('td div.mep_estado div.mep_title a span').text().trim();
//(				if (innerIndex === 1)
//(					title = $(this).find('td div.mep_estado div.mep_title a').text().trim();
//(				var author = $(this).find('td div div.mep_autor').text().trim();
//(				var innerCell = $(this).find('tr');
//(				var children = $(innerCell).children();
//(				var i = 0;
//(				$(children).each(function(otherIndex, otherValue) {
//(					if (otherIndex > 3)
//(					{
//(						stat[i] = $(this).find('td a');
//(						i++;
//(					}
//(				});
//(				if (code && date && title && author)
//(				{
//(					var object = '';
//(					object = makeJsonObject(code, date, title, author, stat, object);
//(					fs.appendFile('asam_laws.json', object, function(err) {
//(						if (err)
//(						return (console.log(err));
//(					});
//(				}
//(			});
//(		}
//(		else if (index === 26)
//(			tableScrap(stat, body, index, value, my_this);
//(		else if (index === 27)
//(		{
//(			var otherTable = $(this).find('tr');
//(			$(otherTable).each(function(innerIndex, innerValue) {
//(				var code = $(this).find('td div.mep_codigo span').text().trim();
//(				var date = $(this).find('td div.mep_fecha_proyecto span.mep_date').text().trim();
//(				var title;
//(				if (innerIndex < 2)
//(					title = $(this).find('td div.mep_estado div.mep_title a span').text().trim();
//(				else
//(					title = $(this).find('td div.mep_estado div.mep_title a').text().trim();
//(				var author = $(this).find('td div div.mep_autor').text().trim();
//(				var children = $(this).children();
//(				var i = 0;
//(				$(children).each(function(otherIndex, otherValue) {
//(					if (otherIndex > 3)
//(					{
//(						stat[i] = $(this).find('td a');
//(						i++;
//(					}
//(				});
//(				if (code && date && title && author)
//(				{
//(					var object = '';
//(					object = makeJsonObject(code, date, title, author, stat, object);
//(					fs.appendFile('asam_laws.json', object, function(err) {
//(						if (err)
//(						return (console.log(err));
//(					});
//(				}
//(			});
//(		}
//(	});
//(});
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
