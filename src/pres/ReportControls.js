import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { Table, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@material-ui/core';
import React from 'react'
import {getPerformanceDetails} from '../app/util'

export default class ControlsContainer extends React.Component {
    constructor(props) {
        super(props)
    }
    eatClicks(e) {
        e.stopPropagation()
    }
    render() {
        let performanceDetails = {}
        if(this.props.isOpen) {
            performanceDetails = getPerformanceDetails(this.props.moveDetails.totalOpponentElo, 
                                                        this.props.moveDetails.whiteWins, 
                                                        this.props.moveDetails.draws, 
                                                        this.props.moveDetails.blackWins, 
                                                        this.props.settings.playerColor)
        } 

        return <Table onClick={this.eatClicks}>
            <TableHead className="performanceRatingRow performanceHeader"><TableRow>
                <TableCell className="performanceRatingRow"><b>Performance</b></TableCell>
                <TableCell className="performanceRatingRow"><b>{performanceDetails.performanceRating}</b></TableCell>
                </TableRow></TableHead>
            <TableBody>
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Avg opponent</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.averageElo}</TableCell>
            </TableRow>
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Score</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.score}</TableCell>
            </TableRow>
            {this.props.moveDetails.bestWin?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Best win</TableCell>
                <TableCell className="performanceRatingRow">{this.props.moveDetails.bestWin} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launch(this.props.moveDetails.bestWinGame.url)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            {this.props.moveDetails.worstLoss?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Worst loss</TableCell>
                <TableCell className="performanceRatingRow">{this.props.moveDetails.worstLoss} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launch(this.props.moveDetails.worstLossGame.url)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Last played</TableCell>
                <TableCell className="performanceRatingRow">{this.props.moveDetails.lastPlayedGame.date} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launch(this.props.moveDetails.lastPlayedGame.url)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>
            </TableBody>
            <TableFooter><TableRow><TableCell colSpan="2">Calculated based on <a href="https://handbook.fide.com/chapter/B022017" target="_blank" rel="noopener noreferrer">FIDE regulations</a></TableCell></TableRow></TableFooter>
        </Table>
    }
}