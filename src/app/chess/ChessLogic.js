import * as Constants from '../Constants'
import Chess from '@gorilla_12/chess'
import RacingKingsChess from './RacingKingsChess'
import CrazyhouseChess from './CrazyhouseChess'
export function chessLogic(variant, fen) {
    if(!fen) {
        fen = rootFen(variant)
    }
    if(variant === Constants.VARIANT_RACING_KINGS) {
        return new RacingKingsChess(fen)
    }
    if(variant === Constants.VARIANT_CRAZYHOUSE) {
        return new CrazyhouseChess(fen)
    }
    return new Chess(fen)
}

export function rootFen(variant) {
    if(variant === Constants.VARIANT_RACING_KINGS) {
        return Constants.RACING_KINGS_ROOT_FEN
    }
    return Constants.ROOT_FEN
}