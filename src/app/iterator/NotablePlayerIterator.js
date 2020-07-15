import PGNUrlIterator from './PGNUrlIterator'

export default class NotablePlayerIterator {

    constructor(selectedPlayer, playerColor, advancedFilters, ready, showError) {
        let lowerCaseAliases = selectedPlayer.pgnAliases?selectedPlayer.pgnAliases.map(alias=>alias.toLowerCase()):null
        new PGNUrlIterator(selectedPlayer.pgnUrl, lowerCaseAliases, playerColor, ready, showError)
    }

}
