import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { 
  loadModels, 
  // getFullFaceDescription, 
  createMatcher, 
  getFaceDetectorOptions,
  detectAllFaces,
  extractFaces  
} from '../api/face';
import { loadModel2, matchFace, getProfilePhotoEmbeddings } from '../api/service';
import { saveAs } from 'file-saver';
const tf = require('@tensorflow/tfjs')


// Import profile image to test API
const testImg = require('../images/leonard1.jpeg');
const sheldonImg = require('../images/sheldon1.jpeg');
const leonardImg = require('../images/leonard1.jpeg');
const pennyImg = require('../images/penny1.jpeg');
const HowardImg = require('../images/howard1.jpeg');
const RajImg = require('../images/raj1.jpeg');
const profileImgArr = [sheldonImg, leonardImg, pennyImg, HowardImg, RajImg];

// Import face profile
// const JSON_PROFILE = require('../descriptors/faceProfiles.json');

// Initial State
const INIT_STATE = {
  imageURL: testImg,
  fullDesc: null,
  detections: null,
  descriptors: null,
  match: null,
  canvasElement: null
};

class ImageInput extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INIT_STATE, faceMatcher: null };
    this.canvasRef = React.createRef();
    this.divRef = React.createRef();
    this.divRef2 = React.createRef();
    this.model2 = null;
  }

  componentWillMount = async () => {
    await loadModels();
    const model = await loadModel2();
    // console.log(model);
    // this.setState({ faceMatcher: await createMatcher(JSON_PROFILE) });
    const profileEmbeddings = await this.prepareProfileEmbeddings(profileImgArr, model);
    // console.log(profileEmbeddings);
    this.setState({
      profileEmbeddings: profileEmbeddings,
      model: model
    })
    await this.handleImage(this.state.imageURL, profileEmbeddings, model);
  };

  // componentDidMount() {
  //   const canvas = this.canvasRef.current;
  //   const context = canvas.getContext('2d');
  //   context.fillRect(0, 0, canvas.width, canvas.height);
  // }

  // shouldn't it be tf functions??
  _cropImage = (img) => {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  prepareProfileEmbeddings = async (imgArr, model) => {
    const resizedImages = imgArr.map(async img => {
      const res = await extractFaces(img)
      this.divRef.current.append(res[0]);
      return this._getResized(res[0]);
    });
    const resized = await Promise.all(resizedImages);
    const embeddings = await getProfilePhotoEmbeddings(resized, model);
    return embeddings;
  }

  _getResized = (canvas) => {
    const raw = tf.browser.fromPixels(canvas);
    const cropped = this._cropImage(raw); 
    const resized = tf.image.resizeBilinear(cropped, [160, 160]);
    return resized;
  }

  handleImage = async (image = this.state.imageURL, profileEmbeddings, model) => {
    // await getFullFaceDescription(image).then(fullDesc => {
    //   if (!!fullDesc) {
    //     console.log(fullDesc)
    //     // console.log(JSON.stringify(fullDesc[0].descriptor));
    //     this.setState({
    //       fullDesc,
    //       detections: fullDesc.map(fd => fd.detection),
    //       descriptors: fullDesc.map(fd => fd.descriptor)
    //     });
    //   }
    // });

    // if (!!this.state.descriptors && !!this.state.faceMatcher) {
    //   let match = await this.state.descriptors.map(descriptor =>
    //     this.state.faceMatcher.findBestMatch(descriptor)
    //   );
    //   this.setState({ match });
    // }

    const res = await extractFaces(image)
    for (let i = 0; i < res.length; i++) {
      this.divRef2.current.append(res[i]);
      const resized = this._getResized(res[i]);
      const result = await matchFace(profileEmbeddings, resized, model, 0.35);
      console.log(result);
    }
  };

  handleFileChange = async event => {
    const { profileEmbeddings, model } = this.state;
    if (!!event.target.files[0]) {
      this.resetState();
      await this.setState({
        imageURL: URL.createObjectURL(event.target.files[0]),
        loading: true
      });
      this.handleImage(this.state.imageURL, profileEmbeddings, model);
    }
  };

  resetState = () => {
    this.setState({ ...INIT_STATE });
  };

  render() {
    const { imageURL, detections, match, canvasElement } = this.state;
    // console.log(canvasElement);

    let drawBox = null;
    if (!!detections) {
      drawBox = detections.map((detection, i) => {
        let _H = detection.box.height;
        let _W = detection.box.width;
        let _X = detection.box._x;
        let _Y = detection.box._y;
        return (
          <div key={i}>
            <div
              style={{
                position: 'absolute',
                border: 'solid',
                borderColor: 'blue',
                height: _H,
                width: _W,
                transform: `translate(${_X}px,${_Y}px)`
              }}
            >
              {!!match && !!match[i] ? (
                <p
                  style={{
                    backgroundColor: 'blue',
                    border: 'solid',
                    borderColor: 'blue',
                    width: _W,
                    marginTop: 0,
                    color: '#fff',
                    transform: `translate(-3px,${_H}px)`
                  }}
                >
                  {match[i]._label}
                </p>
              ) : null}
            </div>
          </div>
        );
      });
    }

    return (
      <div>
        <input
          id="myFileUpload"
          type="file"
          onChange={this.handleFileChange}
          accept=".jpg, .jpeg, .png"
        />
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute' }}>
            <img src={imageURL} alt="imageURL" />
          </div>
          {!!drawBox ? drawBox : null}
        </div>
        <div ref={this.divRef} style={{marginLeft: 150}}>
        </div>
        <div ref={this.divRef2}>
        </div>
        {/* {!!canvasElement ? canvasElement : <div/>} */}
      </div>
    );
  }
}

export default withRouter(ImageInput);