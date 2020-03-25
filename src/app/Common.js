import * as Constants from './Constants'

export const LICHESS_TIME_CONTROLS = [
    Constants.TIME_CONTROL_ULTRA_BULLET,
    Constants.TIME_CONTROL_BULLET,
    Constants.TIME_CONTROL_BLITZ,
    Constants.TIME_CONTROL_RAPID,
    Constants.TIME_CONTROL_CLASSICAL,
    Constants.TIME_CONTROL_CORRESPONDENCE
]
export const CHESS_DOT_COM_TIME_CONTROLS = [
    Constants.TIME_CONTROL_BULLET,
    Constants.TIME_CONTROL_BLITZ,
    Constants.TIME_CONTROL_RAPID,
    Constants.TIME_CONTROL_DAILY,
]

export const TIME_CONTROL_LABELS = {
    [Constants.TIME_CONTROL_ULTRA_BULLET]: "Ultrabullet",
    [Constants.TIME_CONTROL_BULLET]: "Bullet",
    [Constants.TIME_CONTROL_BLITZ]: "Blitz",
    [Constants.TIME_CONTROL_RAPID]: "Rapid",
    [Constants.TIME_CONTROL_CLASSICAL]: "Classical",
    [Constants.TIME_CONTROL_CORRESPONDENCE]: "Correspondence",
    [Constants.TIME_CONTROL_DAILY]: "Daily"
}