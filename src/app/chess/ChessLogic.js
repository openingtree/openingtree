import * as Constants from '../Constants'
import Chess from 'chess.js'
import RacingKingsChess from './RacingKingsChess'

export function chessLogic(variant, fen) {
    if(variant === Constants.VARIANT_RACING_KINGS) {
        return new RacingKingsChess(fen)
    }
    return new Chess(fen)
}