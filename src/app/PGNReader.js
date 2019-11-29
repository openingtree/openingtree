import {parse } from './PGNParser'
import {openingGraph} from './OpeningGraph'
import Chess from 'chess.js'
import LichessIterator from './LichessIterator';

export default class PGNReader {
    parsePGN(playerName, notify) {
        new LichessIterator(playerName, (result) => {
            if(!result || !result.length) {
                return
            }
            setTimeout(() => {
                this.parsePGNTimed(result, 0, playerName, notify)
            } ,1)
        })

        
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
            if(move.color === playerColor) {
                openingGraph.addMoveForFen(fen, move)
            } else {
                openingGraph.addMoveAgainstFen(fen,move)
            }
        })
        setTimeout(()=>{this.parsePGNTimed(pgnArray, index+1, playerName, notify)},1)
        notify(1, openingGraph)
    }
}