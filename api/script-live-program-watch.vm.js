(function() {
	
	var program = chinachu.getProgramById(request.param.id, data.schedule);
	
	if (program === null) return response.error(404);
	
	if (!data.status.feature.streamer) return response.error(403);
	
	if (program.tuner && program.tuner.isScrambling) return response.error(409);
	
	switch (request.type) {
		case 'txt'://for debug
		case 'xspf':
			response.setHeader('content-disposition', 'attachment; filename="' + program.id + '.xspf"');
			response.head(200);
			
			response.write('<?xml version="1.0" encoding="UTF-8"?>\n');
			response.write('<playlist version="1" xmlns="http://xspf.org/ns/0/">\n');
			response.write('<trackList>\n');
			response.write('<track>\n<location>' + 'udp://@:9939' + '</location>\n');
			response.write('<title>' + program.title + '</title>\n</track>\n');
			response.write('</trackList>\n');
			response.write('</playlist>\n');
			
			response.end();
			return;
		
	}//<--switch

})();
