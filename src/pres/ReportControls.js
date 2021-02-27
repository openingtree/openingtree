import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faUser } from '@fortawesome/free-solid-svg-icons'
import { Table, TableRow, TableHead, TableBody, TableCell, TableFooter, TextField } from '@material-ui/core';
import React from 'react'
import {getPerformanceDetails} from '../app/util'
import {copyText} from './loader/Common'

export default class ReportControls extends React.Component {
    eatClicks(e) {
        e.stopPropagation()
    }

    copyFen() {
        copyText("fenField")/* Get the text field */
        /* Alert the copied text */
        this.props.showInfo("FEN copied");
    }

    getFenField() {
        return this.props.simplifiedView?null:
            <div className="fenDiv">
            <TextField
                id="fenField"
                multiline
                label="FEN"
                rowsMax="2"
                value={this.props.fen}
                inputProps={{
                    style: {fontSize: 12},
                    spellCheck: false,
                  }}
                  variant="outlined"
                className="fenField"
                margin="dense"
                onClick = {this.copyFen.bind(this)}
                /></div>
    }


    render() {
        let moveDetails = this.props.moveDetails
        if(!moveDetails.hasData) {
            return <div>{this.getFenField()}<div className = "infoMessage" >No data to show. Please enter a lichess or chess.com user name in the
                <span className = "navLinkButton" onClick={()=>this.props.switchToUserTab()}> <FontAwesomeIcon icon={faUser} /> User</span> tab and click "Load"</div>
                </div>
        }
        let performanceDetails = {}
        if(this.props.isOpen) {
            performanceDetails = getPerformanceDetails(moveDetails.totalOpponentElo,
                                                        moveDetails.averageElo,
                                                        moveDetails.whiteWins,
                                                        moveDetails.draws,
                                                        moveDetails.blackWins,
                                                        this.props.settings.playerColor)
        }

        return <div className="performanceOverlay">
            {this.getFenField()}
            <Table onClick={this.eatClicks}>
            {!performanceDetails.performanceRating || (isNaN(performanceDetails.performanceRating) || !this.props.settings.playerName)?
            null:
            <TableHead className={`performanceRatingRow${this.props.simplifiedView?" performanceHeader":""}`}>
                <TableRow>
                <TableCell className="performanceRatingRow"><b>Performance</b></TableCell>
                <TableCell className="performanceRatingRow"><b>{performanceDetails.performanceRating}</b></TableCell>
                </TableRow>
            </TableHead>}
            <TableBody>
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Results</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.results}</TableCell>
            </TableRow>
            {(isNaN(performanceDetails.averageOpponentElo) || performanceDetails.averageOpponentElo <= 0 || !this.props.settings.playerName)?null:
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Avg opponent</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.averageOpponentElo}</TableCell>
            </TableRow>}
            {(isNaN(performanceDetails.averageElo))?null:
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Avg Rating</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.averageElo}</TableCell>
            </TableRow>}
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Score</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.score}</TableCell>
            </TableRow>
            {((this.props.simplifiedView || isNaN(performanceDetails.averageElo)) || !this.props.settings.playerName)?null:
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Rating change</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.ratingChange}</TableCell>
            </TableRow>
            }
            {(this.props.settings.playerName && !this.props.simplifiedView && moveDetails.bestWinElo)?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Best win</TableCell>
                <TableCell className="performanceRatingRow">{moveDetails.bestWinElo} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(moveDetails.bestWinGame)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            {(this.props.settings.playerName && !this.props.simplifiedView && moveDetails.worstLossElo)?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Worst loss</TableCell>
                <TableCell className="performanceRatingRow">{moveDetails.worstLossElo} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(moveDetails.worstLossGame)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            {(!this.props.simplifiedView && moveDetails.longestGameInfo)?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Longest game</TableCell>
                <TableCell className="performanceRatingRow">{moveDetails.longestGameInfo.numberOfPlys} Plys <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(moveDetails.longestGameInfo)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            {(!this.props.simplifiedView && moveDetails.shortestGameInfo)?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Shortest game</TableCell>
                <TableCell className="performanceRatingRow">{moveDetails.shortestGameInfo.numberOfPlys} Plys <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(moveDetails.shortestGameInfo)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}

            {moveDetails.lastPlayedGame?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Last played</TableCell>
                <TableCell className="performanceRatingRow">{this.removeQuestionMarksFromDate(moveDetails.lastPlayedGame.date)} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(moveDetails.lastPlayedGame)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            </TableBody>
            {!this.props.reportFooter?null:
            <TableFooter>
                <TableRow>
                    <TableCell colSpan="2">{this.props.reportFooter}</TableCell>
                </TableRow>
            </TableFooter>
            }
        </Table></div>
    }

    removeQuestionMarksFromDate(date) {
        if(!date || date.indexOf('?') === -1) {
            return date
        }
        return date.slice(0, date.indexOf('.'))
    }
}