
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
            pgn: this.nextPGN(move.san),
            fen: fen,
            move: move
        })
        this.currentIndex++;
        return this.plys[this.currentIndex]
    }

    nextPGN(san) {
        let numPlys = this.plys.length
        return `${this.pgnSoFar()} ${(numPlys+1)%2 === 0? `${(numPlys+1)/2}.` : ``} ${san}`
    }

    pgnSoFar(){
        return this.plys[this.currentIndex].pgn
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