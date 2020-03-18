import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.css';

import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalFooter,
  Button,
  ListGroup,
  ListGroupItem
} from 'reactstrap'

const GlobalHeader = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modal, setModal] = useState(false);
  
  const toggle = () => setIsOpen(!isOpen)
  const toggleModal = () => setModal(!modal)
  
  const launch = (url) => {
    return () => {
      window.open(url, "_blank")
    }
  }
  return (
    <div>
      <Navbar color="light" light expand="md">
        <img src="/opening-tree-logo.png" height="32px" width="32px" alt="Logo"/>
        <NavbarBrand href="/">&nbsp;OpeningTree.com</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
          </Nav>
          <UncontrolledDropdown navbar>
              <DropdownToggle className="bootNavColor" nav caret>
                More
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={toggleModal}>
                  Acknowledgements
                </DropdownItem>
                <DropdownItem onClick={launch("mailto:openingtreechess@gmail.com")}>
                  Feedback
                </DropdownItem>
                <DropdownItem onClick={launch("https://www.reddit.com/message/compose/?to=QuickDrawMcGraw__")}>
                  Message me on reddit
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={launch("https://lichess.org/")}>
                  Lichess
                </DropdownItem>
                <DropdownItem onClick={launch("https://www.lichess4545.com/")}>
                  Lichess4545
                </DropdownItem>
                <DropdownItem onClick={launch("https://www.chess.com")}>
                  Chess.com
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
        </Collapse>
      </Navbar>
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Acknowledgements</ModalHeader>
        <ListGroup className="acknowledgement">
        <ListGroupItem tag="a" href="https://lichess.org/api" target="_blank" action>Lichess API</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.chess.com/club/chess-com-developer-community" target="_blank" action>Chess.com API</ListGroupItem>
        <ListGroupItem tag="a" href="https://github.com/ruilisi/react-chessground" target="_blank" action>ChessGround</ListGroupItem>
        <ListGroupItem tag="a" href="https://github.com/jhlywa/chess.js" target="_blank" action>Chess.js</ListGroupItem>
        <ListGroupItem tag="a" href="https://github.com/niklasf/eco" target="_blank" action>Eco</ListGroupItem>
        <ListGroupItem tag="a" href="https://FreeLogoDesign.org" target="_blank" action>Free logo design</ListGroupItem>
        <ListGroupItem tag="a" href="https://github.com/kevinludwig/pgn-parser" target="_blank" action>PGN Parser</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.reddit.com/r/chess" target="_blank" action>r/chess</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.reddit.com/r/anarchychess" target="_blank" action>r/anarchychess</ListGroupItem>
        </ListGroup>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Done</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default GlobalHeader
