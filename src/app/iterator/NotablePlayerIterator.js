import request from 'request'
import { parse }  from '../PGNParser'
import {getTimeControlsArray, getTimeframeSteps, getSelectedTimeFrameData, isOpponentEloInSelectedRange} from '../util'
import * as Constants from '../Constants'
import {trackEvent} from '../Analytics'
import BaseUrlIterator from './BaseUrlIterator'
import PGNUrlIterator from './PGNUrlIterator'

export default class NotablePlayerIterator {

    constructor(selectedPlayer, playerColor, advancedFilters, ready, showError) {
        let lowerCaseAliases = selectedPlayer.pgnAliases.map(alias=>alias.toLowerCase())
        new PGNUrlIterator(selectedPlayer.pgnUrl, lowerCaseAliases, playerColor, advancedFilters, ready, showError)
    }

}
