import {simplifiedFen, isDateMoreRecentThan} from './util'
import * as Constants from './Constants'
import * as Common from './Common'
import {chessLogic} from '../app/chess/ChessLogic'

export default class OpeningGraph {
    constructor(variant) {
        this.graph=new Graph()
        this.hasMoves = false
        this.variant = variant
    }
    setEntries(arrayEntries, pgnStats){
        this.graph=new Graph(arrayEntries, pgnStats)
        this.hasMoves = true
    }

    clear() {
        this.graph = new Graph()
        this.hasMoves = false
    }

    addPGN(pgnStats, parsedMoves, lastFen, playerColor) {
        pgnStats.index = this.graph.pgnStats.length
        this.graph.pgnStats.push(pgnStats)
        this.graph.playerColor = playerColor
        this.hasMoves = true
        parsedMoves.forEach(parsedMove => {
            this.addMoveForFen(parsedMove.sourceFen, parsedMove.targetFen, parsedMove.moveSan, pgnStats)
        })
        this.addGameResultOnFen(lastFen, pgnStats.index)
        this.addStatsToRoot(pgnStats, this.variant)
    }

    addGameResultOnFen(fullFen, resultIndex) {
        var currNode = this.getNodeFromGraph(fullFen, true)
        if(!currNode.gameResults) {
            currNode.gameResults = []
        }
        currNode.gameResults.push(resultIndex)
    }
    addStatsToRoot(pgnStats, variant) {
        var targetNode = this.getNodeFromGraph(Common.rootFen(variant), true)
        if(!targetNode.details) {
            targetNode.details = emptyDetails()
        }
        let newDetails = this.getUpdatedMoveDetails(targetNode.details, pgnStats)
        targetNode.details = newDetails
    }

    getDetailsForFen(fullFen) {
        let node = this.getNodeFromGraph(simplifiedFen(fullFen), false)
        let details = node && node.details
        if (Number.isInteger(details)) {
            details = this.getUpdatedMoveDetails(emptyDetails(), this.graph.pgnStats[details])
        } else if(!details) {
            return emptyDetails()
        }
        details = this.updateCalculatedValues(details)   
        return details
    }

    updateCalculatedValues(details) {
        if(Number.isInteger(details.bestWin)) {
            details.bestWinGame = this.graph.pgnStats[details.bestWin]
            details.bestWinElo = this.getOpponentElo(this.graph.playerColor,details.bestWinGame)
        }
        if(Number.isInteger(details.worstLoss)) {
            details.worstLossGame = this.graph.pgnStats[details.worstLoss]
            details.worstLossElo = this.getOpponentElo(this.graph.playerColor,details.worstLossGame)
        }
        if(Number.isInteger(details.lastPlayed)) {
            details.lastPlayedGame = this.graph.pgnStats[details.lastPlayed]
        }
        details.count = details.whiteWins+details.blackWins+details.draws
        return details

    }

    addMoveForFen(fullSourceFen, fullTargetFen, move, resultObject) {
        var targetNode = this.getNodeFromGraph(fullTargetFen, true)
        let newDetails = this.getUpdatedMoveDetails(targetNode.details, resultObject)
        targetNode.details = newDetails

        var currNode = this.getNodeFromGraph(fullSourceFen, true)
        currNode.playedByMax = Math.max(currNode.playedByMax, this.getTargetDetailsCount(targetNode.details))
        if(!currNode.playedBy) {
            currNode.playedBy = {}
        }
        currNode.playedBy[move] = ''
    }

    getTargetDetailsCount(targetDetails) {
        if(!targetDetails) {
            return 0
        }
        if(Number.isInteger(targetDetails)) {
            //if details is an integer, then this has been played once
            return 1
        }
        return targetDetails.draws+targetDetails.blackWins+targetDetails.whiteWins
    }

    getNodeFromGraph(fullFen, addIfNull) {
        let fen = simplifiedFen(fullFen)
        var currNode = this.graph.nodes.get(fen)
        if(!currNode && addIfNull) {
            currNode = new GraphNode()
            currNode.fen = fen
            this.graph.nodes.set(fen, currNode)
        }
        return currNode
    }

    getUpdatedMoveDetails(currentMoveDetails, resultObject) {
        if(Number.isInteger(currentMoveDetails)) {
            // if this is the second stat object being added
            // calculate the first move details and then merge it with the second one
            currentMoveDetails = this.getUpdatedMoveDetails(emptyDetails(),
                            this.graph.pgnStats[currentMoveDetails])
        } else if(!currentMoveDetails) {
            // if this is the first stat being added to this node,
            // just write the index to calculate the stats later
            return resultObject.index
        }
        
        let whiteWin = 0, blackWin = 0, draw = 0, resultInt = 0;
        let playerColor = this.graph.playerColor
        if(resultObject.result === '1-0') {
            whiteWin = 1
            resultInt = playerColor === Constants.PLAYER_COLOR_WHITE? 1 : -1
        } else if (resultObject.result === '0-1') {
            blackWin = 1
            resultInt = playerColor === Constants.PLAYER_COLOR_BLACK? 1 : -1
        } else {
            draw = 1
        }

        let opponentElo = this.getOpponentElo(playerColor, resultObject)
        if(resultInt === 1) {
            let currentBestWinGame = null
            if(Number.isInteger(currentMoveDetails.bestWin)) {
                currentBestWinGame = this.graph.pgnStats[currentMoveDetails.bestWin]
            }
            if(!currentBestWinGame || parseInt(opponentElo)>parseInt(this.getOpponentElo(playerColor, currentBestWinGame))) {
                currentMoveDetails.bestWin = resultObject.index
            }
        }
        if(resultInt === -1) {
            let currentWorstLossGame = null
            if(Number.isInteger(currentMoveDetails.worstLoss)) {
                currentWorstLossGame = this.graph.pgnStats[currentMoveDetails.worstLoss]
            }
            if(!currentWorstLossGame || parseInt(opponentElo)<parseInt(this.getOpponentElo(playerColor, currentWorstLossGame))) {
                currentMoveDetails.worstLoss = resultObject.index
            }
        }
        let currentLastPlayedGame = null
        if(Number.isInteger(currentMoveDetails.lastPlayed)) {
            currentLastPlayedGame = this.graph.pgnStats[currentMoveDetails.lastPlayed]
        }
        if(!currentLastPlayedGame || 
            isDateMoreRecentThan(resultObject.date, currentLastPlayedGame.date)) {
                currentMoveDetails.lastPlayed = resultObject.index
        }
        currentMoveDetails.blackWins += blackWin
        currentMoveDetails.whiteWins += whiteWin
        currentMoveDetails.draws += draw
        currentMoveDetails.totalOpponentElo += parseInt(opponentElo)
        return currentMoveDetails
    }

    getOpponentElo(playerColor, resultObject) {
        if(playerColor === Constants.PLAYER_COLOR_WHITE) {
            return resultObject.blackElo
        }
        return resultObject.whiteElo
    }

    gameResultsForFen(fullFen) {
        let fen = simplifiedFen(fullFen)

        var currNode = this.graph.nodes.get(fen)
        if(currNode && currNode.gameResults) {
            return currNode.gameResults.map((index)=>this.graph.pgnStats[index])
        }
        return null
    }
    movesForFen(fullFen) {
        let fen = simplifiedFen(fullFen)

        var currNode = this.graph.nodes.get(fen)
        if(currNode && currNode.playedBy) {
            return Array.from(Object.entries(currNode.playedBy)).map((entry)=> {
                let chess = chessLogic(this.variant, fullFen)
                let move = chess.move(entry[0], {sloppy: true})
                let targetNodeDetails = this.getDetailsForFen(chess.fen())
                return {
                    orig:move.from,
                    dest:move.to,
                    level:this.levelFor(targetNodeDetails.count, currNode.playedByMax),
                    san:move.san,
                    details:targetNodeDetails
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
    constructor(arrayEntries, pgnStats){
        this.nodes = new Map()
        this.pgnStats = []
        this.playerColor = ''
        if(arrayEntries) {
            arrayEntries.forEach((entry)=> {
                this.nodes.set(entry[0],entry[1])
            })
        }
        if(pgnStats) {
            this.pgnStats = pgnStats
        }
    }
}

class GraphNode {
            playedByMax = 0 // used to keep track of how many times the most frequent move is played for ease of calculation later
            //playedBy = {}
            //gameResults = []
}

function emptyDetails() {
    return {
//        count: 0,
        blackWins: 0,
        whiteWins: 0,
        draws: 0,
        totalOpponentElo: 0,
//        bestWin:null,
//        bestWinGame:null,
//        worstLoss:null,
//        worstLossGame:null,
        lastPlayed:null
//        lastPlayedGame:null
    }
}
