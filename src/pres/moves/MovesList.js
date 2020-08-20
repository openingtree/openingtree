import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import MovesTable from './MovesTable'
import ResultsTable from './ResultsTable';

export default class MovesList extends React.Component {

    render(){
        if(!this.props.movesToShow) {
            return <div className = "infoMessage" >No moves to show. Please select a source from the 
                <span className = "navLinkButton" onClick={()=>this.props.switchToUserTab()}> <FontAwesomeIcon icon={faUser} /> User</span> tab and enter the details.</div>
        }
        return <div>{(this.props.gameResults && this.props.gameResults.length>0)?this.resultsTable():null}
                {this.movesTable()}</div>
    }

    movesTable() {
        return <MovesTable movesToShow={this.props.movesToShow}
                launchGame={this.props.launchGame} settings={this.props.settings}
                turnColor={this.props.turnColor} onMove={this.props.onMove}
                clickedEventName="MoveClicked"/>
    }
    resultsTable() {
        return <ResultsTable gameResults={this.props.gameResults}
                launchGame={this.props.launchGame}/>
    }

}