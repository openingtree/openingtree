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
        let newMoveObject
        if (typeof moveObject === "string" && moveObject.endsWith('#')) {
            // a move ending in checkmate in racing kings will not 
            // be a checkmate under standard rules. so remove the # at the end 
            // to make it pass as a standard notation 
            newMoveObject = moveObject.substring(0, moveObject.length - 1);
        } else {
            newMoveObject = moveObject
        }
        return this.chess.move(newMoveObject, options)
    }
    turn() {
        return this.chess.turn()
    }
    moves(options) {
        // checks are not allowed in racing kings 
        // so remove moves that cause a check
        return this.chess.moves(options).filter((move)=>{
            return !move.san.endsWith("+") && !move.san.endsWith("#")
        })
    }
}