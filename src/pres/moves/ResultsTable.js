import React from 'react'
import { Table, TableRow, TableBody, TableCell } from '@material-ui/core';
import {playerDetails} from './MovesCommon'

export default class ResultsTable extends React.Component {
    render() {
        return <Table>
            <TableBody>
                {
                this.props.gameResults.map(result => {
                    let whitePlayer = playerDetails(result.white, result.whiteElo)
                    let blackPlayer = playerDetails(result.black, result.blackElo)
                    return <TableRow className="moveRow" key = {`${result.url}`} onClick={this.props.launchGame(result)}>
                        <TableCell>
                            {result.result==="1-0"?<b>{whitePlayer}</b>:whitePlayer} {result.result} {result.result === "0-1"?<b>{blackPlayer}</b>:blackPlayer}
                        </TableCell>
                    </TableRow>
                })}
            </TableBody>
        </Table>
    }
}