import React from 'react';
import { Button } from 'react-bootstrap';


export default class Classifier extends React.Component {

  state = {
    
  };

  handleButtonClick = () => {
    console.log("clicked");
    
  }

  render() {
    return (
        <Button 
            variant="dark"
            onClick={this.handleButtonClick}
        >
            Click
        </Button>
    );
  };
}