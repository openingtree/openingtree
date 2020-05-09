import normalizeNewLine from 'normalize-newline'

export function normalizePGN(pgnString) {
    // parser cannot handle \r characters
    // normalize newlines coverts everything to \n
    let dataString = normalizeNewLine(pgnString)

    // Remove Single line commments because parser does not handle them
    dataString = dataString.replace(/^;.*$/gm, '')

    // Remove escaped quotes from headers
    dataString = dataString.replace(/\\"/gm, '')
    
    // some pgn files dont have triple \n separating games
    // so converting all double \n with triple \n if it happens before a [
    // this separates games with atleast a triple \n
    dataString = dataString.replace(/\n\n+\[/g, `\n\n\n[`);

    // some pgn files have the result in a separate line instead of 
    // at the end of the moves this moves those results to the end of the moves
    // $1 replaces the first captured group which is the result
    dataString = dataString.replace(/\s*\n+(1-0|0-1|1\/2-1\/2)/g, ` $1`);

    return dataString
}
