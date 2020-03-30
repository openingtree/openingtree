import {openingGraph} from './OpeningGraph'
import Chess from 'chess.js'
import LichessIterator from './LichessIterator'
import ChessComIterator from './ChessComIterator'
import * as Constants from './Constants'

export default class PGNReader {
    constructor() {
        this.totalGames = 0;
        this.pendingGames = 0;
        this.pendingDownloads = true;
    }
    parsePGN(playerName, playerColor, site, advancedFilters, notify, showError, stopDownloading) {
        this.continueProcessingGames = true
        let handleResponse = (result, pendingDownloads) => {
            if(!result) {
                return this.continueProcessingGames
            }
            this.totalGames += result.length
            this.pendingGames += result.length
            this.pendingDownloads = pendingDownloads
            setTimeout(() => {
                this.parsePGNTimed(result, advancedFilters, playerColor, 0, playerName, notify, showError, stopDownloading)
            } ,1)
            return this.continueProcessingGames
        }
        if(site === Constants.SITE_LICHESS) {
            new LichessIterator(playerName, playerColor, advancedFilters, handleResponse, showError)
        } else if(site === Constants.SITE_CHESS_DOT_COM) {
            new ChessComIterator(playerName, playerColor, advancedFilters, handleResponse, showError)
        }

        
    }

    parsePGNTimed(pgnArray, advancedFilters, playerColor, index,  playerName, notify, showError, stopDownloading) {
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
        let gamePlayerColor = (pgn.headers.White.toLowerCase() === playerName.toLowerCase()) ? "w" : "b"
        if(pgn.moves[0] && pgn.moves[0].move_number === 1) {
            let chess = new Chess()
            let resultObject = this.gameResult(pgn)

            pgn.moves.forEach(element => {
                let fen = chess.fen()
                let move = chess.move(element.move)
                if(!move){
                    console.log('failed to load game ' + pgn)
                    showError("Failed to load game", `${playerName}:${playerColor}`)
                    return
                }
                if(move.color === gamePlayerColor) {
                    openingGraph.addMoveForFen(fen, move, resultObject, playerColor)
                } else {
                    openingGraph.addMoveAgainstFen(fen,move, resultObject, playerColor)
                }
            })
            let fen = chess.fen()
            openingGraph.addGameResultOnFen(fen, resultObject)
            this.continueProcessingGames = notify(advancedFilters[Constants.FILTER_NAME_DOWNLOAD_LIMIT],1, openingGraph)
        }
            setTimeout(()=>{this.parsePGNTimed(pgnArray, advancedFilters, playerColor, index+1, playerName, notify, showError, stopDownloading)},1)
    }

    gameResult(pgn) {
        return {
            result:pgn.result,
            white:pgn.headers.White,
            black:pgn.headers.Black,
            whiteElo:pgn.headers.WhiteElo,
            blackElo:pgn.headers.BlackElo,
            url:pgn.headers.Link || pgn.headers.Site
        }
    }
}