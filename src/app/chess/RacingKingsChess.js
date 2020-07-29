import Chess from 'chess.js'

export default class RacingKingsChess {
    constructor(fen){
        this.chess = new Chess(fen);
        this.SQUARES = this.chess.SQUARES
    }
    fen(){
        return this.chess.fen()
    }
    move(moveObject, options) {
        return this.chess.move(moveObject, options)
    }
    turn() {
        return this.chess.turn()
    }
    moves(options) {
        return this.chess.moves(options)
    }
}