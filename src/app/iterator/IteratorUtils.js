import normalizeNewLine from 'normalize-newline'

export function normalizePGN(pgnString) {
    // parser cannot handle \r characters
    // normalize newlines coverts everything to \n
    let dataString = normalizeNewLine(pgnString)
    
    // some pgn files dont have triple \n separating games
    // so converting all double \n with triple \n if it happens before a [
    // this separates games with atleast a triple \n
    let headersNormalized = dataString.replace(/\n\n+\[/g, `\n\n\n[`);

    let resultsNormalized = headersNormalized.replace(/\s*\n+(1\-0|0\-1|1\/2\-1\/2)/g, ` $1`);

    return resultsNormalized
}
