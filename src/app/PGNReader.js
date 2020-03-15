import {openingGraph} from './OpeningGraph'
import Chess from 'chess.js'
import LichessIterator from './LichessIterator'
import ChessComIterator from './ChessComIterator'

export default class PGNReader {
    parsePGN(playerName, site, notify, showError) {
        let handleResponse = (result) => {
            if(!result || !result.length) {
                return
            }
            setTimeout(() => {
                this.parsePGNTimed(result, 0, playerName, notify)
            } ,1)
        }
        if(site === "lichess") {
            new LichessIterator(playerName, handleResponse, showError)
        } else if(site === "chesscom") {
            new ChessComIterator(playerName, handleResponse, showError)
        }

        
    }

    parsePGNTimed(pgnArray, index,  playerName, notify) {
        if(index>= pgnArray.length) {
            return
        }
        var pgn = pgnArray[index]
        let playerColor = (pgn.headers.White.toLowerCase() === playerName.toLowerCase()) ? "w" : "b"
        let chess = new Chess()
        pgn.moves.forEach(element => {
            let fen = chess.fen()
            let move = chess.move(element.move)
            if(!move){
                console.log(move)
            }
            if(move.color === playerColor) {
                openingGraph.addMoveForFen(fen, move, pgn.result)
            } else {
                openingGraph.addMoveAgainstFen(fen,move, pgn.result)
            }
        })
        setTimeout(()=>{this.parsePGNTimed(pgnArray, index+1, playerName, notify)},1)
        notify(1, openingGraph)
    }
}