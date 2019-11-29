import React from 'react'
import ChessEcoCodes from 'chess-eco-codes'
import OpeningManager from '../app/OpeningManager'

export default class Navigator extends React.Component {
    
    constructor(props){
        super(props)
        this.openingManager = new OpeningManager()
        
    }

    shouldComponentUpdate(newProps) {
        //console.log(newProps)
        if(newProps.fen !== this.openingManager.fen()) {
            this.openingManager.addPly(newProps.fen, newProps.move)
            return true
        }
        return false
    }

    previous() {
        let newState = this.openingManager.moveBack()
        this.props.onChange(newState.fen, newState.move)
    }

    next() {
        let newState = this.openingManager.moveForward()
        this.props.onChange(newState.fen, newState.move)
    }

    render(){
        let opening = ChessEcoCodes(this.openingManager.fen())
        if (opening) {
            this.opening = opening.name
        }
        return <div><button onClick= {this.previous.bind(this)}>prev</button> {this.openingManager.pgnSoFar()} <button onClick = {this.next.bind(this)}>next</button><div>{this.opening}</div></div>
    }
}