import React from 'react'
import MovesTable from './MovesTable'
import ResultsTable from './ResultsTable';

export default class BookMove extends React.Component {

    render(){
        if(!this.props.bookMoves) {
            return <div className = "infoMessage" >No book moves found in this position</div>
        }
        return <div>{(this.props.gameResults && this.props.gameResults.length>0)?this.resultsTable():null}
                {this.movesTable()}</div>
    }

    movesTable() {
        return <MovesTable movesToShow={this.props.bookMoves} namespace='book'
                launchGame={this.props.launchGame} settings={this.props.settings}
                turnColor={this.props.turnColor} onMove={this.props.onMove}
                clickedEventName="BookMoveClicked" showAsPercentage/>
    }
    resultsTable() {
        return <ResultsTable gameResults={this.props.gameResults}
                launchGame={this.props.launchGame}/>
    }
}