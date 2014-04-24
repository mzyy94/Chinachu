(function() {
	
	var program = chinachu.getProgramById(request.param.id, data.schedule);
	
	if (program === null) return response.error(404);
	
	switch (request.method) {
		case 'GET':
			response.head(200);
			response.end(JSON.stringify(program, null, '  '));
			return;
		
		case 'PUT':
			var time, tuner, liveCmd, liveProc, finalize;
	
//			util.log('LIVE: ' + dateFormat(new Date(program.start), 'isoDateTime') + ' [' + program.channel.name + '] ' + program.title);

			time = program.end - new Date().getTime();

			if (time < 0) {
//				util.log('FATAL: 時間超過によるリアルタイム視聴中止');
				response.error(503);
				return;
			}

			// チューナーを選ぶ
			tuner = chinachu.getFreeTunerSync(config.tuners, program.channel.type);

			// チューナーが見つからない
			if (tuner === null) {
//				util.log('WARNING: ' + program.channel.type + ' 利用可能なチューナーが見つかりません (存在しないかロックされています)');
				response.error(503);
				return;
			}

			// チューナーをロック
			try {
				chinachu.lockTunerSync(tuner);
			} catch (e) {
//				util.log('WARNING: チューナー(' + tuner.n + ')のロックに失敗しました');
				response.error(503);
				return;
			}
//			util.log('LOCK: ' + tuner.name + ' (n=' + tuner.n + ')');

			program.tuner = tuner;

			// 録画コマンド
			liveCmd = tuner.livecommand;
			liveCmd = liveCmd.replace('<sid>', program.channel.sid);
			liveCmd = liveCmd.replace('<channel>', program.channel.channel);
			liveCmd = liveCmd.replace('<time>', parseInt(time / 1000));
			liveCmd = liveCmd.replace('<addr>', request.connection.remoteAddress.split(':').pop());
			liveCmd = liveCmd.replace('<port>', '9939');

			// 録画プロセスを生成
			liveProc = child_process.spawn(liveCmd.split(' ')[0], liveCmd.replace(/[^ ]+ /, '').split(' '));
//			util.log('SPAWN: ' + liveCmd + ' (pid=' + liveProc.pid + ')');
			if (!liveProc.pid) {
				response.error(503);
				return;
			}
			
			program.pid = liveProc.pid;

			// ログ出力
			liveProc.stderr.on('data', function (data) {
//				util.log('#' + (liveCmd.split(' ')[0] + ': ' + data).replace(/\n/g, ' ').trim());
			});


			// お片付け
			finalize = function () {
				var i, l, postProcess;

				liveProc.stdout.removeAllListeners();

				// チューナーのロックを解除
				try {
					chinachu.unlockTunerSync(tuner);
//					util.log('UNLOCK: ' + tuner.name + ' (n=' + tuner.n + ')');
				} catch (e) {
//					util.log(e);
				}

				finalize = null;
			};
			// 録画プロセス終了時処理
			liveProc.on('exit', finalize);

			response.head(200);
			response.end(JSON.stringify(tuner));
			return;
	}

})();
