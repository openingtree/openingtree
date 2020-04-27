import * as Constants from './Constants'

export function isAdvancedFiltersEnabled(source) {
    return source === Constants.SITE_CHESS_DOT_COM ||
        source === Constants.SITE_LICHESS
}

export function finalPlayerName(source, playerName, selectedNotablePlayer) {
    if(source === Constants.SITE_PLAYER_DB) {
        return selectedNotablePlayer.name
    }
    return playerName
}
export function isFilterPanelEnabled(source, playerName, selectedNotablePlayer) {
    if(source === Constants.SITE_EVENT_DB ||
        source === Constants.SITE_OPENING_TREE_FILE) {
            return false
    }
    return !!finalPlayerName(source, playerName, selectedNotablePlayer)
}