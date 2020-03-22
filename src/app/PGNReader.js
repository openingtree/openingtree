import {openingGraph} from './OpeningGraph'
import Chess from 'chess.js'
import LichessIterator from './LichessIterator'
import ChessComIterator from './ChessComIterator'
import * as Constants from './Constants'

export default class PGNReader {
    parsePGN(playerName, playerColor, site, advancedFilters, notify, showError, stopDownloading) {
        this.continueProcessingGames = true
        let handleResponse = (result) => {
            if(!result || !result.length) {
                return this.continueProcessingGames
            }
            setTimeout(() => {
                this.parsePGNTimed(result, playerColor, 0, playerName, notify, showError)
            } ,1)
            return this.continueProcessingGames
        }
        if(site === Constants.SITE_LICHESS) {
            new LichessIterator(playerName, playerColor, advancedFilters, handleResponse, showError, stopDownloading)
        } else if(site === Constants.SITE_CHESS_DOT_COM) {
            new ChessComIterator(playerName, playerColor, advancedFilters, handleResponse, showError, stopDownloading)
        }

        
    }

    parsePGNTimed(pgnArray, playerColor, index,  playerName, notify, showError) {
        if(index>= pgnArray.length) {
            return
        }
        var pgn = pgnArray[index]
        let gamePlayerColor = (pgn.headers.White.toLowerCase() === playerName.toLowerCase()) ? "w" : "b"
        if(pgn.moves[0] && pgn.moves[0].move_number === 1) {
            let chess = new Chess()
            pgn.moves.forEach(element => {
                let fen = chess.fen()
                let move = chess.move(element.move)
                if(!move){
                    console.log('failed to load game ' + pgn)
                    showError("Failed to load game")
                    return
                }
                if(move.color === gamePlayerColor) {
                    openingGraph.addMoveForFen(fen, move, pgn.result)
                } else {
                    openingGraph.addMoveAgainstFen(fen,move, pgn.result)
                }
            })
            let fen = chess.fen()
            openingGraph.addGameResultOnFen(fen, this.gameResult(pgn))
            this.continueProcessingGames = notify(1, openingGraph)
        }
            setTimeout(()=>{this.parsePGNTimed(pgnArray, playerColor, index+1, playerName, notify, showError)},1)
    }

    gameResult(pgn) {
        let result = pgn.headers.Result
        let white = pgn.headers.White
        let black = pgn.headers.Black
        let url = pgn.headers.Link || pgn.headers.Site
        return {
            result:result,
            white:white,
            black:black,
            url:url
        }
    }
}