import * as Constants from './Constants'

export function isAdvancedFiltersEnabled(source) {
    return source === Constants.SITE_CHESS_DOT_COM ||
        source === Constants.SITE_LICHESS
}


export function isFilterPanelEnabled(source, playerName) {
    if(source === Constants.SITE_EVENT_DB ||
        source === Constants.SITE_OPENING_TREE_FILE) {
            return false
    }
    return !!playerName
}

export function exportFileName(source, playerName, playerColor, selectedEvent) {
    if(source === Constants.SITE_EVENT_DB) {
        return `${selectedEvent.name}.pgn`
    }
    if(playerName) {
        return `${playerName}${playerColor?"-"+playerColor:""}.png`
    }
    return "openingtree-exportedgames.pgn"
}