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

export function getWhenPlayedLabel(timeframe, timeframeSteps) {
    let fromIndex = timeframe[0]
    let toIndex = timeframe[1]
    let fromTimeframe = timeframeSteps[fromIndex]
    let toTimeframe = timeframeSteps[toIndex]
    
    if(fromIndex === timeframeSteps.length-1 && toIndex === timeframeSteps.length-1) {
        return "Current month"
    }
    if(fromIndex === 0 && toIndex === 0) {
        return "Anytime"
    }
    if(fromIndex === 0 && toIndex === timeframeSteps.length-1) {
        return "Anytime"
    }
    if(toIndex === timeframeSteps.length-1) {
        return `Since ${fromTimeframe.fromLongLabel}`
    }
    if(fromIndex === 0) {
        return `Until ${toTimeframe.toLongLabel}`
    }
    return `From ${fromTimeframe.fromLongLabel} to ${toTimeframe.toLongLabel}`
}
export function getDownloadLimitLabel() {
    return "No limit"
}
