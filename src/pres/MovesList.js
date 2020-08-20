import React from 'react'
import { Table, TableRow, TableBody, TableCell } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import * as Constants from '../app/Constants'
import {trackEvent} from '../app/Analytics'
import "react-step-progress-bar/styles.css";
import MovesTable from './MovesTable'

export default class MovesList extends React.Component {
    constructor(props) {
        super(props)
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
    render(){
        if(!this.props.movesToShow) {
            return <div className = "infoMessage" >No moves to show. Please select a source from the 
                <span className = "navLinkButton" onClick={()=>this.props.switchToUserTab()}> <FontAwesomeIcon icon={faUser} /> User</span> tab and enter the details.</div>
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

    movesTable() {
        return <MovesTable movesToShow={this.props.movesToShow}
                launchGame={this.props.launchGame} settings={this.props.settings}
                turnColor={this.props.turnColor} onMove={this.props.onMove}/>
    }

}