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
  Modal, ModalBody,
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
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen)
  const toggleModal = () => setModal(!modal)
  const toggleFeedback = () => setFeedbackOpen(!feedbackOpen)

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
          <NavItem><NavLink className="navLinkButton" onClick={toggleFeedback}>Feedback</NavLink></NavItem>
          </Nav>
          <UncontrolledDropdown>
              <DropdownToggle className="bootNavColor" nav caret>
                More
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={toggleModal}>
                  Acknowledgements
                </DropdownItem>
                <DropdownItem onClick={launch("mailto:openingtreechess@gmail.com")}>
                  Old version
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
      <Modal isOpen={feedbackOpen} toggle={toggleFeedback}>
        <ModalHeader toggle={toggleFeedback}>Feedback</ModalHeader>
        <ModalBody>
          Your feedback is greatly appreciated. Reach out to me for feedback, suggestions, bug report or just a game of chess.
          <ul>
            <li>Email me: <a rel="noopener noreferrer" href="mailto:openingtreechess@gmail.com" target="_blank">openingtreechess@gmail.com</a></li>
            <li>Message me on reddit <a rel="noopener noreferrer" href="https://www.reddit.com/message/compose/?to=opening_tree" target="_blank">u/opening_tree</a></li>
            <li>lichess.org username: <a rel="noopener noreferrer" href="https://lichess.org/@/vannooz" target="_blank">vannooz</a></li>
            <li>chess.com username: <a rel="noopener noreferrer" href="https://www.chess.com/member/vannooz" target="_blank">vannooz</a></li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleFeedback}>Done</Button>
        </ModalFooter>
      </Modal>

      
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
