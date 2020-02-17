import { Container, Row, Col, Progress } from "reactstrap"
import React from 'react'
import { Table, TableRow, TableHead, TableBody, TableCell } from '@material-ui/core';

export default class MovesList extends React.Component {
    constructor(props) {
        super(props)
    }

    render(){
        return <Table>  
            <TableHead>            
            <TableRow>
                <TableCell size="small" className="smallCol">Move</TableCell>
                <TableCell size="small" className="smallCol">Games</TableCell>
                <TableCell>Results</TableCell>
            </TableRow></TableHead>  
            <TableBody>
        {
            (this.props.movesToShow)? this.props.movesToShow.map(move => 
                <TableRow>
                    <TableCell size="small" className="smallCol">{move.san}</TableCell>
                    <TableCell size="small" className="smallCol">{move.count}</TableCell>
                    <TableCell>
                        <div className="border borderRadius">
                        <Progress multi>
                            <Progress bar className="whiteMove" value={`${move.whiteWins/move.count*100}`} />
                            <Progress bar className="grayMove" value={`${move.draws/move.count*100}`} />
                            <Progress bar className="blackMove" value={`${move.blackWins/move.count*100}`} />
                        </Progress>
                        </div>
                    </TableCell>
                </TableRow>
            ):""
        }</TableBody>
        </Table>
    }
}