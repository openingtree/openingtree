import BaseLichessIterator from './BaseLichessIterator'
import * as Common from '../Common'

export default class OnlineTournamentIterator {

    constructor(variant, accessToken, onlineTournament, advancedFilters, ready, showError) {
            new BaseLichessIterator(accessToken, 
                `https://lichess.org/api/${onlineTournament.tournamentType}/${onlineTournament.tournamentId}/games`, 
                ready, showError, (pgn)=>{
                    if(!pgn || pgn.headers.Variant !== Common.lichessVariantHeader(variant)) {
                        return false
                    }
                    return true
                },
                'Could not find tournament',
                'Could not load games from tournament')
        
    }

}
