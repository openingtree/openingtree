
class OpeningGraph {
    graph = new Graph()
    clear() {
        this.graph = new Graph()
    }
    addGameResultOnFen(fen, gameResult) {
        var currNode = this.graph.nodes.get(fen)
        if(!currNode) {
            currNode = new GraphNode()
            currNode.fen = fen
            this.graph.nodes.set(fen, currNode)
        }
        currNode.gameResults.push(gameResult)
    }
    addMoveForFen(fen, move, result) {
        var currNode = this.graph.nodes.get(fen)
        if(!currNode) {
            currNode = new GraphNode()
            currNode.fen = fen
            this.graph.nodes.set(fen, currNode)
        }
        var movesPlayedBy = currNode.playedBy
        var movePlayedBy = movesPlayedBy.get(move.san)
        if(!movePlayedBy) {
            movePlayedBy = new GraphMove()
            movePlayedBy.move = move
            movesPlayedBy.set(move.san, movePlayedBy)
        }

        let whiteWin = 0, blackWin = 0, draw = 0
        if(result === '1-0') {
            whiteWin = 1
        } else if (result === '0-1') {
            blackWin = 1
        } else {
            draw = 1
        }
        movePlayedBy.count += 1
        movePlayedBy.blackWins += blackWin
        movePlayedBy.whiteWins += whiteWin
        movePlayedBy.draws += draw
        
        currNode.playedByMax = Math.max(currNode.playedByMax, movePlayedBy.count)
        
        currNode.playedBy = movesPlayedBy

        
    }
    addMoveAgainstFen(fen, move, result) {
        var currNode = this.graph.nodes.get(fen)
        if(!currNode) {
            currNode = new GraphNode()
            currNode.fen = fen
            this.graph.nodes.set(fen, currNode)
        }
        var movesPlayedAgainst = currNode.playedAgainst
        var movePlayedAgainst = movesPlayedAgainst.get(move.san)
        if(!movePlayedAgainst) {
            movePlayedAgainst = new GraphMove()
            movePlayedAgainst.move = move
            movesPlayedAgainst.set(move.san, movePlayedAgainst)
        }
        let whiteWin = 0, blackWin = 0, draw = 0
        if(result === '1-0') {
            whiteWin = 1
        } else if (result === '0-1') {
            blackWin = 1
        } else {
            draw = 1
        }
        movePlayedAgainst.count += 1
        movePlayedAgainst.blackWins += blackWin
        movePlayedAgainst.whiteWins += whiteWin
        movePlayedAgainst.draws += draw
        
        currNode.playedAgainstMax = Math.max(currNode.playedAgainstMax, movePlayedAgainst.count)
        
        currNode.playedAgainst = movesPlayedAgainst
    }
    gameResultsForFen(fen) {
        var currNode = this.graph.nodes.get(fen)
        if(currNode) {
            return currNode.gameResults
        }
        return null
    }
    movesForFen(fen) {
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
                    san:gMove.move.san
                }
            })
        }        
        return null
    }
    movesAgainstFen(fen) {
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
                    san:gMove.move.san
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
    nodes = new Map(/*[
        ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
                    'playedByMax' : 5,
                    'playedBy':new Map([['e4',{'count':5,'move': {'from':'e2', to:'e4'}}]])
        }],
        ['rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', {
            'playedByMax' : 10,
            'playedBy':new Map([['Nf6',{'count':3,'move': {'from':'g8', to:'f6'}}]])
        }]
                ]*/)
    rootNode = null

}

class GraphNode {
    fen = ''
    //totalCount = 0
    //children = new Map() //map of Move to fen
    playedByMax = 0 // used to keep track of how many times the most frequent move is played for ease of calculation later
    playedBy = new Map()
    playedAgainstMax = 0
    playedAgainst = new Map()
    gameResults = []
//    engineAnalyses = []
//    filters = {}
    properties = {}
}

class GraphMove {
    fen = ''
    move = {}
    count = 0
    blackWins = 0
    whiteWins = 0
    draws = 0
}

/*class EngineAnalysis {
    engineNme = ''
    searchDepth = 0
    evaluation = 0.0
}*/

export const openingGraph = new OpeningGraph()