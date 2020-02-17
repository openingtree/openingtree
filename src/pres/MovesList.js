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
                <TableCell>Move</TableCell>
                <TableCell>Games</TableCell>
                <TableCell>Results</TableCell>
            </TableRow></TableHead>  
            <TableBody>
        {
            (this.props.movesToShow)? this.props.movesToShow.map(move => 
                <TableRow>
                    <TableCell>{move.san}</TableCell>
                    <TableCell>{move.count}</TableCell>
                    <TableCell>
                        <Progress multi>
                            <Progress bar className="white" color="success" value={`${move.whiteWins/move.count*100}`} />
                            <Progress bar className="gray" color="info" value={`${move.draws/move.count*100}`} />
                            <Progress bar className="black" color="danger" value={`${move.blackWins/move.count*100}`} />
                        </Progress>
                    </TableCell>
                </TableRow>
            ):""
        }</TableBody>
        </Table>
    }
}