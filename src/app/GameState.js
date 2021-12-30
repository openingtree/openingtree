import ChessEcoCodes from 'chess-eco-codes'
import {chessLogic, rootFen} from '../app/chess/ChessLogic'

export default class GameState {
    constructor(variant, fen, headers) {
        this.variant = variant
        this.initialFen = fen !== undefined ? fen : rootFen(variant)
        this.headers = headers
        this.opening = undefined
        this.chess = chessLogic(this.variant, this.initialFen)
        this.moves = []
        this.ply = 0
    }

    getFen() {
        return this.chess.fen()
    }

    getPly() {
        return this.ply
    }

    getTurn() {
        return this.chess.turn()
    }

    getMoves() {
        return this.moves.slice()
    }

    getOpening() {
        return this.opening
    }

    makeMove(move) {
        while (this.moves.length > 0 &&
               this.ply !== this.moves[this.moves.length - 1].ply) {
            this.moves.pop()
        }
        move = this.chess.move(move)
        if (move !== null) {
            move.ply = this.ply = this.ply + 1
            this.moves.push(move)
            let opening = ChessEcoCodes(this.chess.fen())
            if (opening) {
                this.opening = opening
            }
        }
        return move
    }

    navigateToMove(ply) {
        this.ply = 0
        this.chess = chessLogic(this.variant, this.initialFen)
        this.moves.forEach((move) => {
            if (move.ply > ply) {
                return
            }
            this.chess.move(move)
            this.ply = move.ply
        })
    }
}
