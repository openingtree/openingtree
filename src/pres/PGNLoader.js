import React from 'react'
import PGNReader from '../app/PGNReader'
import {Button} from 'reactstrap'

export default class PGNLoader extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            playerName:'',
            playerColor:this.props.settings.playerColor
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

    handleChange(eventState){
        return (()=> {this.setState({
                playerColor: eventState
            }, ()=> {
                this.props.onChange(this.state)
            })
        }).bind(this)
    }
    render() {
        return <div>
                View games of Lichess user: 
                <input type="text" 
                        value={this.state.value} 
                        onChange= {this.playerNameChange.bind(this)} 
                        name="playerName" 
                        id="playerNameTextBox"/>
                <button onClick = {this.load.bind(this)}>Load</button> 
                <div>Playing as: 
                    <div>
                    <Button onClick = {this.handleChange('white')} color = {this.state.playerColor === 'white'?'secondary':'link'}>White</Button>
                    <Button onClick = {this.handleChange('black')} color = {this.state.playerColor === 'black'?'secondary':'link'}>Black</Button>
                  </div>
                </div>

        </div>
    }
}