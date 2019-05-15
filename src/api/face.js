import * as faceapi from 'face-api.js';

// Load models and weights
export async function loadModels() {
  const MODEL_URL = process.env.PUBLIC_URL + '/models';
  await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
  await faceapi.loadFaceLandmarkModel(MODEL_URL);
  await faceapi.loadFaceRecognitionModel(MODEL_URL);
}

export async function getFullFaceDescription(blob, inputSize = 512) {
  // tiny_face_detector options
  // let scoreThreshold = 0.5;
  // const OPTION = new faceapi.TinyFaceDetectorOptions({
  //   inputSize,
  //   scoreThreshold
  // });
  // const useTinyModel = true;
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })

  // fetch image to api
  let img = await faceapi.fetchImage(blob);

  // detect all faces and generate full description from image
  // including landmark and descriptor of each face
  let fullDesc = await faceapi
    .detectAllFaces(img, options)
    .withFaceLandmarks()
    .withFaceDescriptors();
  return fullDesc;
}

export async function extractFaces(blob) {
  // const options = getFaceDetectorOptions()
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })

  // fetch image to api
  let img = await faceapi.fetchImage(blob);
  // console.log(blob);
  // console.log(img);

  const detections = await faceapi.detectAllFaces(img, options)
  const faceImages = await faceapi.extractFaces(img, detections)

  // const alignedFaceBoxes = await Promise.all(faceImages.map(
  //   async (faceCanvas, i) => {
  //     const faceLandmarks = await faceapi.detectLandmarks(faceCanvas)
  //     return faceLandmarks.align(locations[i])
  //   }
  // ))
  // const alignedFaceImages = await faceapi.extractFaces(input.inputs[0], alignedFaceBoxes)
  return faceImages;
}

const maxDescriptorDistance = 0.6;
export async function createMatcher(faceProfile) {
  // Create labeled descriptors of member from profile
  let members = Object.keys(faceProfile);
  let labeledDescriptors = members.map(
    member =>
      new faceapi.LabeledFaceDescriptors(
        faceProfile[member].name,
        faceProfile[member].descriptors.map(
          descriptor => new Float32Array(descriptor)
        )
      )
  );

  // Create face matcher (maximum descriptor distance is 0.5)
  let faceMatcher = new faceapi.FaceMatcher(
    labeledDescriptors,
    maxDescriptorDistance
  );
  return faceMatcher;
}