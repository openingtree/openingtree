import {timeControlLabel} from './TimeControlLabels'

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

export function getWhenPlayedLabel() {
    return "Anytime"
}
export function getDownloadLimitLabel() {
    return "No limit"
}
