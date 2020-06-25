import Chess from 'chess.js'
import LichessIterator from './iterator/LichessIterator'
import ChessComIterator from './iterator/ChessComIterator'
import PGNFileIterator from './iterator/PGNFileIterator'
import * as Constants from './Constants'
import NotablePlayerIterator from './iterator/NotablePlayerIterator'
import { expose } from 'comlink'

export default class PGNReader {
    constructor() {
        this.totalGames = 0;
        this.pendingGames = 0;
        this.pendingDownloads = true;
    }



    fetchPGNFromSite(playerName, playerColor, site, selectedNotablePlayer,
        selectedNotableEvent, shouldDownloadToFile, advancedFilters, notify, 
        showError, stopDownloading, files, downloadResponse, tokens) {
        this.continueProcessingGames = true
        
        let handleResponse = (result, pendingDownloads) => {
            if(!result) {
                return this.continueProcessingGames
            }
            this.totalGames += result.length
            this.pendingGames += result.length
            this.pendingDownloads = pendingDownloads
            

            setTimeout(() => {
                this.parsePGNTimed(site, result, 0, advancedFilters, playerColor, playerName, notify, showError, stopDownloading)
            } ,1)
            return this.continueProcessingGames
        }
        let processor = shouldDownloadToFile? downloadResponse: handleResponse
        if (site === Constants.SITE_LICHESS) {
            new LichessIterator(tokens.lichess, playerName, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_CHESS_DOT_COM) {
            new ChessComIterator(playerName, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_PGN_FILE) {
            new PGNFileIterator(playerName, files, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_PLAYER_DB) {
            new NotablePlayerIterator(selectedNotablePlayer, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_EVENT_DB) {
            new NotablePlayerIterator(selectedNotableEvent, playerColor, advancedFilters, processor, showError)
        } 
        return 'done'
        
    }

    parsePGNTimed(site, pgnArray, index, advancedFilters, playerColor,  playerName, notify, showError, stopDownloading) {
        if(index< pgnArray.length) {
            this.pendingGames--
        }
        if(!this.pendingDownloads && this.pendingGames <= 0) {
            stopDownloading()
        }

        if(index>= pgnArray.length || !this.continueProcessingGames) {
            return
        }
        var pgn = pgnArray[index]


        if(pgn.moves[0] && pgn.moves[0].move_number === 1) {
            let chess = new Chess()
            let pgnParseFailed = false;
            let parsedMoves = []
            pgn.moves.forEach(element => {
                let sourceFen = chess.fen()
                let move = chess.move(element.move, {sloppy: true})
                let targetFen = chess.fen()
                if(!move){
                    pgnParseFailed=true
                    return
                }
                parsedMoves.push({
                    sourceFen:sourceFen,
                    targetFen:targetFen,
                    moveSan:move.san
                })
            })
            if(pgnParseFailed) {
                console.log('failed to load game ',  pgn)
                showError("Failed to load a game", `${playerName}:${playerColor}`)
            } else {
                let fen = chess.fen()
                let parsedPGNDetails = {
                    pgnStats:this.gameResult(pgn,site),
                    parsedMoves:parsedMoves,
                    latestFen:fen,
                    playerColor:playerColor
                }
                notify(advancedFilters[Constants.FILTER_NAME_DOWNLOAD_LIMIT],1, parsedPGNDetails).then((continueProcessingGames)=>{
                    this.continueProcessingGames = continueProcessingGames
                })
            }
        }
        setTimeout(()=>{this.parsePGNTimed(site, pgnArray, index+1, advancedFilters, playerColor, playerName, notify, showError, stopDownloading)},1)

    }

    gameResult(pgn, site) {
        let url= null 
        if (site === Constants.SITE_CHESS_DOT_COM) {
            url = pgn.headers.Link
        } else if(site === Constants.SITE_LICHESS) {
            url = pgn.headers.Site
        }
        let headers=null
        if(!url) {
            headers = pgn.headers
        }
        return {
            result:pgn.result,
            white:pgn.headers.White,
            black:pgn.headers.Black,
            whiteElo:pgn.headers.WhiteElo,
            blackElo:pgn.headers.BlackElo,
            url:url,
            date:pgn.headers.Date,
            headers:headers
        }
    }
}

expose(PGNReader)