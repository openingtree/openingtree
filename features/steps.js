const { MAFWhen, performJSONObjectTransform } = require('@ln-maf/core')
MAFWhen('convert pgn {jsonObject} to json', function(obj) {
    var obj=performJSONObjectTransform.call(this, obj)
    const pgnParser=require('../src/app/PGNParser')
    var res=pgnParser.parse(obj)
    return res
})
global.FileReader=require('filereader')
MAFWhen('load single pgn from {jsonObject}', function(obj) {
    var obj=performJSONObjectTransform.call(this, obj)
    var Chess=require('chess.js').Chess
    chess=new Chess();
    console.log(JSON.stringify(chess.load_pgn(obj)))
    console.log(JSON.stringify(chess.history({verbose: true})))

    console.log(chess.history())
    return chess
})
MAFWhen('load pgn file {string}', function(obj) {
    console.log(File)
    var Constants=require('../dist/app/Constants')

    var MakeFile=require('file-api').File
    var filters=[Constants.TIME_CONTROL_ULTRA_BULLET, Constants.TIME_CONTROL_BULLET,
        Constants.TIME_CONTROL_BLITZ, Constants.TIME_CONTROL_RAPID,
        Constants.TIME_CONTROL_CORRESPONDENCE, Constants.TIME_CONTROL_DAILY,
        Constants.TIME_CONTROL_CLASSICAL, Constants.FILTER_NAME_RATED,
        Constants.FILTER_NAME_DOWNLOAD_LIMIT,
        Constants.FILTER_NAME_ELO_RANGE, Constants.FILTER_NAME_OPPONENT,
        Constants.FILTER_NAME_FROM_DATE, Constants.FILTER_NAME_TO_DATE]

    // var obj=performJSONObjectTransform.call(this, obj)
    var PGNReader=require('../dist/app/PGNReader')
    const { player, color} = this.results
    console.log(obj)
    var file=new MakeFile(obj)
    var reader=new PGNReader.default([])
    var gamesProcessed=0;
    function updateProcessedGames(downloadLimit, n, parsedGame) {
        gamesProcessed+=n
        console.log(gamesProcessed)
        // continue to download games if
        // 1. we have not reached download limit OR
        //    there is no download limit set (downloadLimit>MAX condition)
        // 2. user did not hit stop button
        return new Promise(resolve => {
            resolve(true);
          });
        
    }
    
    reader.fetchPGNFromSite(player, color, "pgnfile", null,null,null,null,filters,updateProcessedGames,null,null,[file],null,null)
    return "hi"
})

