import React from 'react'
import MovesTable from './MovesTable'
import ResultsTable from './ResultsTable';
import { Spinner } from 'reactstrap';
import {Card, CardBody, CardText, CardTitle} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import { Button as MaterialUIButton } from '@material-ui/core'
import Cached from '@material-ui/icons/Cached'

export default class BookMove extends React.Component {

    render(){
        if(!this.props.bookMoves) {
            return <div className = "infoMessage" >No book moves found in this position</div>
        }
        return <div>{(this.props.gameResults && this.props.gameResults.length>0)?this.resultsTable():null}
                {this.movesTable()}</div>
    }

    movesTable() {
        if(this.props.bookMoves.fetch === "pending") {
            return <div className="center"><br/><Spinner/></div>
        }
        if(this.props.bookMoves.fetch === "failed") {
            return <Card className="errorCard"><CardBody className="singlePadding">
            <CardTitle className="smallBottomMargin"><FontAwesomeIcon icon={faInfoCircle} className="lowOpacity"/> Failed to fetch book moves</CardTitle>
            <CardText className="smallText">
                Please check your internet connection. Lichess could also be down.
                <br/>
                <br/><MaterialUIButton
                onClick={this.props.forceFetchBookMoves}
                variant="contained"
                color="default"
                className="mainButton" disableElevation
                startIcon={<Cached />}
                >
                    Try again
                </MaterialUIButton>
            </CardText>
            </CardBody>
            </Card>
        }

        return <MovesTable movesToShow={this.props.bookMoves.moves} namespace='book'
                launchGame={this.props.launchGame} settings={this.props.settings}
                turnColor={this.props.turnColor} onMove={this.props.onMove}
                clickedEventName="BookMoveClicked" showAsPercentage
                highlightMove={this.props.highlightMove} 
                compareToClicked={this.props.switchToMovesTab}
                compareToAlt="Indicator for player moves - Click me"/>
    }
    resultsTable() {
        return <ResultsTable gameResults={this.props.gameResults}
                launchGame={this.props.launchGame}/>
    }
}