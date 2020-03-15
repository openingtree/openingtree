import {Progress } from "reactstrap"
import React from 'react'
import { Table, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

export default class MovesList extends React.Component {

    move(from, to) {
        return () => {
            this.props.onMove(from, to)
        }
    }
    changePlayerColor() {
        this.props.settingsChange('playerColor', this.props.settings.playerColor === "white"? "black":"white")
    }

    render(){
        if(!this.props.settings.playerName) {
            return <div className = "infoMessage" >No moves to show. Please enter a lichess user name in the 
                <span className = "navLinkButton" onClick={()=>this.props.switchToUserTab()}> <FontAwesomeIcon icon={faUser} /> User</span> tab and click "Load"</div>
        }
        return <Table>
            <TableHead>
            <TableRow>
                <TableCell size="small" className="smallCol"><b>Move</b></TableCell>
                <TableCell size="small" className="smallCol"><b>Games</b></TableCell>
                <TableCell><b>Results</b></TableCell>
            </TableRow></TableHead>  
            {
                (this.props.movesToShow)?
            <TableBody>
            {
            this.props.movesToShow.map(move => 
                <TableRow className="moveRow" key = {`${move.orig}${move.dest}`} onClick={this.move(move.orig, move.dest)}>
                    <TableCell size="small" className="smallCol">{move.san}</TableCell>
                    <TableCell size="small" className="smallCol">{move.count}</TableCell>
                    <TableCell>
                        <Progress className = "border" multi>
                            <Progress bar className="whiteMove" value={`${move.whiteWins/move.count*100}`}>{move.whiteWins/move.count>0.1?move.whiteWins:''}</Progress>
                            <Progress bar className="grayMove" value={`${move.draws/move.count*100}`}>{move.draws/move.count>0.1?move.draws:''}</Progress>
                            <Progress bar className="blackMove" value={`${move.blackWins/move.count*100}`}>{move.blackWins/move.count>0.1?move.blackWins:''}</Progress>
                        </Progress>
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
        :<TableBody></TableBody>
                }   {
            this.props.movesToShow?
            <TableFooter><TableRow>
            <TableCell colSpan="3">
                Showing moves that have been 
                played {this.props.turnColor === this.props.settings.playerColor? "by" : "by others against"} <b>{this.props.settings.playerName}</b> in 
                this position. <b>{this.props.settings.playerName}</b> is playing as {this.props.settings.playerColor} [<a onClick={this.changePlayerColor.bind(this)} href="#">change</a>].
                </TableCell></TableRow></TableFooter>
                :<TableFooter></TableFooter>
            }
        </Table>
    }
}