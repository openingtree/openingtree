import * as Constants from '../app/Constants'

export function timeControlLabel(site, selectedTimeControls) {
    if(site === Constants.SITE_LICHESS) {
        return lichessTimeControlLabel(selectedTimeControls)
    } 
    return chesscomTimeControlLabel(selectedTimeControls)
}

function lichessTimeControlLabel(selectedTimeControls) {
}