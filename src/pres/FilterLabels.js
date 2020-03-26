import {timeControlLabel} from './TimeControlLabels'
import {getSelectedTimeFrameData} from '../app/util'
import * as Constants from '../app/Constants'

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

export function getWhenPlayedLabel(timeframe, timeframeSteps) {
    return getSelectedTimeFrameData(timeframe, timeframeSteps).label
}

export function getELORangeLabel(selectedEloRange) {
    if(selectedEloRange[0] === 0 && selectedEloRange[1]===Constants.MAX_ELO_RATING) {
        return "All elo ratings"
    } else if (selectedEloRange[0] === 0) {
        return `Below ${selectedEloRange[1]}`
    } else if (selectedEloRange[1] === Constants.MAX_ELO_RATING) {
        return `Above ${selectedEloRange[0]}`
    } else {
        return `Between ${selectedEloRange[0]} and ${selectedEloRange[1]}`
    }
}
export function getDownloadLimitLabel(downloadLimit) {
    return downloadLimit>= Constants.MAX_DOWNLOAD_LIMIT?"No limit":`${downloadLimit} games`
}
