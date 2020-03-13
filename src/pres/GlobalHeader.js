import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.css';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
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

  return (
    <div>
      <Navbar color="light" light expand="md">
      <img src="/opening-tree-logo.png" height="32px" width="32px" alt="Logo"/>
        <NavbarBrand href="/">&nbsp;OpeningTree.com</NavbarBrand>
      </Navbar>
    </div>
  )
}

export default GlobalHeader
