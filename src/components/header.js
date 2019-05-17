import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';


// UI component, stateless
const Header = (props) => {
	return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Navbar.Brand href="/">COMS 4995 Applied Deep Learning Project Demo</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/face-recognition">Face Recognition</Nav.Link>
          <Nav.Link href="/face-clustering">Face-based Photo Clustering</Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link eventKey={2} href="/">
            By da2841 & zz2560
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
	)
};

export default Header;
