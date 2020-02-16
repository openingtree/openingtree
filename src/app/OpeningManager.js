
export default class OpeningManager {
    plys = [{pgn:'', fen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move:{from:'x1', to:'x2', san:''}}]
    currentIndex = 0
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
                blackPly:'-'
            })
        } else {
            let currMove = pgnList[pgnList.length-1]
            currMove.blackPly = san
            pgnList[pgnList.length-1] = currMove
        }
        return pgnList
    }

    pgnListSoFar(){
        return this.plys[this.currentIndex].pgnAsList
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