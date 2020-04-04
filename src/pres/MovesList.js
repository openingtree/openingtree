import {Progress, Popover } from "reactstrap"
import React from 'react'
import { Table, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import {getPerformanceDetails} from '../app/util'
import * as Constants from '../app/Constants'
import {trackEvent} from '../app/Analytics'

export default class MovesList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            openPerformanceIndex: null
        }
    }

    move(from, to) {
        return () => {
            this.props.onMove(from, to)
            trackEvent(Constants.EVENT_CATEGORY_MOVES_LIST, "MoveClicked")
        }
    }
    launch(url) {
        return (e) => {
            e.stopPropagation()
            window.open(url, '_blank');
            trackEvent(Constants.EVENT_CATEGORY_MOVES_LIST, "ViewGameExternal")

        }
    }
    togglePerformancePopover(moveIndex) {
        return (e) => {
            if(this.state.openPerformanceIndex !== null) {
                this.setState({openPerformanceIndex:null})
            } else {
                this.setState({openPerformanceIndex: moveIndex})
            }
            e.stopPropagation()
        }
    }
    render(){
        if(!this.props.settings.playerName) {
            return <div className = "infoMessage" >No moves to show. Please enter a lichess or chess.com user name in the 
                <span className = "navLinkButton" onClick={()=>this.props.switchToUserTab()}> <FontAwesomeIcon icon={faUser} /> User</span> tab and click "Load"</div>
        }
    return <div>{(this.props.gameResults && this.props.gameResults.length>0)?this.resultsTable():null}
                {this.movesTable()}</div>
    }
    resultsTable() {
        return <Table>
            <TableBody>
                {
                this.props.gameResults.map(result => {
                    let whitePlayer = this.player(result.white, result.whiteElo)
                    let blackPlayer = this.player(result.black, result.blackElo)
                    return <TableRow className="moveRow" key = {`${result.url}`} onClick={this.launch(result.url)}>
                        <TableCell>
                            {result.result==="1-0"?<b>{whitePlayer}</b>:whitePlayer} {result.result} {result.result === "0-1"?<b>{blackPlayer}</b>:blackPlayer}
                        </TableCell>
                    </TableRow>
                })}
            </TableBody>
        </Table>
    }
    player(name, elo) {
        return `${name}(${elo})`
    }
    eatClicks(e) {
        e.stopPropagation()
    }
    getPopover(moveIndex) {
        let performancePopoverOpen = this.state.openPerformanceIndex === moveIndex
        let performanceDetails = {}
        let openMove = this.props.movesToShow[moveIndex]
        if(performancePopoverOpen) {
            performanceDetails = getPerformanceDetails(openMove.details.totalOpponentElo, 
                                                        openMove.whiteWins, 
                                                        openMove.draws, 
                                                        openMove.blackWins, 
                                                        this.props.settings.playerColor)
        } 

        return <Popover trigger="hover" placement="right" isOpen={performancePopoverOpen} target={`performancePopover${moveIndex}`} toggle={this.togglePerformancePopover(moveIndex)}>
        <Table onClick={this.eatClicks}>
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
            {openMove.details.bestWin?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Best win</TableCell>
                <TableCell className="performanceRatingRow">{openMove.details.bestWin}</TableCell>
            </TableRow>:null}
            {openMove.details.worstLoss?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Worst loss</TableCell>
                <TableCell className="performanceRatingRow">{openMove.details.worstLoss}</TableCell>
            </TableRow>:null}
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Last played</TableCell>
                <TableCell className="performanceRatingRow">{openMove.details.lastPlayedGame.date}</TableCell>
            </TableRow>
            </TableBody>
            <TableFooter><TableRow><TableCell colSpan="2">Calculated based on <a href="https://handbook.fide.com/chapter/B022017" target="_blank" rel="noopener noreferrer">FIDE regulations</a></TableCell></TableRow></TableFooter>
        </Table>
    </Popover>
    }
    movesTable() {
        let hasMoves = (this.props.movesToShow && this.props.movesToShow.length>0)
        return <Table>
            {hasMoves?
        <TableHead>
        <TableRow>
            <TableCell size="small" className="smallCol"><b>Move</b></TableCell>
            <TableCell size="small" className="smallCol"><b>Games</b></TableCell>
            <TableCell><b>Results</b></TableCell>
        </TableRow></TableHead>  
        :null}
        {hasMoves?
        <TableBody>
        {
        this.props.movesToShow.map((move, moveIndex) => {
            let sampleResultWhite = this.player(move.details.lastPlayedGame.white, move.details.lastPlayedGame.whiteElo)
            let sampleResultBlack = this.player(move.details.lastPlayedGame.black, move.details.lastPlayedGame.blackElo)
            let sampleResult = move.details.lastPlayedGame.result

            return move.count > 1?<TableRow className="moveRow" key = {`${move.orig}${move.dest}`} onClick={this.move(move.orig, move.dest)}>
                <TableCell size="small" className="smallCol">{move.san} </TableCell>
                <TableCell size="small" id={`performancePopover${moveIndex}`} className="smallCol" onClick ={this.togglePerformancePopover(moveIndex)}>
                    {move.count} <FontAwesomeIcon className="lowOpacity" icon={faInfoCircle}/>
                    {this.getPopover(moveIndex)}
                </TableCell>
                <TableCell>
                    <Progress className = "border" multi>
                        <Progress bar className="whiteMove" value={`${move.whiteWins/move.count*100}`}>{move.whiteWins/move.count>0.1?move.whiteWins:''}</Progress>
                        <Progress bar className="grayMove" value={`${move.draws/move.count*100}`}>{move.draws/move.count>0.1?move.draws:''}</Progress>
                        <Progress bar className="blackMove" value={`${move.blackWins/move.count*100}`}>{move.blackWins/move.count>0.1?move.blackWins:''}</Progress>
                    </Progress>
                </TableCell>
            </TableRow>:
            <TableRow className="moveRow" key = {`${move.orig}${move.dest}`} onClick={this.move(move.orig, move.dest)}>
                <TableCell size="small" className="smallCol">{move.san}</TableCell>
                <TableCell colSpan = "2">
        {sampleResultWhite} {sampleResult} {sampleResultBlack} {<FontAwesomeIcon className="pointerExternalLink" onClick ={this.launch(move.details.lastPlayedGame.url)} icon={faExternalLinkAlt}/>}
                </TableCell>
            </TableRow>
            }
        )}
    </TableBody>
    :null}
        <TableFooter><TableRow>
        {
        hasMoves?
            <TableCell colSpan="3">
            Showing moves that have been 
            played {this.props.turnColor === this.props.settings.playerColor? "by" : "by others against"} <b>{this.props.settings.playerName}</b> in 
            this position. <b>{this.props.settings.playerName}</b> is playing as <b>{this.props.settings.playerColor}</b>.
            </TableCell>:
            <TableCell colSpan="3">
            No moves found in this position played {this.props.turnColor === this.props.settings.playerColor? "by" : "by others against"} <b>{this.props.settings.playerName}</b> in 
            this position. <b>{this.props.settings.playerName}</b> is playing as <b>{this.props.settings.playerColor}</b>.
            </TableCell>
        }</TableRow></TableFooter>
    </Table>
    }
}