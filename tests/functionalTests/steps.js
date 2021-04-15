const { MAFWhen, performJSONObjectTransform } = require('@ln-maf/core')
var { setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(60 * 1000);

MAFWhen('convert pgn {jsonObject} to json', function (obj) {
    var obj = performJSONObjectTransform.call(this, obj)
    const pgnParser = require('../src/app/PGNParser')
    var res = pgnParser.parse(obj)
    return res
})
global.FileReader = require('filereader')
global.Chess = require('chess.js').Chess
MAFWhen('load single pgn from {jsonObject}', function (obj) {
    var obj = performJSONObjectTransform.call(this, obj)
    var Chess = require('chess.js').Chess
    chess = new Chess();
    return chess
})
MAFWhen('load pgn {jsonObject}', async function (obj) {
    var Constants = require('../../dist/app/Constants')
    var obj = performJSONObjectTransform.call(this, obj)
    const fs = require('fs')
    fs.writeFileSync('test_tmp.pgn', obj, 'utf8')
    var MakeFile = require('@davidwu226/file-api').File
    var filters = [Constants.TIME_CONTROL_ULTRA_BULLET, Constants.TIME_CONTROL_BULLET,
    Constants.TIME_CONTROL_BLITZ, Constants.TIME_CONTROL_RAPID,
    Constants.TIME_CONTROL_CORRESPONDENCE, Constants.TIME_CONTROL_DAILY,
    Constants.TIME_CONTROL_CLASSICAL, Constants.FILTER_NAME_RATED,
    Constants.FILTER_NAME_DOWNLOAD_LIMIT,
    Constants.FILTER_NAME_ELO_RANGE, Constants.FILTER_NAME_OPPONENT,
    Constants.FILTER_NAME_FROM_DATE, Constants.FILTER_NAME_TO_DATE]

    // var obj=performJSONObjectTransform.call(this, obj)
    var PGNReader = require('../../dist/app/PGNReader')
    const { numGames, player, color } = this.results
    var file = new MakeFile('test_tmp.pgn')
    var reader = new PGNReader.default([])
    var gamesProcessed = 0;
    var prom = {

    }
    prom.p = new Promise(resolve => {
        prom.resolve = resolve
    })
    function updateProcessedGames(downloadLimit, n, parsedGame) {
        gamesProcessed += n
        var res = true
        if (gamesProcessed >= numGames) {
            res = false;
            prom.resolve(true)

        }
        // continue to download games if
        // 1. we have not reached download limit OR
        //    there is no download limit set (downloadLimit>MAX condition)
        // 2. user did not hit stop button
        return new Promise(resolve => {
            resolve(res);
        });

    }

    reader.fetchPGNFromSite(player, color, "pgnfile", null, null, null, null, filters, updateProcessedGames, null, null, [file], null, null)
    await prom.p
    return "done"
})

