import Chess from 'chess.js'

export default class RacingKingsChess {
    constructor(fen){
        if(process.env.NODE_ENV==="test") {
            this.chess=new (Chess.Chess)(fen);
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
    load(fen) {
        this.chess.load(fen)
    }
    moves(options) {
        // checks are not allowed in racing kings 
        // so remove moves that cause a check
        return this.chess.moves(options).filter((move)=>{
            let san = move.san || move
            return !san.endsWith("+") && !san.endsWith("#")
        })
    }

    move(moveObject, options) {
        if(typeof moveObject !== "string") {
            return this.chess.move(moveObject, options)
        }
        
        if (moveObject.endsWith('#')) {
            // a move ending in checkmate in racing kings will not 
            // be a checkmate under standard rules. so remove the # at the end 
            // to make it pass as a standard notation 
            moveObject = moveObject.substring(0, moveObject.length - 1);
        } 
        let move = this.chess.move(moveObject, options)
        if(move) {
            return move
        }
        let disambiguatedMove = disambiguate(moveObject, this.moves())
        if(!disambiguatedMove) {
            // disambiguation failed
            return move
        }
        // making this move failed so try disambiguating
        return this.chess.move(disambiguatedMove, options)
    }

}

// this is needed because in certain positions, while a disambiguating notation is needed 
// in standard chess, it is not needed in racing kings. 
// for example in this position "1q4R1/1kN2Q2/8/5K2/8/4Nn2/8/b7 w - - 1 21"
// Move Nd5 is ambiguous in standard chess but is clear in Racing kings
// because Ncd5 will lead to check

// The way this function works is by actually finding the disambiguated move Ned5
// to pass to the chess.js library. Since the move Ncd5 will end with a check (+) 
// it will fail the filter below
function disambiguate(problematicMove, potentialMoves) {
    let filteredMoves = potentialMoves.filter((potentialMove)=>{
        if(problematicMove.charAt(0) !== potentialMove.charAt(0)) {
            return false;
        }
        return problematicMove.slice(-2) === potentialMove.slice(-2)
    })
    if(filteredMoves.length !== 1) {
        return null
    }
    return filteredMoves[0]
}