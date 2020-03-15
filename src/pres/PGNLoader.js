import React from 'react'
import PGNReader from '../app/PGNReader'
import {Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList } from '@fortawesome/free-solid-svg-icons'

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
        this.props.clear()
        new PGNReader().parsePGN(this.state.playerName, this.props.notify)
        this.props.onChange("playerName", this.state.playerName)
    }

    handleChange(playerColor){
        return (()=>{
                this.props.onChange("playerColor", playerColor)
        }).bind(this)
    }
    render() {
        return <div>
            <div className = "pgnloadersection">
                Analyze games of: <br/>
                <input type="text" 
                        onChange= {this.playerNameChange.bind(this)} 
                        name="playerName" 
                        id="playerNameTextBox"
                        placeholder="Lichess user name"/>
                <button onClick = {this.load.bind(this)}>Load</button> </div>
                <div className="pgnloadersection">playing as: 
                    <div>
                    <Button onClick = {this.handleChange('white')} color = {this.props.settings.playerColor === 'white'?'secondary':'link'}>White</Button>
                    <Button onClick = {this.handleChange('black')} color = {this.props.settings.playerColor === 'black'?'secondary':'link'}>Black</Button>
                  </div>
                </div>
                {
                    this.props.gamesProcessed>0?
                    <div>
                        <div className="pgnloadersection">
                            {`Number of games Loaded: ${this.props.gamesProcessed}`}
                        </div>
                        <div onClick = {()=>this.props.switchToMovesTab()} className="navLinkButton pgnloadersection">
                            <FontAwesomeIcon icon={faList} /> View Moves>>
                        </div>
                    </div>
                        :""
                }

        </div>
    }
}