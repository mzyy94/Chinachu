(function() {
	
	switch (request.type) {
		case 'json':
			var programs = [];
			
			data.schedule.forEach(function(ch) {
				programs = programs.concat(ch.programs);
			});
			
			response.head(200);
			response.end(JSON.stringify(programs, null, '  '));
			return;
		case 'xml':
			var xmlData = "";
			xmlData += '<?xml version="1.0" encoding="UTF-8"?>\n'
			xmlData += '<!DOCTYPE tv SYSTEM "xmltv.dtd">\n\n'
			xmlData += '<tv generator-info-name="tsEPG2xml" generator-info-url="http://192.168.100.60:10772/api/schedule/programs.xml">\n'
			
			data.schedule.forEach(function(ch) {
				xmlData += '  <channel id="' + ch.id + '" tp="' + ch.channel + '">\n'
				xmlData += '    <display-name lang="ja_JP">' + ch.name + '</display-name>\n'
				xmlData += '    <service_id>' + ch.sid + '</service_id>\n'
				xmlData += '  </channel>\n'
				ch.programs.forEach(function(prog) {
					var s = new Date(prog.start)
					var e = new Date(prog.end)
					var startDate = "" + s.getFullYear() + ("0" + (s.getMonth() + 1)).slice(-2) + ("0" + s.getDate()).slice(-2) +
						("0" + s.getHours()).slice(-2) + ("0" + s.getMinutes()).slice(-2) + ("0" + s.getSeconds()).slice(-2);
					var endDate = "" + e.getFullYear() + ("0" + (e.getMonth() + 1)).slice(-2) + ("0" + e.getDate()).slice(-2) +
						("0" + e.getHours()).slice(-2) + ("0" + e.getMinutes()).slice(-2) + ("0" + e.getSeconds()).slice(-2);
					xmlData += '  <programme start="' + startDate + ' +0900" stop="' + endDate + ' +0900" channel="' + prog.channel.id + '" event_id="' + prog.id + '">\n'
					xmlData += '    <title lang="ja_JP">' + prog.fullTitle.replace(/</g,'＜').replace(/>/g,'＞').replace(/&/g, '＆') + '</title>\n'
					xmlData += '    <desc lang="ja_JP">' + prog.detail.replace(/</g,'＜').replace(/>/g,'＞').replace(/&/g, '＆') + '</desc>\n'
					xmlData += '    <category lang="ja_JP">' + prog.category + '</category>\n'
					xmlData += '    <category lang="en">' + prog.category + '</category>\n'
					xmlData += '  </programme>\n'
				});
			});
			xmlData += '</tv>'
			
			response.head(200);
			response.end(xmlData);
			return;
	}

})();
