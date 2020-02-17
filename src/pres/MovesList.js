import { Container } from "reactstrap"
import React from 'react'

export default class MovesList extends React.Component {
    constructor(props) {
        super(props)
    }

    render(){
        return <Container>{this.props.movesToShow?this.props.movesToShow.length:"not found"}</Container>
    }
}