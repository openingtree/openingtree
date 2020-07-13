import { parse }  from '../PGNParser'
import * as Constants from '../Constants'
import {trackEvent} from '../Analytics'
import BaseUrlIterator from './BaseUrlIterator'

export default class BaseLichessIterator {

    constructor(accessToken, url, ready, showError, postFilter, notFoundError, couldNotLoadError) {
        
        new BaseUrlIterator(url, 
            this.getAuth(accessToken), false,
            (responseCode)=>{
                if(responseCode === 404) {
                    showError(notFoundError)
                } else if (responseCode !== 200) {
                    showError(couldNotLoadError)
                }
            }, (error)=> {
                showError('Failed to connect to lichess.org. Lichess might be down right now', null, "Some addons like 'Piracy Badger' can also cause this.")
                ready([], false)
            }, (pgnStringArray) => {
                let parsedPGNs = pgnStringArray.map((pgnString)=> {
                    try {
                        return parse(pgnString)[0]
                    } catch (e) {
                        console.log("Failed to parse pgn", pgnString)
                        console.log(e)
                        trackEvent(Constants.EVENT_CATEGORY_ERROR, "parseFailedLichess", url)
                        return null
                    }
                })
                
                let continueProcessing = ready(parsedPGNs.filter(postFilter), true)
                return continueProcessing
            }, ()=>{
                ready([], false)
            })
    }

    getAuth(accessToken) {
        if(accessToken) {
            return {
                'bearer' : accessToken
            }
        }
        return null;
    }
}
