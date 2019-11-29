import React from 'react'
import PGNReader from '../app/PGNReader'

export default class PGNLoader extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            playerName:''
        }
    }
    playerNameChange(event) {
        this.setState({
            playerName:event.target.value
        })
    }
    load() {
        new PGNReader().parsePGN(this.state.playerName, this.props.notify)
    }
    render() {
        return <div><input type="text" value={this.state.value} onChange= {this.playerNameChange.bind(this)} name="playerName" id="playerNameTextBox"/><button onClick = {this.load.bind(this)}>Load</button> </div>
    }
}