import { Container, Row, Col } from "reactstrap"
import React from 'react'

export default class MovesList extends React.Component {
    constructor(props) {
        super(props)
    }

    render(){
        return <Container>                
            <Row>
                <Col className="border"><b>Move</b></Col>
                <Col className="border"><b>Games</b></Col>
                <Col className="border"><b>W</b></Col>
                <Col className="border"><b>B</b></Col>
                <Col className="border"><b>D</b></Col>
            </Row>
        {
            (this.props.movesToShow)? this.props.movesToShow.map(move => 
                <Row>
                    <Col className="border">{move.san}</Col>
                    <Col className="border">{move.count}</Col>
                    <Col className="border">{move.whiteWins}</Col>
                    <Col className="border">{move.blackWins}</Col>
                    <Col className="border">{move.draws}</Col>
                    
                </Row>
            ):""
        }
        </Container>
    }
}