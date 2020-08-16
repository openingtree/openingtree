import Chess from 'chess.js'

export default class CrazyhouseChess {
    constructor(fen){
        this.chess = new Chess(fen);
        this.SQUARES = this.chess.SQUARES
    }
    fen(){
        return this.chess.fen()
    }
    turn() {
        return this.chess.turn()
    }
    moves(options) {
        return this.chess.moves(options)
    }

    move(moveObject, options) {
        if(!moveObject) {
            return null
        }
        if(typeof moveObject !== "string") {
            let move = this.chess.move(moveObject, options)
            if(move) {
                return move
            }
            return this.move(moveObject.san, options)
        }
        let move = this.chess.move(moveObject, options)
        if(move) {
            return move
        }
        if(moveObject.includes('@')){
            let locationOfAt = moveObject.indexOf('@')
            let piece = ''
            if(locationOfAt === 0) {
                piece = this.chess.PAWN
            } else {
                piece = moveObject.charAt(0).toLowerCase()
            }
            let location = moveObject.slice(locationOfAt+1,locationOfAt+3)
            let success = this.chess.put({type:piece, color:this.turn()}, location)
            if(!success) {
                return null
            }
            let color = this.turn()

            this.toggleTurn()
            return {
                color: color,
                from:location,
                to:location,
                san:moveObject
            }
        }
        return null

    }
    toggleTurn() {
        var tokens = this.chess.fen().split(' ');
        tokens[1] = tokens[1] === this.chess.WHITE? this.chess.BLACK : this.chess.WHITE
        this.chess.load(tokens.join(' '));
    }
    
}

