import React from 'react'
import {Progress, Popover } from "reactstrap"
import { Table, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import ReportControls from '../ReportControls'
import {Container, Row, Col} from 'reactstrap'
import "react-step-progress-bar/styles.css";
import {trackEvent} from '../../app/Analytics'
import * as Constants from '../../app/Constants'
import { ProgressBar,Step } from "react-step-progress-bar";
import {playerDetails} from './MovesCommon'

export default class MovesTable extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            openPerformanceIndex: null
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.turnColor !== this.props.turnColor) {
            this.setState({
                openPerformanceIndex: null,
            })
        }
    }

    move(from, to, san) {
        return () => {
            this.props.onMove(from, to, san)
            trackEvent(Constants.EVENT_CATEGORY_MOVES_LIST, this.props.clickedEventName)
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

    compareProgress(){
        let steps = [30,30]
        return (
            <ProgressBar
              percent={0}
              stepPositions={steps}
            >
                
              <Step transition="scale">
                {({ accomplished }) => (
                  <img onClick = {alert}
                    width="16"
                    height="20"
                    src="./images/arrow-white.png"
                  />
                )}
              </Step>
              <Step transition="scale">
                {({ accomplished }) => (
                  <img
                    style={{ filter: `grayscale(80%)` }}
                    width="14"
                    height="18"
                    src="./images/arrow-black.png"
                  />
                )}
              </Step>
            </ProgressBar>
          )
    }

    getPopover(moveIndex) {
        let performancePopoverOpen = this.state.openPerformanceIndex === moveIndex
        let openMove = this.props.movesToShow[moveIndex]

        return <Popover trigger="hover" placement="right" isOpen={performancePopoverOpen} target={`performancePopover${moveIndex}`} toggle={this.togglePerformancePopover(moveIndex)}>
                <ReportControls moveDetails={openMove.details} simplifiedView={true} isOpen = {performancePopoverOpen} launchGame={this.props.launchGame} settings={this.props.settings}/>
            </Popover>
    }

    render() {
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
            let sampleResultWhite = playerDetails(move.details.lastPlayedGame.white, move.details.lastPlayedGame.whiteElo)
            let sampleResultBlack = playerDetails(move.details.lastPlayedGame.black, move.details.lastPlayedGame.blackElo)
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
