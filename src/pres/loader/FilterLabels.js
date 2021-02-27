import {timeControlLabel} from './TimeControlLabels'
import * as Constants from '../../app/Constants'

export const getTimeControlLabel = timeControlLabel

export function getRatedLabel(rated) {
    if(rated === 'all') {
        return "Rated and casual"
    } else if (rated === 'rated') {
        return "Rated only"
    } else if (rated === 'casual') {
        return "Casual only"
    }
}

export function getELORangeLabel(selectedEloRange) {
    if(selectedEloRange[0] === 0 && selectedEloRange[1]===Constants.MAX_ELO_RATING) {
        return "Any rating"
    } else if (selectedEloRange[0] === 0) {
        return `Below ${selectedEloRange[1]}`
    } else if (selectedEloRange[1] === Constants.MAX_ELO_RATING) {
        return `Above ${selectedEloRange[0]}`
    } else {
        return `Between ${selectedEloRange[0]} and ${selectedEloRange[1]}`
    }
}

export function opponentNameLabel(value) {
    return value?value:"All opponents"
}
export function getDownloadLimitLabel(downloadLimit) {
    return downloadLimit>= Constants.MAX_DOWNLOAD_LIMIT?"No limit":`${downloadLimit} games`
}

export function getFromDateLabel(date) {
    return date?date.toLocaleDateString('en-US'): 'Big Bang'
}

export function getToDateLabel(date) {
    return date?date.toLocaleDateString('en-US'): 'Now'
}
