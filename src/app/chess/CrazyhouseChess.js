import Chess from 'chess.js'

export default class CrazyhouseChess {
    constructor(fen){
        if(process.env.NODE_ENV==="test") {
            this.chess= new (Chess.Chess)(fen)
        } else {
            this.chess = new Chess(fen);
        }
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
    load(fen) {
        this.chess.load(fen)
    }
    move(moveObject, options) {
        let move = this.chess.move(moveObject, options)
        if(move) {
            return move
        }
        if(typeof moveObject === "string") {
            return this.moveSan(moveObject)
        } else {
            return this.moveSan(moveObject.san)
        }
    }

    moveSan(san) {
        if(san.includes('@')){
            let locationOfAt = san.indexOf('@')
            let piece = ''
            if(locationOfAt === 0) {
                piece = this.chess.PAWN
            } else {
                piece = san.charAt(0).toLowerCase()
            }
            let location = san.slice(locationOfAt+1,locationOfAt+3)
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
                san:san
            }
        }
        return null
    }
    toggleTurn() {
        var tokens = this.chess.fen().split(' ');
        // switch the color
        tokens[1] = tokens[1] === 'b'? 'w' : 'b'
        // remove en passent
        tokens[3] = '-'
        this.chess.load(tokens.join(' '));
    }
    
}

