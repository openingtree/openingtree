export function playerDetails(name, elo) {
    return `${name}${elo?`(${elo})`:''}`
}
