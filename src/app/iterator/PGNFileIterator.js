import request from 'request'
import { parse }  from '../PGNParser'
import {getTimeControlsArray, getTimeframeSteps, getSelectedTimeFrameData, isOpponentEloInSelectedRange} from '../util'
import * as Constants from '../Constants'
import {trackEvent} from '../Analytics'

export default class LichessIterator {

    constructor(playerName, files, playerColor, advancedFilters, ready, showError) {
        console.log(files)
    }
}