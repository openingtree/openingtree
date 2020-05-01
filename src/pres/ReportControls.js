import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faUser } from '@fortawesome/free-solid-svg-icons'
import { Table, TableRow, TableHead, TableBody, TableCell, TableFooter, TextField } from '@material-ui/core';
import React from 'react'
import {getPerformanceDetails} from '../app/util'

export default class ControlsContainer extends React.Component {
    eatClicks(e) {
        e.stopPropagation()
    }

    copyFen() {
        /* Get the text field */
        var copyText = document.getElementById("fenField");
      
        /* Select the text field */
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/
      
        /* Copy the text inside the text field */
        document.execCommand("copy");
      
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
        if(!this.props.moveDetails.lastPlayedGame) {
            return <div>{this.getFenField()}<div className = "infoMessage" >No data to show. Please enter a lichess or chess.com user name in the 
                <span className = "navLinkButton" onClick={()=>this.props.switchToUserTab()}> <FontAwesomeIcon icon={faUser} /> User</span> tab and click "Load"</div>
                </div>
        }
        let performanceDetails = {}
        if(this.props.isOpen) {
            performanceDetails = getPerformanceDetails(this.props.moveDetails.totalOpponentElo, 
                                                        this.props.moveDetails.whiteWins, 
                                                        this.props.moveDetails.draws, 
                                                        this.props.moveDetails.blackWins, 
                                                        this.props.settings.playerColor)
        } 

        return <div>
            {this.getFenField()}
            <Table onClick={this.eatClicks}>
            {isNaN(performanceDetails.performanceRating)?null:            <TableHead className={`performanceRatingRow${this.props.simplifiedView?" performanceHeader":""}`}><TableRow>
                <TableCell className="performanceRatingRow"><b>Performance</b></TableCell>
                <TableCell className="performanceRatingRow"><b>{performanceDetails.performanceRating}</b></TableCell>
                </TableRow></TableHead>}
            <TableBody>
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Results</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.results}</TableCell>
            </TableRow>
            {isNaN(performanceDetails.averageElo)?null:
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Avg opponent</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.averageElo}</TableCell>
            </TableRow>}
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Score</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.score}</TableCell>
            </TableRow>
            {this.props.simplifiedView || isNaN(performanceDetails.averageElo)?null:
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Rating change</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.ratingChange}</TableCell>
            </TableRow>
            }
            {!this.props.simplifiedView && this.props.moveDetails.bestWin?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Best win</TableCell>
                <TableCell className="performanceRatingRow">{this.props.moveDetails.bestWin} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(this.props.moveDetails.bestWinGame)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            {!this.props.simplifiedView && this.props.moveDetails.worstLoss?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Worst loss</TableCell>
                <TableCell className="performanceRatingRow">{this.props.moveDetails.worstLoss} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(this.props.moveDetails.worstLossGame)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Last played</TableCell>
                <TableCell className="performanceRatingRow">{this.removeQuestionMarksFromDate(this.props.moveDetails.lastPlayedGame.date)} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(this.props.moveDetails.lastPlayedGame)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>
            </TableBody>
            {this.props.simplifiedView?null:
            <TableFooter>
                <TableRow>
                    <TableCell colSpan="2">Calculated based on <a href="https://handbook.fide.com/chapter/B022017" target="_blank" rel="noopener noreferrer">FIDE regulations</a></TableCell>
                </TableRow>
            </TableFooter>
            }
        </Table></div>
    }

    removeQuestionMarksFromDate(date) {
        if(date.indexOf('?') === -1) {
            return date
        }
        return date.slice(0, date.indexOf('.'))
    }
}