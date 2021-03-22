import React from 'react'
import {Progress, Popover } from "reactstrap"
import { Table, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faInfoCircle, faExclamationTriangle, faWrench } from '@fortawesome/free-solid-svg-icons'
import ReportControls from '../ReportControls'
import {Container, Row, Col} from 'reactstrap'
import "react-step-progress-bar/styles.css";
import {trackEvent} from '../../app/Analytics'
import * as Constants from '../../app/Constants'
import { ProgressBar,Step } from "react-step-progress-bar";
import {playerDetails, offCard} from './MovesCommon'
import {simplifyCount} from '../../app/util'
import MovesSettings from './MovesSettings'

export default class MovesTable extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            openPerformanceIndex: null,
            moveSettingsOpen:false
        }
    }
    isTouchDevice() {
        return 'ontouchstart' in window;
    }
      
      

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.turnColor !== this.props.turnColor) {
            this.setState({
                openPerformanceIndex: null,
            })
        }
    }

    move(san) {
        return () => {
            this.props.onMove(san)
            trackEvent(Constants.EVENT_CATEGORY_MOVES_LIST, this.props.clickedEventName)
        }
    }

    toggleMovesSettings(){
        if(!this.state.moveSettingsOpen) {
            trackEvent(Constants.EVENT_CATEGORY_SETTINGS, "MoveSettingsOpen")
        }
        this.setState({moveSettingsOpen:!this.state.moveSettingsOpen})
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
    
    compareClicked(san){
        return (e)=>{
            e.stopPropagation()
            this.props.compareToClicked(san)
        }
    }

    compareScores(currMove) {
        let compareTo = currMove.compareTo
        if(!compareTo) {
            return null
        }
        let values = [compareTo.bookScore, compareTo.userScore]
        return (
            <ProgressBar
              percent={0}
              stepPositions={values}
            >
                {this.getIndicator("./images/book.png", "12", "12", 
                    this.constructAlt(this.props.compareToAlt,values),
                    this.compareClicked(currMove.san))}
                {this.getIndicator("./images/user.png", "12", "12", 
                    this.constructAlt(this.props.compareToAlt,values),
                    this.compareClicked(currMove.san))}
            </ProgressBar>
          )
    }

    compareProgress(currMove){
        let compareTo = currMove.compareTo
        if(!compareTo) {
            return null
        }
        return (
            <ProgressBar
              percent={0}
              stepPositions={compareTo.values}
            >
                {this.getIndicator("./images/arrow-white.png", "20", "16", 
                    this.constructAlt(this.props.compareToAlt,compareTo.values),
                    this.compareClicked(currMove.san))}
                {this.getIndicator("./images/arrow-black.png", "18", "14", 
                    this.constructAlt(this.props.compareToAlt,compareTo.values),
                    this.compareClicked(currMove.san))}
            </ProgressBar>
          )
    }
    constructAlt(altTitle, steps) {
        let white = Math.round(steps[0])
        let draws = Math.round(steps[1])-white
        let black = 100-white-draws
        return `${altTitle} \nWhite wins ${white}% \nDraws ${draws}% \nBlack wins ${black}%`
    }
    //&#013;

    getIndicator(src, height, width, alt, click) {
        return <Step transition="scale">
            {({ accomplished }) => (
            <img onClick = {click}
                alt={alt}
                title={alt}
                className="pointerExternalLink"
                width={width}
                height={height}
                src={src}
            />
            )}
          </Step>
    }

    getPopover(moveIndex) {
        let performancePopoverOpen = this.state.openPerformanceIndex === moveIndex
        let openMove = this.props.movesToShow[moveIndex]

        return <Popover trigger="hover" placement="right" isOpen={performancePopoverOpen} target={`p${this.props.namespace}${moveIndex}`} toggle={this.togglePerformancePopover(moveIndex)}>
                <ReportControls moveDetails={openMove.details} simplifiedView={true} 
                isOpen = {performancePopoverOpen} launchGame={this.props.launchGame} 
                settings={this.props.settings} reportFooter ={this.reportFooter(moveIndex)}/>
            </Popover>
    }

    reportFooter(moveIndex) {
        let currMove = this.props.movesToShow[moveIndex]

        if(this.getTranspositionWarningLevel(moveIndex)!=='none') {
            return <div>{this.getInfoIcon(moveIndex)}<b> This move has transpositions</b> <div>{currMove.san} has been played {currMove.moveCount === 1? `once`:`${currMove.moveCount} times`}  in this position but the resulting position has appeared {currMove.details.count} times through other move orders.</div></div>
        }
    }

    getTranspositionWarningLevel(moveIndex){
        let currMove = this.props.movesToShow[moveIndex]
        let targetCount = currMove.details.count
        let difference = targetCount - currMove.moveCount
        if (difference>0) {
            if(currMove.moveCount === 1) {
                return "warning"
            } else if(difference>10 && difference/targetCount>0.1) {
                return "warning"
            } else {
                return "info"
            }
        }
        return "none"
    }

    render() {
        let hasMoves = (this.props.movesToShow && this.props.movesToShow.length>0)
        if (!hasMoves)
            return offCard(
                'No moves found',
                'The opening book does not have any moves in this position',
                this.toggleMovesSettings.bind(this),
                <b>Modify Book Settings
                    <MovesSettings isOpen={this.state.moveSettingsOpen}
                                   toggle={this.toggleMovesSettings.bind(this)}
                                   settingsChange={this.props.settingsChange}
                                   updateSettings={this.props.updateSettings}
                                   settings={this.props.settings}
                                   variant={this.props.variant}/></b>)

        return <Table>
        <TableHead>
        <TableRow>
            <TableCell size="small" className="smallCol"><b>Move</b></TableCell>
            <TableCell size="small" className="smallCol"><b>Games</b></TableCell>
            <TableCell><b>Results</b><FontAwesomeIcon 
                className={`floatRight pointer`} 
                icon={faWrench} onClick={this.toggleMovesSettings.bind(this)}/>
                <MovesSettings isOpen={this.state.moveSettingsOpen} 
                    toggle={this.toggleMovesSettings.bind(this)}
                    settingsChange={this.props.settingsChange}
                    updateSettings = {this.props.updateSettings}
                    settings={this.props.settings}
                    variant={this.props.variant}/>
            </TableCell>
        </TableRow></TableHead>
        <TableBody>
        {
        this.props.movesToShow.map((move, moveIndex) => {
            let lastPlayedGame = move.details.lastPlayedGame
            return lastPlayedGame && move.details.count === 1?
                this.getSingleItemRow(move,lastPlayedGame):
                this.getMultiItemRow(move, moveIndex)
                
            }
        )}
    </TableBody>
        <TableFooter><TableRow>
            <TableCell colSpan="3">
                {this.props.tableFooter}
            </TableCell>
        </TableRow></TableFooter>
    </Table>
    }
    highlightArrowFn(move) {
        if(this.isTouchDevice()) {
            // do not highlight on touch screens because it gives weird behavior
            // single touch just highlights the arrow and user will need to double touch to make the move
            return ()=>{return}
        }
        return ()=>{
            this.props.highlightArrow(move)
        }
    }
    getMultiItemRow(move, moveIndex) {
        return <TableRow className={`${this.props.highlightMove === move.san?'bgColor ':''}moveRow`} 
                        key = {`m${move.orig}${move.dest}${move.san}`} 
                        onClick={this.move(move.san)} 
                        onMouseOver={this.highlightArrowFn(move).bind(this)} 
                        onMouseOut={()=>this.props.highlightArrow(null)}>
            <TableCell size="small" className="smallCol">{move.san} </TableCell>
            <TableCell size="small" id={`p${this.props.namespace}${moveIndex}`} className="smallCol" onClick ={this.togglePerformancePopover(moveIndex)}>
                {simplifyCount(move.moveCount)}{this.getInfoIcon(moveIndex)}
                {this.getPopover(moveIndex)}
            </TableCell>
            <TableCell>
                <Container>
                {this.props.settings.movesSettings.openingBookScoreIndicator?
                <Row className="scoresProgress"><Col className="navCol">
                {this.compareScores(move)}
                </Col></Row>:null}
                <Row><Col className="navCol">
                <Progress className = "border" multi>
                    <Progress bar className="whiteMove" value={`${this.percentage(move.details.whiteWins,move.details.count)}`}>{this.getProgressLabel(move.details.whiteWins,move.details.count)}</Progress>
                    <Progress bar className="grayMove" value={`${this.percentage(move.details.draws,move.details.count)}`}>{this.getProgressLabel(move.details.draws,move.details.count)}</Progress>
                    <Progress bar className="blackMove" value={`${this.percentage(move.details.blackWins,move.details.count)}`}>{this.getProgressLabel(move.details.blackWins,move.details.count)}</Progress>
                </Progress></Col></Row>
                {this.props.settings.movesSettings.openingBookWinsIndicator?
                <Row className="zeroHeight"><Col className="navCol">
                {this.compareProgress(move)}
                </Col></Row>:null}
                </Container>
            </TableCell>
        </TableRow>
    }

    getInfoIcon(moveIndex) {
        if(this.getTranspositionWarningLevel(moveIndex) === "warning"){
            return <FontAwesomeIcon 
                className={`leftPadding redColor lowOpacity`} 
                icon={faExclamationTriangle}/>
        }
        return <FontAwesomeIcon 
            className={`lowOpacity leftPadding`} 
            icon={faInfoCircle}/>

    }

    getProgressLabel(count, total){
        let percentage = this.percentage(count,total)
        if(percentage<10) {
            return ''
        }
        if(this.props.showAsPercentage) {
            return `${percentage.toFixed(1)}%`
        }
        return count

    }

    percentage(count, total){
        return count/total*100
    }
    getSingleItemRow(move,lastPlayedGame) {
        let sampleResultWhite = playerDetails(lastPlayedGame.white, lastPlayedGame.whiteElo)
        let sampleResultBlack = playerDetails(lastPlayedGame.black, lastPlayedGame.blackElo)
        let sampleResult = lastPlayedGame.result

        return <TableRow className={`${this.props.highlightMove === move.san?'bgColor ':''}moveRow`} 
                key = {`${move.orig}${move.dest}`} 
                onClick={this.move(move.san)}
                onMouseOver={this.highlightArrowFn(move).bind(this)} 
                onMouseOut={()=>this.props.highlightArrow(null)}>
                <TableCell size="small" className="smallCol">{move.san}</TableCell>
                <TableCell colSpan = "2">
                        {sampleResultWhite} {sampleResult} {sampleResultBlack} {<FontAwesomeIcon className="pointerExternalLink" onClick ={this.props.launchGame(move.details.lastPlayedGame)} icon={faExternalLinkAlt}/>}
                </TableCell>
            </TableRow>
    }

}
