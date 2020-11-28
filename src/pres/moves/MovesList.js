import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import MovesTable from './MovesTable'
import ResultsTable from './ResultsTable';

export default class MovesList extends React.Component {

    render(){
        if(!this.props.playerMoves) {
            return <div className = "infoMessage" >No moves to show. Please select a source from the 
                <span className = "navLinkButton" onClick={()=>this.props.switchToUserTab()}> <FontAwesomeIcon icon={faUser} /> User</span> tab and enter the details.</div>
        }
        return <div>{(this.props.gameResults && this.props.gameResults.length>0)?this.resultsTable():null}
                {this.movesTable()}</div>
    }

    movesTable() {
        return <MovesTable movesToShow={this.props.playerMoves} namespace='moves'
                launchGame={this.props.launchGame} settings={this.props.settings}
                turnColor={this.props.turnColor} onMove={this.props.onMove}
                clickedEventName="MoveClicked" tableFooter={this.tableFooter()}
                highlightMove={this.props.highlightMove} 
                compareToClicked={this.props.switchToBookTab}
                compareToAlt="Indicator for book moves - Click me"
                settingsChange={this.props.settingsChange}
                variant={this.props.variant}
                highlightArrow={this.props.highlightArrow}
                />
    }
    resultsTable() {
        return <ResultsTable gameResults={this.props.gameResults}
                launchGame={this.props.launchGame}/>
    }

    tableFooter() {
        let hasMoves = (this.props.playerMoves && this.props.playerMoves.length>0)
        if(this.props.settings.playerName) {
            if(hasMoves) {
                return <span>
                    Showing moves that have been  played {this.props.turnColor === this.props.settings.playerColor? "by" : "by others against"} <b>{this.props.settings.playerName}</b> in 
                    this position. <b>{this.props.settings.playerName}</b> is playing as <b>{this.props.settings.playerColor}</b>.
                    </span>
            } else {
                return <span>No moves found played by {this.props.turnColor === this.props.settings.playerColor? "by" : "by others against"} <b>{this.props.settings.playerName}</b> in 
                    this position. <b>{this.props.settings.playerName}</b> is playing as <b>{this.props.settings.playerColor}</b>.</span>
            }
        } else {
            if(hasMoves) {
                return <span>
                    Showing all moves that have been played by <b>{this.props.turnColor}</b> in this position.
                    </span>
            } else {
                return <span>
                    No moves found played by <b>{this.props.turnColor}</b> in this position.
                    </span>
            }
        }
    }

}