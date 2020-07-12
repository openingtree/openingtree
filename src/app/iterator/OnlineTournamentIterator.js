import PGNUrlIterator from './PGNUrlIterator'
import * as Constants from '../Constants'

export default class OnlineTournamentIterator {

    constructor(onlineTournament, ready, showError) {
        if(onlineTournament.tournamentSite === Constants.SITE_LICHESS) {
            new PGNUrlIterator(`https://lichess.org/api/tournament/${onlineTournament.tournamentId}/games`, null, '', ready, showError)
        }
    }

}
