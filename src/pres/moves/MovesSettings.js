import React from 'react'
import {
    Modal,
    ModalHeader
  } from 'reactstrap'
  
export default class MovesSettings extends React.Component {

    render() {
        return <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
            <ModalHeader toggle={this.props.toggle}>Acknowledgements</ModalHeader>
        </Modal>
    }
}
