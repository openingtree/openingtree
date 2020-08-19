import {Progress, Popover } from "reactstrap"
import React from 'react'
import { Table, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import * as Constants from '../app/Constants'
import {trackEvent} from '../app/Analytics'
import ReportControls from './ReportControls'
import {Container, Row, Col} from 'reactstrap'
import "react-step-progress-bar/styles.css";
import { ProgressBar,Step } from "react-step-progress-bar";

export default class MovesList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            openPerformanceIndex: null
        }
    }

    move(from, to, san) {
        return () => {
            this.props.onMove(from, to, san)
            trackEvent(Constants.EVENT_CATEGORY_MOVES_LIST, "MoveClicked")
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.turnColor !== this.props.turnColor) {
            this.setState({
                openPerformanceIndex: null,
            })
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
        if(!this.props.movesToShow) {
            return <div className = "infoMessage" >No moves to show. Please select a source from the 
                <span className = "navLinkButton" onClick={()=>this.props.switchToUserTab()}> <FontAwesomeIcon icon={faUser} /> User</span> tab and enter the details.</div>
        }
        return <div>{(this.props.gameResults && this.props.gameResults.length>0)?this.resultsTable():null}
                {this.movesTable()}</div>
    }

    compareProgress(){
        return (
            <ProgressBar
              percent={0}
              filledBackground="rgba(0, 0, 0, 0.5)"
              stepPositions={[30,60]}
            >
              <Step transition="scale">
                {({ accomplished }) => (
                  <img
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    width="30"
                    src="https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/9d/Pichu.png/revision/latest?cb=20170407222851"
                  />
                )}
              </Step>
              <Step transition="scale">
                {({ accomplished }) => (
                  <img
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    width="30"
                    src="https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/97/Pikachu_%28Smiling%29.png/revision/latest?cb=20170410234508"
                  />
                )}
              </Step>
            </ProgressBar>
          )
    }

    resultsTable() {
        return <Table>
            <TableBody>
                {
                this.props.gameResults.map(result => {
                    let whitePlayer = this.player(result.white, result.whiteElo)
                    let blackPlayer = this.player(result.black, result.blackElo)
                    return <TableRow className="moveRow" key = {`${result.url}`} onClick={this.props.launchGame(result)}>
                        <TableCell>
                            {result.result==="1-0"?<b>{whitePlayer}</b>:whitePlayer} {result.result} {result.result === "0-1"?<b>{blackPlayer}</b>:blackPlayer}
                        </TableCell>
                    </TableRow>
                })}
            </TableBody>
        </Table>
    }
    player(name, elo) {
        return `${name}${elo?`(${elo})`:''}`
    }
    getPopover(moveIndex) {
        let performancePopoverOpen = this.state.openPerformanceIndex === moveIndex
        let openMove = this.props.movesToShow[moveIndex]

        return <Popover trigger="hover" placement="right" isOpen={performancePopoverOpen} target={`performancePopover${moveIndex}`} toggle={this.togglePerformancePopover(moveIndex)}>
                <ReportControls moveDetails={openMove.details} simplifiedView={true} isOpen = {performancePopoverOpen} launchGame={this.props.launchGame} settings={this.props.settings}/>
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

            return move.details.count > 1?<TableRow className="moveRow" key = {`m${move.orig}${move.dest}${move.san}`} onClick={this.move(move.orig, move.dest, move.san)}>
                <TableCell size="small" className="smallCol">{move.san} </TableCell>
                <TableCell size="small" id={`performancePopover${moveIndex}`} className="smallCol" onClick ={this.togglePerformancePopover(moveIndex)}>
                    {move.details.count} <FontAwesomeIcon className="lowOpacity" icon={faInfoCircle}/>
                    {this.getPopover(moveIndex)}
                </TableCell>
                <TableCell>
                    <Container>
                    <Row><Col className="navCol">
                    <Progress className = "border" multi>
                        <Progress bar className="whiteMove" value={`${move.details.whiteWins/move.details.count*100}`}>{move.details.whiteWins/move.details.count>0.1?move.details.whiteWins:''}</Progress>
                        <Progress bar className="grayMove" value={`${move.details.draws/move.details.count*100}`}>{move.details.draws/move.details.count>0.1?move.details.draws:''}</Progress>
                        <Progress bar className="blackMove" value={`${move.details.blackWins/move.details.count*100}`}>{move.details.blackWins/move.details.count>0.1?move.details.blackWins:''}</Progress>
                    </Progress></Col></Row>
                    <Row><Col className="navCol">
                    {this.compareProgress()}
                    </Col></Row>
                    </Container>
                </TableCell>
            </TableRow>:
            <TableRow className="moveRow" key = {`${move.orig}${move.dest}`} onClick={this.move(move.orig, move.dest, move.san)}>
                <TableCell size="small" className="smallCol">{move.san}</TableCell>
                <TableCell colSpan = "2">
        {sampleResultWhite} {sampleResult} {sampleResultBlack} {<FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(move.details.lastPlayedGame)} icon={faExternalLinkAlt}/>}
                </TableCell>
            </TableRow>
            }
        )}
    </TableBody>
    :null}
        <TableFooter><TableRow>
        {this.props.settings.playerName?

            hasMoves?
                <TableCell colSpan="3">
                Showing moves that have been 
                played {this.props.turnColor === this.props.settings.playerColor? "by" : "by others against"} <b>{this.props.settings.playerName}</b> in 
                this position. <b>{this.props.settings.playerName}</b> is playing as <b>{this.props.settings.playerColor}</b>.
                </TableCell>:
                <TableCell colSpan="3">
                No moves found played by {this.props.turnColor === this.props.settings.playerColor? "by" : "by others against"} <b>{this.props.settings.playerName}</b> in 
                this position. <b>{this.props.settings.playerName}</b> is playing as <b>{this.props.settings.playerColor}</b>.
                </TableCell>
            :
            hasMoves?
                <TableCell colSpan="3">
                Showing all moves that have been 
                played by <b>{this.props.turnColor}</b> in 
                this position.
                </TableCell>:                
                <TableCell colSpan="3">
                No moves found 
                played by <b>{this.props.turnColor}</b> in 
                this position.
                </TableCell>


        }</TableRow></TableFooter>
    </Table>
    }
}