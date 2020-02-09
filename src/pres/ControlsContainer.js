import React from 'react'
import PGNLoader from './PGNLoader'
import SettingsView from './Settings'

export default class ControlsContainer extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            lastMove: null,
            playerName:'',
            settings:{
              orientation:'white',
              playerColor:'white'
            }
          }
      }

    render(){
        return <div>
            <div>Number of games processed: {this.props.gamesProcessed}</div>
            <PGNLoader notify = {this.props.updateProcessedGames}/>
            <SettingsView onChange = {this.props.settingsChange}/>
            <div>
                <button onClick = {this.props.reset}>Reset</button>
                <button onClick = {this.props.clear}>Clear</button>
            </div>
        </div>
    }
}