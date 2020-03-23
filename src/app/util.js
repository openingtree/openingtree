import * as Constants from '../app/Constants'
import * as Common from '../app/Common'

export function createSubObjectWithProperties(mainObject, properties) {
    let subObject = {}
    properties.forEach(property => {
        subObject[property] = mainObject[property]
    });
    return subObject
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
        label:"Any",
        month:0,
        year:1970,
        value:0
    }]
    let value = 1;
    let startYear = 2010
    let currentYear = new Date().getFullYear()
    let currentMonth = new Date().getMonth()
    while(startYear < currentYear) {
        console.log("adding year")
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
        console.log("adding month")

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