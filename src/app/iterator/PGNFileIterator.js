import request from 'request'
import { parse }  from '../PGNParser'
import {getTimeControlsArray, getTimeframeSteps, getSelectedTimeFrameData, isOpponentEloInSelectedRange} from '../util'
import * as Constants from '../Constants'
import {trackEvent} from '../Analytics'

export default class LichessIterator {

    constructor(playerName, files, playerColor, advancedFilters, ready, showError) {
        let reader = new FileReader()
        reader.onload = function(evt) {
            let fileData = evt.target.result
            let pgnsArray = fileData.split("\n\n\n")

            let parsedPGNs = pgnsArray.map((pgnString)=> {
                try {
                    return parse(pgnString)[0]
                } catch (e) {
                    console.log("failed to parse pgn", pgnString)
                    console.log(e)
                    trackEvent(Constants.EVENT_CATEGORY_ERROR, "parseFailedPGNFile", playerName)
                    return null
                }
            })
            ready(parsedPGNs.filter(pgn=>!!pgn), true)
        };
        reader.onerror = function() {
            showError("Failed to load pgn file")
            ready([], false)
        }
        reader.onloadend = function() {
            ready([], false)
        }
        reader.readAsText(files[0])
    }
}