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