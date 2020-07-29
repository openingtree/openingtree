import BaseLichessIterator from './BaseLichessIterator'
import * as Constants from '../Constants'

export default class OnlineTournamentIterator {

    constructor(accessToken, onlineTournament, advancedFilters, ready, showError) {
            new BaseLichessIterator(accessToken, 
                `https://lichess.org/api/${onlineTournament.tournamentType}/${onlineTournament.tournamentId}/games`, 
                ready, showError, (pgn)=>{
                    if(!pgn || pgn.headers.Variant !== Constants.LICHESS_HEADER_RACING_KINGS) {
                        return false
                    }
                    return true
                },
                'Could not find tournament',
                'Could not load games from tournament')
        
    }

}
