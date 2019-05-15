import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import Gallery from "react-photo-gallery";

import { loadModels, getFullFaceDescription, createMatcher } from '../api/face';

// Import image to test API
const testImg = require('../images/group6.jpg');

// Import face profile
const JSON_PROFILE = require('../descriptors/faceProfiles.json');

// Initial State
const INIT_STATE = {
  imageURL: testImg,
  fullDesc: null,
  detections: null,
  descriptors: null,
  match: null
};



const photos = [
    {
        src: "/images/group2.jpg",
        width: 5,
        height: 4
    },
    {
        src: "/images/group3.jpeg",
        width: 1,
        height: 1
    },
    {
        src: "/images/group4.jpg",
        width: 3,
        height: 2
    },
    {
        src: "/images/group5.jpg",
        width: 5,
        height: 3
    },
    {
        src: "/images/group6.jpg",
        width: 3,
        height: 2
    },
    {
        src: "/images/sheldon1.jpeg",
        width: 2,
        height: 3
    },
    {
        src: "/images/leonard1.jpeg",
        width: 2,
        height: 3
    },
    {
        src: "/images/penny1.jpeg",
        width: 1,
        height: 1
    }
];

let userPhotos = {
    "Sheldon": [],
    "Leonard": [],
    "Penny": []
};

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INIT_STATE, faceMatcher: null };
    }
    
    componentWillMount = async () => {
        // const images = this.importAll(require.context('../images', false, /\.(png|jpe?g|svg)$/));
        await loadModels();
        this.setState({ faceMatcher: await createMatcher(JSON_PROFILE) });
        for (let i = 0; i < photos.length; i++) {
            await this.handleImage(photos[i].src, i);
        }
    };

    // importAll(r) {
    //     return r.keys().map(r);
    // }

    handleImage = async (image = this.state.imageURL, idx) => {
        await getFullFaceDescription(image).then(fullDesc => {
          if (!!fullDesc) {
            console.log(JSON.stringify(fullDesc[0].descriptor));
            this.setState({
              fullDesc,
              detections: fullDesc.map(fd => fd.detection),
              descriptors: fullDesc.map(fd => fd.descriptor)
            });
          }
        });
    
        if (!!this.state.descriptors && !!this.state.faceMatcher) {
          let match = await this.state.descriptors.map(descriptor =>
            this.state.faceMatcher.findBestMatch(descriptor)
          );
          match.map(faceMatch => {
            // console.log(faceMatch._label);
            if (faceMatch._label in userPhotos) {
                userPhotos[faceMatch._label].push(photos[idx])
            }
          });
          this.setState({ match });
        }
    };

    
    render() {
        return (
            <div>
                <div>All Pictures</div>
                <Gallery photos={photos} />
                <div>Sheldon's pictures</div>
                <Gallery photos={userPhotos["Sheldon"]} />
                <div>Leonard's pictures</div>
                <Gallery photos={userPhotos["Leonard"]} />
                <div>Penny's pictures</div>
                <Gallery photos={userPhotos["Penny"]} />
            </div>
        );
    }
}