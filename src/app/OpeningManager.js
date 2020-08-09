import * as ChessLogic from './chess/ChessLogic'

export default class OpeningManager {
    plys = []
    currentIndex = 0
    constructor(variant) {
        this.plys = [{pgn:'', fen:ChessLogic.rootFen(variant), move:null}]
        this.currentIndex = 0
    }
    addPly(fen,move) {
        if(this.currentIndex<this.plys.length-1 && this.plys[this.currentIndex+1].move.san === move.san) {
            this.moveForward()
            return
        }
        this.plys = this.plys.slice(0,this.currentIndex+1)
        this.plys.push({
            pgnAsList:this.pgnAsList(move.san),
            fen: fen,
            move: move
        })
        this.currentIndex++;
        return this.plys[this.currentIndex]
    }

    pgnAsList(san) {
        let pgnSoFar = this.pgnListSoFar()
        let pgnList
        if (!pgnSoFar) {
            pgnList = []
        } else {
            pgnList = [...pgnSoFar]
        }
        let numPlys = this.plys.length
        if(numPlys%2 !== 0) {
            pgnList.push({
                moveNumber:pgnList.length+1,
                whitePly:san,
                blackPly:''
            })
        } else {
            let currMove = pgnList[pgnList.length-1]
            currMove.blackPly = san
            pgnList[pgnList.length-1] = currMove
        }
        return pgnList
    }

    currentMove() {
        return Math.floor((this.currentIndex-1)/2);
    }

    pgnListSoFar(){
        return this.plys[this.plys.length-1].pgnAsList
    }

    fen(){
        return this.plys[this.currentIndex].fen
    }

    moveForward() {
        return this.moveTo(this.currentIndex+1)
    }
    moveBack() {
        return this.moveTo(this.currentIndex-1)
    }
    moveTo(index) {
        if(index>=0 && index<this.plys.length) {
            this.currentIndex = index
        }
        return this.plys[this.currentIndex]
    }

}