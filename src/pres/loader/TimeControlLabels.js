import * as Constants from '../../app/Constants'
import * as Common from '../../app/Common'
import {getTimeControlsArray} from '../../app/util'

let timeClasses = [
    {
        label:"Fast time controls",
        selectedTimeControls:[
            Constants.TIME_CONTROL_BULLET,
            Constants.TIME_CONTROL_ULTRA_BULLET,
            Constants.TIME_CONTROL_BLITZ
        ],
        unselectedTimeControls:[
            Constants.TIME_CONTROL_RAPID,
            Constants.TIME_CONTROL_CLASSICAL,
            Constants.TIME_CONTROL_CORRESPONDENCE
        ]
    },
    {
        label:"Slow time controls",
        selectedTimeControls:[
            Constants.TIME_CONTROL_RAPID,
            Constants.TIME_CONTROL_CLASSICAL,
            Constants.TIME_CONTROL_CORRESPONDENCE
        ],
        unselectedTimeControls:[
            Constants.TIME_CONTROL_BULLET,
            Constants.TIME_CONTROL_ULTRA_BULLET,
            Constants.TIME_CONTROL_BLITZ
        ]
    },
    {
        label:"Reasonable time controls",
        selectedTimeControls:[
            Constants.TIME_CONTROL_BLITZ,
            Constants.TIME_CONTROL_RAPID,
            Constants.TIME_CONTROL_CLASSICAL,
            Constants.TIME_CONTROL_CORRESPONDENCE
        ],
        unselectedTimeControls:[
            Constants.TIME_CONTROL_BULLET,
            Constants.TIME_CONTROL_ULTRA_BULLET
        ]
    },
    {
        label:"Exclude slow time controls",
        selectedTimeControls:[
            Constants.TIME_CONTROL_BULLET,
            Constants.TIME_CONTROL_ULTRA_BULLET,
            Constants.TIME_CONTROL_BLITZ,
            Constants.TIME_CONTROL_RAPID
        ],
        unselectedTimeControls:[
            Constants.TIME_CONTROL_CLASSICAL,
            Constants.TIME_CONTROL_CORRESPONDENCE
        ]
    }
]
        


export function timeControlLabel(site, timeControlState) {
    let selectedTimeControls = getTimeControlsArray(site, timeControlState, true)
    let unselectedTimeControls = getTimeControlsArray(site, timeControlState, false)
    if(unselectedTimeControls.length === 0 || selectedTimeControls.length === 0) {
        return "All time controls"
    }
    if(selectedTimeControls.length === 1) {
        return Common.TIME_CONTROL_LABELS[selectedTimeControls[0]]
    }
    if(unselectedTimeControls.length === 1) {
        return `All except ${Common.TIME_CONTROL_LABELS[unselectedTimeControls[0]]}`
    }
    if(selectedTimeControls.length === 2) {
        return `${Common.TIME_CONTROL_LABELS[selectedTimeControls[0]]} and ${Common.TIME_CONTROL_LABELS[selectedTimeControls[1]]}`
    }

    return lichessTimeControlLabel(selectedTimeControls, unselectedTimeControls)
}

function lichessTimeControlLabel(selectedTimeControls, unselectedTimeControls) {
    let timeClass = timeClasses.filter(
        (timeClass) => {
            return includesAll(unselectedTimeControls,timeClass.unselectedTimeControls)
                && includesAll(selectedTimeControls,timeClass.selectedTimeControls)
    })
    if(timeClass.length) {
        return timeClass[0].label
    } 
    return selectedTimeControls.map(control=>Common.TIME_CONTROL_LABELS[control]).join(', ')
}

function includesAll(arr, subArray) {
    return subArray.every(v => arr.includes(v));
}
