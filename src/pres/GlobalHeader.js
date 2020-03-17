import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.css';

import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText
} from 'reactstrap'

const GlobalHeader = (props) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)
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
                <DropdownItem>
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
    </div>
  )
}

export default GlobalHeader
