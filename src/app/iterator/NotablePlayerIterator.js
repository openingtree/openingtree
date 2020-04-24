import PGNUrlIterator from './PGNUrlIterator'

export default class NotablePlayerIterator {

    constructor(selectedPlayer, playerColor, advancedFilters, ready, showError) {
        let lowerCaseAliases = selectedPlayer.pgnAliases.map(alias=>alias.toLowerCase())
        new PGNUrlIterator(selectedPlayer.pgnUrl, lowerCaseAliases, playerColor, advancedFilters, ready, showError)
    }

}
