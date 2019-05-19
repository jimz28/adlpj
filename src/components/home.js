import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';

export default class home extends Component {
    render() {
        return (
            <Jumbotron>
                <h1>Face Recognition and Clustering on Pure Frontend</h1>
                <p>
                    COMS 4995 Applied Deep Learing Spring 2019 Project
                </p>
                <p>
                    By: Da An (da2841) and Zhi Zheng (zz2560)
                </p>
            </Jumbotron>
        );
    }
}