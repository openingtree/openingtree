import React from 'react'
import PGNReader from '../app/PGNReader'
import {Button} from 'reactstrap'

export default class PGNLoader extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            playerName:'',
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

    handleChange(playerColor){
        return (()=>{
                this.props.onChange("playerColor", playerColor)
        }).bind(this)
    }
    render() {
        return <div>
                View games of Lichess user: 
                <input type="text" 
                        onChange= {this.playerNameChange.bind(this)} 
                        name="playerName" 
                        id="playerNameTextBox"/>
                <button onClick = {this.load.bind(this)}>Load</button> 
                <div>Playing as: 
                    <div>
                    <Button onClick = {this.handleChange('white')} color = {this.props.settings.playerColor === 'white'?'secondary':'link'}>White</Button>
                    <Button onClick = {this.handleChange('black')} color = {this.props.settings.playerColor === 'black'?'secondary':'link'}>Black</Button>
                  </div>
                </div>

        </div>
    }
}