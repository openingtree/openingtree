import {simplifiedFen, isDateMoreRecentThan} from './util'
import * as Constants from './Constants'
import Chess from 'chess.js'

class OpeningGraph {
    constructor() {
        this.graph=new Graph()
        this.hasMoves = false
    }
    setEntries(arrayEntries){
        this.graph=new Graph(arrayEntries)
        this.hasMoves = true
    }

    clear() {
        this.graph = new Graph()
        this.hasMoves = false
    }

    addPGN(pgnStats, parsedMoves, lastFen, playerColor) {
        this.graph.pgnStats.push(pgnStats)
        this.graph.playerColor = playerColor
        this.hasMoves = true
        parsedMoves.forEach(parsedMove => {
            this.addMoveForFen(parsedMove.sourceFen, parsedMove.targetFen, parsedMove.move, pgnStats, this.graph.pgnStats.length-1)
        })
        this.addGameResultOnFen(lastFen, this.graph.pgnStats.length-1)
        this.addStatsToRoot(pgnStats)
    }

    addGameResultOnFen(fullFen, resultIndex) {
        var currNode = this.getNodeFromGraph(fullFen)
        currNode.gameResults.push(resultIndex)
    }
    addStatsToRoot(pgnStats) {
        var targetNode = this.getNodeFromGraph(Constants.ROOT_FEN)
        let newDetails = this.getUpdatedMoveDetails(targetNode.details, pgnStats, targetNode.details)
        targetNode.details = newDetails
    }

    getDetailsForFen(fullFen) {
        let details = this.getNodeFromGraph(simplifiedFen(fullFen)).details
        if (Number.isInteger(details)) {
            return this.getUpdatedMoveDetails(emptyDetails(), this.graph.pgnStats[details])
        } else if(!details) {
            return emptyDetails()
        } 
        return details
    }

    addMoveForFen(fullSourceFen, fullTargetFen, move, resultObject, resultIndex) {
        var targetNode = this.getNodeFromGraph(fullTargetFen)
        let newDetails = this.getUpdatedMoveDetails(targetNode.details, resultObject, resultIndex)
        targetNode.details = newDetails

        var currNode = this.getNodeFromGraph(fullSourceFen)
        currNode.playedByMax = Math.max(currNode.playedByMax, this.getTargetDetailsCount(targetNode.details))
        currNode.playedBy[move.san] = ''
    }

    getTargetDetailsCount(targetDetails) {
        if(!targetDetails) {
            return 0
        }
        if(Number.isInteger(targetDetails)) {
            return 1
        }
        return targetDetails.count
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
    createOrGetMoveNode(movesPlayedNode, move, fullTargetFen){
        var movePlayed = movesPlayedNode[move.san]

        if(!movePlayed) {
            movePlayed = new GraphMove()
            movePlayed.move = move
            movePlayed.fen = simplifiedFen(fullTargetFen)
            movesPlayedNode[move.san]= movePlayed
        }
        return movesPlayedNode
    }

    getUpdatedMoveDetails(currentMoveDetails, resultObject, resultObjectIndex) {
        if(Number.isInteger(currentMoveDetails)) {
            // if this is the second stat object being added
            // calculate the first move details and then merge it with the second one
            currentMoveDetails = this.getUpdatedMoveDetails(emptyDetails(),
                            this.graph.pgnStats[currentMoveDetails],resultObjectIndex)
        } else if(!currentMoveDetails) {
            // if this is the first stat being added to this node,
            // just write the index to calculate the stats later
            return resultObjectIndex
        }
        
        let whiteWin = 0, blackWin = 0, draw = 0, opponentElo=0, resultInt = 0;
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

        if(playerColor === Constants.PLAYER_COLOR_WHITE) {
            opponentElo = resultObject.blackElo
        } else {
            opponentElo = resultObject.whiteElo
        }
        if(resultInt === 1) {
            if(!currentMoveDetails.bestWin || parseInt(opponentElo)>parseInt(currentMoveDetails.bestWin)) {
                currentMoveDetails.bestWin = opponentElo
                currentMoveDetails.bestWinGame = resultObject
            }
        }
        if(resultInt === -1) {
            if(!currentMoveDetails.worstLoss || parseInt(opponentElo)<parseInt(currentMoveDetails.worstLoss)) {
                currentMoveDetails.worstLoss = opponentElo
                currentMoveDetails.worstLossGame = resultObject
            }
        }
        if(!currentMoveDetails.lastPlayedGame || 
            isDateMoreRecentThan(resultObject.date, currentMoveDetails.lastPlayedGame.date)) {
                currentMoveDetails.lastPlayedGame = resultObject
        }
        currentMoveDetails.count += 1
        currentMoveDetails.blackWins += blackWin
        currentMoveDetails.whiteWins += whiteWin
        currentMoveDetails.draws += draw
        currentMoveDetails.totalOpponentElo += parseInt(opponentElo)
        return currentMoveDetails
    }

    gameResultsForFen(fullFen) {
        let fen = simplifiedFen(fullFen)

        var currNode = this.graph.nodes.get(fen)
        if(currNode) {
            return currNode.gameResults.map((index)=>this.graph.pgnStats[index])
        }
        return null
    }
    movesForFen(fullFen) {
        let fen = simplifiedFen(fullFen)

        var currNode = this.graph.nodes.get(fen)
        if(currNode) {
            return Array.from(Object.entries(currNode.playedBy)).map((entry)=> {
                let chess = new Chess(fullFen)
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
    constructor(arrayEntries){
        this.nodes = new Map()
        this.pgnStats = []
        this.playerColor = ''
        if(arrayEntries) {
            arrayEntries.forEach((entry)=> {
                this.nodes.set(entry[0],entry[1])
            })
        }
    }
}

class GraphNode {
            playedByMax = 0 // used to keep track of how many times the most frequent move is played for ease of calculation later
            playedBy = {}
            gameResults = []
}

class GraphMove {
    fen = ''
    move = {}
}

function emptyDetails() {
    return {
        count: 0,
        blackWins: 0,
        whiteWins: 0,
        draws: 0,
        totalOpponentElo: 0,
        bestWin:null,
        bestWinGame:null,
        worstLoss:null,
        worstLossGame:null,
        lastPlayedGame:null
    }
}

export const openingGraph = new OpeningGraph()