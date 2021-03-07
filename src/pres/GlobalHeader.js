import React, { useState } from 'react';
import Faq from 'react-faq-component';
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
  NavItem, NavLink, ModalBody
} from 'reactstrap';

import {logoName, rowContentColor} from './DarkMode';

import 'bootstrap/dist/css/bootstrap.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faCaretDown, faQuestionCircle, faMoon } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faYoutube} from '@fortawesome/free-brands-svg-icons';

import * as Constants from '../app/Constants';
import {trackEvent} from '../app/Analytics';

const GlobalHeader = (props) => {
  const darkMode = props.settings.darkMode
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)

  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    if(!modal) {
      trackEvent(Constants.EVENT_CATEGORY_GLOBAL_HEADER, "AcknowledgementsOpen")
    }
    setModal(!modal)
  }
  const toggleDarkMode = () => {
    trackEvent(Constants.EVENT_CATEGORY_GLOBAL_HEADER, "DarkModeToggle")
    props.settingsChange(Constants.SETTING_NAME_DARK_MODE, !darkMode)
  }

  const [isFAQOpen, setFAQOpen] = useState(false);
  const toggleFAQModal = () => {
    if(!isFAQOpen) {
      trackEvent(Constants.EVENT_CATEGORY_GLOBAL_HEADER, "FaqOpen")
    }
    setFAQOpen(!isFAQOpen)
  }

  const launch = (url, eventName) => {
    return () => {
      if(eventName) {
        trackEvent(Constants.EVENT_CATEGORY_GLOBAL_HEADER, eventName)
      }
      window.open(url, "_blank")
    }
  }

  const getHelpDropDown = ()=>{
    return <UncontrolledDropdown>
    <DropdownToggle className="bootNavColor" nav>
    <FontAwesomeIcon icon={faQuestionCircle} className="moreIcon"/>Help
    </DropdownToggle>
    <DropdownMenu right>
      <DropdownItem onClick={toggleFAQModal}>
        <span>
          FAQ
        </span>
      </DropdownItem>
      <DropdownItem onClick={props.toggleFeedback}>
        <span>
          Send feedback
        </span>
      </DropdownItem>
      <DropdownItem onClick={launch("https://www.openingtree.com/old", "OldVersion")}>
          <span>
            Old version
          </span>
        </DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
  }

  const getMoreDropDown = ()=> {
      return <UncontrolledDropdown>
      <DropdownToggle className="bootNavColor" nav>
      <FontAwesomeIcon icon={faCaretDown} className="moreIcon"/>More
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem onClick={toggleModal}>
          <span>
            Acknowledgements
          </span>
        </DropdownItem>
        <DropdownItem onClick={launch("https://github.com/openingtree/openingtree","github")}>
          <span>
            Github
          </span>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={launch("https://lichess.org/","lichess")}>
          <span>
            Lichess.org
          </span>
        </DropdownItem>
        <DropdownItem onClick={launch("https://www.lichess4545.com/","lichess4545")}>
          <span>
            Lichess4545
          </span>
        </DropdownItem>
        <DropdownItem onClick={launch("https://www.chess.com","chessDotCom")}>
          <span>
            Chess.com
          </span>
        </DropdownItem>
        <DropdownItem onClick={launch("https://www.youtube.com/channel/UCqGhULGgnf6IbY5JXWuVVtQ/live","chilledChess")}>
          <span>
            ChilledChess
          </span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>

  }

  const data = {
    rows: [
      {
          title: "What is OpeningTree.com?",
          content: `OpeningTree.com is an open source website that helps you analyze anyone's lichess or chess.com games. You can use it to prepare for your opponents, improve your own game or learn from openings that grandmasters play.`,
      },
      {
        title: "How do I use OpeningTree?",
        content: `To try it out, you can load Magnus Carlsen's games by choosing, lichess as the source, enter "DrNykterstein" in the user name, choose "white" and click "Analyze games". Hit the stop link when a few hundred games have loaded and click "View moves". You can see the moves that Carlsen played as white in his recent games and his win percentages there. You can dig deeper into various lines. The moves shown for black are the moves that were played by his opponents against him.`,
      },
      {
        title: "What are some of the advanced features of OpeningTree?",
        content: `You can analyze games of notable grandmasters from Morphy to Nakamura. You can also analyze games from lichess tournaments to see which moves are being played by others. You can also save openingtree files locally and load them fast or load them from pgn files.`,
      },

      {
        title: "Do I need to login to lichess?",
        content: `You dont need to, but logging in increases the speed of download of games from lichess. So if you plan on processing hundreds of games, it is recommended that you login.`,
      },
      {
        title: "Do I need to keep reloading games everytime I want to analyze the same player? OR What is a .tree file?",
        content: `If you plan to keep reloading the same player's games over and over again. The better option is to use the "Save .tree file" button after your games have loaded. This saves a pre-processed file of all the games on your local computer. You can then load the file using the "Load .tree file" option as the source and load the same file. It can load thousands of games in a matter of seconds.`,
      },
      {
        title: "Is there a way to filter games by time control, choose only recent games etc.?",
        content:`Yes. You can click on "Advanced filters" under the "Color and filters" panel of openingtree to see many different filtering options that are available.`,
      },
      {
        title: "What do the triangles under the bars indicate?",
        content: `Little triangles indicate the openingbook statistics on the moves tab and the player statistics on the openingbook tab.
        Everything left of the white triangle is a win for white, everything right of the black triangle is a win for black and everything in the middle is a draw.
        If there is only a black triangle and no white, it means there are no draws.`,
      }
    ]
  };

  const styles = {
    // bgColor: 'white',
    rowTitleColor: "black",
    rowContentColor: rowContentColor(darkMode),
    rowTitleTextSize:'small',
    rowContentTextSize:'small',
    rowContentPaddingTop:'1'
    // arrowColor: "red",
  };

  const config = {
    // animate: true,
    // arrowIcon: "V",
    // tabFocus: true
  };

  const getFAQModal = ()=> {
    return <Modal isOpen={isFAQOpen} toggle={toggleFAQModal}>
      <ModalHeader toggle={toggleFAQModal}>Frequently asked questions</ModalHeader>
      <ModalBody>
      <Faq data={data} styles={styles} config={config} />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggleFAQModal}>Done</Button>
      </ModalFooter>
    </Modal>
  };

  const getAcknowledgementsModal = ()=> {
    return <Modal isOpen={modal} toggle={toggleModal}>
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
        <Button color="secondary" onClick={toggleModal}>
          Done
        </Button>
      </ModalFooter>
    </Modal>
  }

  return (
    <div>
      <Navbar color={darkMode?"dark":"light"} dark={darkMode} light={!darkMode} expand="md">
        <img src={logoName(darkMode)} height="32px" width="32px" alt="Logo"/>
        <NavbarBrand href="/">&nbsp;OpeningTree.com</NavbarBrand>
        <NavbarToggler onClick={toggle}/>
        <Collapse isOpen={isOpen} navbar>
          <Nav className={`mr-auto`} navbar>
            <NavItem>
              <NavLink className="navLinkButton" onClick={launch("https://www.youtube.com/watch?v=AJ66-HqdpXE","mainVideo")}>
                <span>
                  "It's so powerful" - IM Eric Rosen
                </span>
                <span className="smallText">
                  [Video]
                </span>
              </NavLink>
            </NavItem>
          </Nav>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink className="navLinkButton" onClick={toggleDarkMode}>
                <FontAwesomeIcon icon={darkMode?faLightbulb:faMoon} className="largeHeaderIcon"/>
                <span>
                  {darkMode?"Light mode":"Dark mode"}
                </span>
              </NavLink>
            </NavItem>
          </Nav>
          <Nav className="" navbar>
            <NavItem>
              <NavLink className="navLinkButton" onClick={launch("https://youtu.be/9w7GdGuJoyk", "tutorial")}>
                <FontAwesomeIcon icon={faYoutube} className="largeHeaderIcon"/>
                <span>
                  Tutorial
                </span>
              </NavLink>
            </NavItem>
          </Nav>
          <Nav className="" navbar>
            <NavItem>
              <NavLink className="navLinkButton" onClick={launch(Constants.OPENING_TREE_DISCORD,"discord")}>
                <FontAwesomeIcon icon={faDiscord} className="discordIcon"/>
                <span>
                  Discord
                </span>
              </NavLink>
            </NavItem>
          </Nav>
          {getHelpDropDown()}
          {getMoreDropDown()}
        </Collapse>
      </Navbar>

      {getAcknowledgementsModal()}
      {getFAQModal()}
    </div>
  )
}

export default GlobalHeader
