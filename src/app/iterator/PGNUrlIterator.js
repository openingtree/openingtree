import { parse }  from '../PGNParser'
import * as Constants from '../Constants'
import {trackEvent} from '../Analytics'
import BaseUrlIterator from './BaseUrlIterator'

export default class PGNUrlIterator {

    constructor(url, lowerCasePlayerNames, playerColor, ready, showError) {
        let playerColorHeaderName = playerColor === Constants.PLAYER_COLOR_WHITE? 'White': 'Black'
        new BaseUrlIterator(url, null, true, 
            (responseCode)=>{
                if (responseCode !== 200) {
                    showError('Could not load url')
                }
            }, (error)=> {
                showError('Could not connect to url')
                ready([], false)
            }, (pgnStringArray) => {
                let parsedPGNs = pgnStringArray.map((pgnString)=> {
                    try {

                        return parse(pgnString)[0]
                    } catch (e) {
                        console.log("Failed to parse pgn", pgnString)
                        console.log(e)
                        trackEvent(Constants.EVENT_CATEGORY_ERROR, "parseFailedPGNUrl")
                        return null
                    }
                })
    
                let continueProcessing = ready(parsedPGNs.filter((game)=>{
                    if(!game) {
                        return false
                    }

                    if((!game.headers[playerColorHeaderName]) 
                        || lowerCasePlayerNames 
                        && !lowerCasePlayerNames.includes(
                            game.headers[playerColorHeaderName].toLowerCase())) {
                        return false
                    }
                    return true
                }), true)
                return continueProcessing
            }, ()=>{
                ready([], false)
            })
    }

}
