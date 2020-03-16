import {openingGraph} from './OpeningGraph'
import Chess from 'chess.js'
import LichessIterator from './LichessIterator'
import ChessComIterator from './ChessComIterator'

export default class PGNReader {
    parsePGN(playerName, site, notify, showError) {
        this.continueProcessingGames = true
        let handleResponse = (result) => {
            if(!result || !result.length) {
                return this.continueProcessingGames
            }
            setTimeout(() => {
                this.parsePGNTimed(result, 0, playerName, notify, showError)
            } ,1)
            return this.continueProcessingGames
        }
        if(site === "lichess") {
            new LichessIterator(playerName, handleResponse, showError)
        } else if(site === "chesscom") {
            new ChessComIterator(playerName, handleResponse, showError)
        }

        
    }

    parsePGNTimed(pgnArray, index,  playerName, notify, showError) {
        if(index>= pgnArray.length) {
            return
        }
        var pgn = pgnArray[index]
        let playerColor = (pgn.headers.White.toLowerCase() === playerName.toLowerCase()) ? "w" : "b"
        let chess = new Chess()
        if(pgn.moves[0] && pgn.moves[0].move_number === 1) {
            pgn.moves.forEach(element => {
                let fen = chess.fen()
                let move = chess.move(element.move)
                if(!move){
                    console.log('failed to load game ' + pgn)
                    showError("Failed to load game")
                    return
                }
                if(move.color === playerColor) {
                    openingGraph.addMoveForFen(fen, move, pgn.result)
                } else {
                    openingGraph.addMoveAgainstFen(fen,move, pgn.result)
                }
            })
            this.continueProcessingGames = notify(1, openingGraph)
        }
        if(this.continueProcessingGames) {
            setTimeout(()=>{this.parsePGNTimed(pgnArray, index+1, playerName, notify, showError)},1)
        }
    }
}