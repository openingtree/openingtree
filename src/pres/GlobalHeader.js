import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faComments, faCaretDown} from '@fortawesome/free-solid-svg-icons'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import * as Constants from '../app/Constants'

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
  ListGroupItem,
  NavItem, NavLink
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
        <NavbarToggler onClick={toggle}/>
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
          <NavItem><NavLink className="navLinkButton" onClick={launch("https://www.youtube.com/watch?v=AJ66-HqdpXE")}>"It's so powerful" - IM Eric Rosen <span className="smallText">[Watch video]</span></NavLink></NavItem>
          </Nav>
          <Nav className="ml-auto" navbar>
          <NavItem><NavLink className="navLinkButton" onClick={launch(Constants.OPENING_TREE_DISCORD)}><FontAwesomeIcon icon={faDiscord} className="discordIcon"/> Join our discord</NavLink></NavItem>
          </Nav>
          <Nav className="" navbar>
          <NavItem><NavLink className="navLinkButton" onClick={props.toggleFeedback}><FontAwesomeIcon icon={faComments} className="feedbackIcon"/> Send feedback</NavLink></NavItem>
          </Nav>
          <UncontrolledDropdown>
              <DropdownToggle className="bootNavColor" nav>
              <FontAwesomeIcon icon={faCaretDown} className="moreIcon"/>More
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={toggleModal}>
                  Acknowledgements
                </DropdownItem>
                <DropdownItem onClick={launch("https://www.openingtree.com/old")}>
                  Old version
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
        <ListGroupItem tag="a" href="https://github.com/jimmywarting/StreamSaver.js" target="_blank" action>StreamSaver.js</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.flaticon.com/authors/google/" target="_blank" action>Icons made by google</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.flaticon.com/" target="_blank" action>FlatIcons.com</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.freelogodesign.org" target="_blank" action>Free logo design</ListGroupItem>
        <ListGroupItem tag="a" href="https://github.com/kevinludwig/pgn-parser" target="_blank" action>PGN Parser</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.npmjs.com/package/material-ui-dropzone" target="_blank" action>Dropzone</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.pgnmentor.com" target="_blank" action>PGN Mentor</ListGroupItem>
        <ListGroupItem tag="a" href="https://www.twitch.tv/imrosen" target="_blank" action>IM Eric Rosen</ListGroupItem>
        </ListGroup>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Done</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default GlobalHeader
