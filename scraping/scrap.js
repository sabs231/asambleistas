var request = require('request');
var cheerio = require('cheerio');
var XRegExp = require('xregexp').XRegExp;
var re = new XRegExp('\\p{L}+\.$');
var w = new XRegExp('(\\p{L}+)\\p{P}*\\p{Z}*\\p{P}*\\p{Z}*');
var match;

var url = 'http://www.asambleanacional.gob.ec/asambleistas-por-orden-alfabetico.html';
request(url, function(err, resp, body) {
	if (err) {
		console.log(err);
		throw err;
	}
	$ = cheerio.load(body);
	$('tr.efecto-asamblea').each(function(index, value) {
		var name = $(this).find("span span strong").text().trim();
		if (!name)
			name = $(this).find("span strong").text().trim();
		var repre = "Representante:";
		var fono = "fono:";
		var mail = "E-mail:";
		var party;
		var str = $(this).text();
		var res = str.split("\r\n");
		for (var i = 0; i < res.length; i++)
		{
			var rindex = res[i].search("Representante:");
			var tindex = res[i].search("fono:");
			var eindex = res[i].search("E-mail:");
			if (res[i].search(/\.$/ig) != -1)
			{
				var pos = 0;
				var result = [];
				while (match = XRegExp.exec(res[i], w, pos, 'sticky'))
				{
					result.push(match[1]);
					pos = match.index + match[0].length;
				}
				party = result.join(" ");
			}
			if (rindex != -1)
				var place = res[i].substr(rindex + repre.length);
			if (tindex  != -1)
				var phone = res[i].substr(tindex + fono.length);
			if (eindex != -1)
				var mail = res[i].substr(eindex + mail.length);
		}
	  if (!party)
			party = $(this).find("td td p:first-child span").text().trim();
		if (name)
		{
			console.log("<--------------------->");
			console.log("Name: " + name);
		}
		if (place)
			console.log("Place: " + place.trim());
		if (phone)
			console.log("Phone: " + phone.trim());
		if (mail != "E-mail:")
			console.log("E-mail: " + mail.trim());
		if (party)
			console.log("Party: " + party);
		console.log("<--------------------->");
	});
});

