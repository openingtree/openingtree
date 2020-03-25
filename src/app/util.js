import * as Constants from '../app/Constants'
import * as Common from '../app/Common'

export function createSubObjectWithProperties(mainObject, properties) {
    let subObject = {}
    properties.forEach(property => {
        subObject[property] = mainObject[property]
    });
    return subObject
}
export function simplifiedFen(fen) {
    let fenComponents = fen.split(' ')
    if(fenComponents.length <=4) {
        return fen
    }
    //exclude move and halfMove components
    return `${fenComponents[0]} ${fenComponents[1]} ${fenComponents[2]}`
}

export function getTimeControlsArray(site,timeControlState, selected) {
    let allTimeControls = site === Constants.SITE_LICHESS ? 
        Common.LICHESS_TIME_CONTROLS : Common.CHESS_DOT_COM_TIME_CONTROLS
    return allTimeControls.filter((timeControl)=>!!timeControlState[timeControl] === selected)
}
let monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]
export function getTimeframeSteps() {
    let steps = [{
        year:2007,
        value:0
    }]
    let value = 1;
    let startYear = 2010
    let currentYear = new Date().getFullYear()
    let currentMonth = new Date().getMonth()
    while(startYear < currentYear-1) {
        steps.push({
            toLongLabel:`${monthLabels[11]} ${startYear}`,
            fromLongLabel:`${monthLabels[0]} ${startYear}`,
            year:startYear,
            value:value
        })
        startYear++
        value++
    }
    for(let i=11;i>0;i--) {

        let month = (currentMonth+12-i)%12
        let year = month<currentMonth?currentYear:currentYear-1
        steps.push({
            fromLongLabel: `${monthLabels[month]} ${year}`,
            toLongLabel: `${monthLabels[month]} ${year}`,
            month:month,
            year: year,
            value:value
        })
        value++
    }
    steps.push({
        month:12,
        year: currentYear,
        value:value
    })
    return steps
}

export function getSelectedTimeFrameData(timeframe, timeframeSteps) {
    let fromIndex = timeframe[0]
    let toIndex = timeframe[1]
    let fromTimeframe = timeframeSteps[fromIndex]
    let toTimeframe = timeframeSteps[toIndex]
    
    if(fromIndex === timeframeSteps.length-1 && toIndex === timeframeSteps.length-1) {
        let currentDate = new Date()
        return {
            label:"Current month",
            fromMonth:currentDate.getMonth(),
            frmYear:currentDate.getYear(),
            fromTimeStamp:getTimeStampInfoFor(currentDate.getMonth(), currentDate.getYear(), "min")
        }
    }
    if(fromIndex === 0 && toIndex === 0) {
        return {label:"Anytime"}
    }
    if(fromIndex === 0 && toIndex === timeframeSteps.length-1) {
        return {label:"Anytime"}
    }
    if(toIndex === timeframeSteps.length-1) {
        let month = fromTimeframe.month ? fromTimeframe.month : 0
        return {
            label:`Since ${fromTimeframe.fromLongLabel}`,
            fromYear: fromTimeframe.year,
            fromMonth: month,
            fromTimeStamp: getTimeStampInfoFor(month, fromTimeframe.year, "min")
        }
    }
    if(fromIndex === 0) {
        let month = toTimeframe.month ? toTimeframe.month : 11
        return {
            label:`Until ${toTimeframe.toLongLabel}`,
            toYear: toTimeframe.year,
            toMonth: month,
            toTimeStamp: getTimeStampInfoFor(month, toTimeframe.year, "max")
        }
    }
    let fromMonth = fromTimeframe.month ? fromTimeframe.month : 0
    let toMonth = toTimeframe.month ? toTimeframe.month : 11
    return {
        label:`From ${fromTimeframe.fromLongLabel} to ${toTimeframe.toLongLabel}`,
        fromYear: fromTimeframe.year,
        fromMonth: fromMonth,
        fromTimeStamp: getTimeStampInfoFor(fromMonth, fromTimeframe.year, "min"),
        toYear: toTimeframe.year,
        toMonth: toMonth,
        toTimeStamp: getTimeStampInfoFor(toMonth, toTimeframe.year, "max")
    }
}

function getTimeStampInfoFor(month, year, minOrMax) {
    if(minOrMax === "min") {
        return new Date(year, month).getTime()
    } else {
        return new Date(year,month,getDaysInMonth(year, month)).getTime()
    }
}

function getDaysInMonth(year,month) {
    return new Date(year, month + 1, 0).getDate();
}

export function getPerformanceDetails(totalElo, white, draws, black, playerColor) {
    let totalGames = white + draws + black
    let averageElo = Math.round(totalElo/totalGames)
    let playerWins = playerColor==='white'?white:black
    let winPercentage = `${Math.round(playerWins*100/totalGames)}`
    let ratingChange = Common.DP_TABLE[winPercentage]
    return {
        performanceRating:averageElo+ratingChange,
        averageElo: averageElo,
        winPercentage:`${winPercentage}%`,
        ratingChange:`${ratingChange===0?'':(ratingChange>0?'+':'-')}${Math.abs(ratingChange)}`
    }
}