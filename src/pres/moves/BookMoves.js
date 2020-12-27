import React from 'react'
import MovesTable from './MovesTable'
import ResultsTable from './ResultsTable';
import { Spinner } from 'reactstrap';
import {Card, CardBody, CardText, CardTitle} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import { Button as MaterialUIButton } from '@material-ui/core'
import Cached from '@material-ui/icons/Cached'
import * as Constants from '../../app/Constants'

export default class BookMove extends React.Component {

    render(){
        if(!this.props.bookMoves) {
            return <div className = "infoMessage" >No book moves found in this position</div>
        }
        return <div>{(this.props.gameResults && this.props.gameResults.length>0)?this.resultsTable():null}
                {this.movesTable()}</div>
    }

    enableBook(){
        let newMovesSettings = Object.assign({},this.props.settings.movesSettings)
        newMovesSettings.openingBookType = Constants.OPENING_BOOK_TYPE_LICHESS
        this.props.settingsChange(Constants.SETTING_NAME_MOVES_SETTINGS, newMovesSettings)
    }

    movesTable() {
        if(this.props.bookMoves.fetch === "pending") {
            return <div className="center"><br/><Spinner/></div>
        }
        if(this.props.bookMoves.fetch === "off") {
            return this.offCard('Opening book is disabled',
                'Click the button below to enable it',
                this.enableBook.bind(this),'Enable opening book', <Cached />)
        }

        if(this.props.bookMoves.fetch === "failed") {
            return this.offCard('Failed to fetch book moves',
                'Please check your internet connection. Lichess could also be down.',
                this.props.forceFetchBookMoves,'Try again', <Cached />)
        }
        if(this.props.bookMoves.moves.length === 0) {
            return this.offCard('No moves found',
                'The opening book does not have any moves in this position')
        }

        return <MovesTable movesToShow={this.props.bookMoves.moves} namespace='book'
                launchGame={this.props.launchGame} settings={this.props.settings}
                turnColor={this.props.turnColor} onMove={this.props.onMove}
                clickedEventName="BookMoveClicked" tab="book" showAsPercentage
                highlightMove={this.props.highlightMove} 
                compareToClicked={this.props.switchToMovesTab}
                compareToAlt="Indicator for player moves - Click me"
                settingsChange={this.props.settingsChange}
                variant={this.props.variant}
                highlightArrow={this.props.highlightArrow}
                />
    }

    offCard(title, message, action, actionText, actionIcon) {
        return <Card className="errorCard"><CardBody className="singlePadding">
        <CardTitle className="smallBottomMargin"><FontAwesomeIcon icon={faInfoCircle} className="lowOpacity"/> {title}</CardTitle>
        <CardText className="smallText">
            {message}
            <br/>
            <br/>
            {actionText?<MaterialUIButton
            onClick={action}
            variant="contained"
            color="default"
            className="mainButton" disableElevation
            startIcon={actionIcon}
            >
                {actionText}
            </MaterialUIButton>:null}
        </CardText>
        </CardBody>
        </Card>
    }
    resultsTable() {
        return <ResultsTable gameResults={this.props.gameResults}
                launchGame={this.props.launchGame}/>
    }
}