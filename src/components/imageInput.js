import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { 
  loadModels, 
  getFullFaceDescription, 
  createMatcher, 
  getFaceDetectorOptions,
  detectAllFaces,
  extractFaces  
} from '../api/face';
import { loadModel2, matchFace, getProfilePhotoEmbeddings } from '../api/service';
import { Spinner } from 'react-bootstrap';
const tf = require('@tensorflow/tfjs')


// Import profile image to test API
const testImg = require('../images/leonard1.jpeg');
const sheldonImg = require('../images/sheldon1.jpeg');
const leonardImg = require('../images/leonard1.jpeg');
const pennyImg = require('../images/penny2.jpeg');
const HowardImg = require('../images/howard1.jpeg');
const RajImg = require('../images/raj1.jpeg');
const profileImgArr = [sheldonImg, leonardImg, pennyImg, HowardImg, RajImg];
const namelist = ['Shdeldon', 'Leonard', 'Penny', 'Howard', 'Raj'];

// Import face profile
const JSON_PROFILE = require('../descriptors/faceProfiles.json');

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
    this.state = { 
      ...INIT_STATE, 
      faceMatcher: null,
      profileEmbeddings: null,
      model2: null,
      loading: true ,
      loadingMsg: 'Loading models...'
    };
    // this.canvasRef = React.createRef();
    this.divRef = React.createRef();
    this.divRef2 = React.createRef();
  }

  componentDidMount = async () => {
    await loadModels();
    this.setState({ faceMatcher: await createMatcher(JSON_PROFILE) });
    const model = await loadModel2();
    this.setState({loadingMsg: 'Preparing for profile embeddings...'})
    const profileEmbeddings = await this.prepareProfileEmbeddings(profileImgArr, model);

    this.setState({
      profileEmbeddings: profileEmbeddings,
      model2: model,
      loadingMsg: ''
    });
    await this.handleImage(this.state.imageURL, profileEmbeddings, model);
  };

  _cropImage = (img) => {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  prepareProfileEmbeddings = async (imgArr, model) => {
    const faceCanvases = imgArr.map(async (img, idx) => {
      const res = await extractFaces(img);
      const show = res[0];
      // console.log(show);
      show.style.height = '100px';
      show.style.width = '100px';

      // return {[namelist[idx]]: this._getResized(res[0])};
      return show;
    });
    const faces = await Promise.all(faceCanvases);
    // console.log(faces);
    const resized = faces.map((faceCanvas, idx) => {
      const face = this._getResized(faceCanvas);
      let ctx = faceCanvas.getContext("2d");
      ctx.font = `${faceCanvas.width/4}px Georgia`;
      ctx.fillStyle = "red";
      ctx.fillText(namelist[idx], 0, faceCanvas.height);
      this.divRef.current.append(faceCanvas);
      return face;
    });
    const embeddings = await getProfilePhotoEmbeddings(resized, model);
    return embeddings;
  }

  _getResized = (canvas) => {
    const raw = tf.browser.fromPixels(canvas);
    const cropped = this._cropImage(raw); 
    let resized = tf.image.resizeBilinear(cropped, [160, 160]);
    const normalized =tf.div(resized, 255);
    normalized.print();
    return normalized;
  }

  handleImage = async (image = this.state.imageURL, profileEmbeddings, model) => {
    // using face api's tfjs-core model trained in ts
    await getFullFaceDescription(image).then(fullDesc => {
      if (!!fullDesc) {
        // console.log(JSON.stringify(fullDesc[0].descriptor));
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
      this.setState({ match });
    }

    // using tfjs
    const res = await extractFaces(image)
    for (let i = 0; i < res.length; i++) {
      const show = res[i];
      // console.log(show);
      show.style.height = '100px';
      show.style.width = '100px';  
      const resized = this._getResized(res[i]);
      const result = await matchFace(profileEmbeddings, resized, model, 0.01);


      let ctx = show.getContext("2d");
      ctx.font = `${show.width/4}px Georgia`;
      ctx.fillStyle = "red";
      ctx.fillText(result !== null ? namelist[result] : 'unknown', 0, show.height);
      this.divRef2.current.append(show);
      console.log(result !== null ? namelist[result] : 'unknown');
    }
    this.setState({loading: false});
  };

  handleFileChange = async event => {
    const { profileEmbeddings, model2 } = this.state;
    if (!!event.target.files[0]) {
      this.resetState();
      await this.setState({
        imageURL: URL.createObjectURL(event.target.files[0]),
        loading: true,
        loadingMsg: 'Detecting faces and calculating embeddings...'
      });
      this.handleImage(this.state.imageURL, profileEmbeddings, model2);
    }
  };

  resetState = () => {
    this.setState({ ...INIT_STATE });
  };

  render() {
    const { imageURL, detections, match, loading, loadingMsg } = this.state;

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
        {loading ? 
          // <Spinner animation="grow" />
          <div>
            <Spinner animation="border" variant="primary"/>
            {loadingMsg}
          </div> 
          : 
          <div></div>
        }
        {!loading ? 
          <div>
            Profiles:
          </div>
          :
          <div></div>
        }
        <div 
          ref={this.divRef} 
        >
        </div>
        {!loading ? 
          <div>
            Faces Detected from image below:
          </div>
          :
          <div></div>
        }
        <div ref={this.divRef2}></div>
        <div 
          style={{ 
            position: 'relative',
            marginTop: 20 
          }}
        >
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
        </div>
      </div>
    );
  }
}

export default withRouter(ImageInput);