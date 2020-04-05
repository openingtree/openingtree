import {simplifiedFen, isDateMoreRecentThan} from './util'

class OpeningGraph {
    constructor() {
        this.graph=new Graph()
    }
    clear() {
        this.graph = new Graph()
    }
    addGameResultOnFen(fullFen, gameResult) {
        var currNode = this.getNodeFromGraph(fullFen)
        currNode.gameResults.push(gameResult)
    }
    addResultToReport(gameResult) {
        var currNode = this.getNodeFromGraph(fullFen)
        currNode.gameResults.push(gameResult)
    }

    addMoveForFen(fullFen, move, resultObject, playerColor) {
        var currNode = this.getNodeFromGraph(fullFen)
        var movesPlayedBy = currNode.playedBy
        var movePlayedBy = this.updateDetailsOnNode(movesPlayedBy, move, resultObject, playerColor)
        currNode.playedByMax = Math.max(currNode.playedByMax, movePlayedBy.count)
        currNode.playedBy = movesPlayedBy
    }

    addMoveAgainstFen(fullFen, move, resultObject, playerColor) {
        var currNode = this.getNodeFromGraph(fullFen)
        var movesPlayedAgainst = currNode.playedAgainst
        var movePlayedAgainst = this.updateDetailsOnNode(movesPlayedAgainst, move, resultObject, playerColor)
        currNode.playedAgainstMax = Math.max(currNode.playedAgainstMax, movePlayedAgainst.count)
        currNode.playedAgainst = movesPlayedAgainst
    }
    getNodeFromGraph(fullFen) {
        let fen = simplifiedFen(fullFen)
        var currNode = this.graph.nodes.get(fen)
        if(!currNode) {
            currNode = new GraphNode()
            currNode.fen = fen
            this.graph.nodes.set(fen, currNode)
        }
        return currNode
    }
    updateDetailsOnNode(movesPlayedNode, move, resultObject, playerColor){
        var movePlayed = movesPlayedNode.get(move.san)
        if(!movePlayed) {
            movePlayed = new GraphMove()
            movePlayed.move = move
            movesPlayedNode.set(move.san, movePlayed)
        }
        let whiteWin = 0, blackWin = 0, draw = 0, opponentElo=0, resultInt = 0;
        if(resultObject.result === '1-0') {
            whiteWin = 1
            resultInt = playerColor === 'white'? 1 : -1
        } else if (resultObject.result === '0-1') {
            blackWin = 1
            resultInt = playerColor === 'black'? 1 : -1
        } else {
            draw = 1
        }

        if(playerColor === 'white') {
            opponentElo = resultObject.blackElo
        } else {
            opponentElo = resultObject.whiteElo
        }
        if(resultInt === 1) {
            if(!movePlayed.details.bestWin || opponentElo>movePlayed.details.bestWin) {
                movePlayed.details.bestWin = opponentElo
                movePlayed.details.bestWinGame = resultObject
            }
        }
        if(resultInt === -1) {
            if(!movePlayed.details.worstLoss || opponentElo<movePlayed.details.worstLoss) {
                movePlayed.details.worstLoss = opponentElo
                movePlayed.details.worstLossGame = resultObject
            }
        }
        if(!movePlayed.details.lastPlayedGame || 
            isDateMoreRecentThan(resultObject.date, movePlayed.details.lastPlayedGame.date)) {
                movePlayed.details.lastPlayedGame = resultObject
        }
        movePlayed.count += 1
        movePlayed.blackWins += blackWin
        movePlayed.whiteWins += whiteWin
        movePlayed.draws += draw
        movePlayed.details.totalOpponentElo += parseInt(opponentElo)
        return movePlayed
    }

    gameResultsForFen(fullFen) {
        let fen = simplifiedFen(fullFen)

        var currNode = this.graph.nodes.get(fen)
        if(currNode) {
            return currNode.gameResults
        }
        return null
    }
    movesForFen(fullFen) {
        let fen = simplifiedFen(fullFen)

        var currNode = this.graph.nodes.get(fen)
        if(currNode) {
            return Array.from(currNode.playedBy.entries()).map((entry)=> {
                let gMove = entry[1]
                return {
                    orig:gMove.move.from,
                    dest:gMove.move.to,
                    level:this.levelFor(gMove.count, currNode.playedByMax),
                    count:gMove.count,
                    whiteWins:gMove.whiteWins,
                    blackWins:gMove.blackWins,
                    draws:gMove.draws,
                    san:gMove.move.san,
                    details:gMove.details
                }
            })
        }        
        return null
    }
    movesAgainstFen(fullFen) {
        let fen = simplifiedFen(fullFen)
        var currNode = this.graph.nodes.get(fen)
        if(currNode) {
            return Array.from(currNode.playedAgainst.entries()).map((entry)=> {
                let gMove = entry[1]
                return {
                    orig:gMove.move.from,
                    dest:gMove.move.to,
                    level:this.levelFor(gMove.count, currNode.playedAgainstMax),
                    count:gMove.count,
                    whiteWins:gMove.whiteWins,
                    blackWins:gMove.blackWins,
                    draws:gMove.draws,
                    san:gMove.move.san,
                    details:gMove.details
                }
            })
        }        
        return null
    }
    levelFor(moveCount, maxCount){
        if(maxCount <= 0 ||moveCount/maxCount > 0.8) {
            return 2
        }
        if(moveCount/maxCount>0.3) {
            return 1
        }
        return 0
    }

}


class Graph {
    nodes = new Map()
    rootNode = null

}

class GraphNode {
    fen = ''
    playedByMax = 0 // used to keep track of how many times the most frequent move is played for ease of calculation later
    playedBy = new Map()
    playedAgainstMax = 0
    playedAgainst = new Map()
    gameResults = []
    properties = {}
}

class GraphMove {
    fen = ''
    move = {}
    count = 0
    blackWins= 0
    whiteWins= 0
    draws= 0
    details = {
        totalOpponentElo: 0,
        bestWin:null,
        bestWinGame:null,
        worstLoss:null,
        worstLossGame:null,
        lastPlayedGame:null
    }
}

export const openingGraph = new OpeningGraph()