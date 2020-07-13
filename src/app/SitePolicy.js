import * as Constants from './Constants'

export function isAdvancedFiltersEnabled(source) {
    return source === Constants.SITE_CHESS_DOT_COM ||
        source === Constants.SITE_LICHESS
}


export function isFilterPanelEnabled(source, playerName) {
    if(source === Constants.SITE_EVENT_DB ||
        source === Constants.SITE_OPENING_TREE_FILE ||
        source === Constants.SITE_ONLINE_TOURNAMENTS) {
            return false
    }
    return !!playerName
}

export function treeSaveDisabledReason(loadedSite, selectedSite, gamesProcessed, isDownloading){
    if(selectedSite === Constants.SITE_ONLINE_TOURNAMENTS) {
        return "Not currently supported for tournaments"
    }
    if(selectedSite !== Constants.SITE_LICHESS && 
        selectedSite !== Constants.SITE_CHESS_DOT_COM) {
        return "Only supported for chess.com and lichess"
    }
    if(loadedSite !== selectedSite || gamesProcessed<=0) {
        return "You need to analyze games before saving"
    }
    if(isDownloading) {
        return "Action not supported while games are loading"
    }
    return ''
}
export function exportFileName(source, playerName, playerColor, selectedEvent, extension) {
    if(source === Constants.SITE_EVENT_DB) {
        return `${selectedEvent.name}.${extension}`
    }
    if(playerName) {
        return `${playerName}-${playerColor}.${extension}`
    }
    return `openingtree-exportedgames.${extension}`
}