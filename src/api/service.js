const tf = require('@tensorflow/tfjs')
// const tfnode = require('@tensorflow/tfjs-node')


export async function loadModel2() {
  // var handler = tfnode.io.fileSystem('facenetmodel/model.json');
  var model = await tf.loadLayersModel('facenetmodel/model.json')
  console.log("Model loaded");
  // console.log(model);
  return model;
}

/**
 * profilePhotos: list of tf.Tensor, shape: (160, 160, 3)
 * model: tfjs model
 */
export async function getProfilePhotoEmbeddings(profilePhotos, model) {
  // console.log(profilePhotos);
  // console.log(model);
  
  let embeddings = []
  for (var i = 0; i < profilePhotos.length; i++) {
    var embedding = await model.predict(profilePhotos[i].expandDims());
    // embedding.print();
    embeddings.push(l2_normalize(embedding));
  }
  return embeddings;
}

export async function getProfilePhotoEmbeddingsInObj(profilePhotos, model) {
  let embeddings = [];
  for (let i = 0; i < profilePhotos.length; i++) {
    let obj = profilePhotos[i];
    let key = Object.keys(obj)[0];
    let value = Object.values(obj)[0];
    var embedding = await model.predict(value.expandDims());
    obj[key] = l2_normalize(embedding);
    embeddings.push(obj);
  }
  return embeddings;
}


/**
 * profilePhotos: list of tf.Tensor, shape: (128,)
 * face_img: tf.Tensor, shape: (160, 160, 3)
 * model: tfjs model
 * threshold: for classification

 * Return:
 *  int: if found it repents the index of profile get matched, null: not found
 */
export async function matchFace(profilePhotosEmbeddings, face_img, model, threshold=0.35) {
  var targetEmbedding = await l2_normalize(model.predict(face_img.expandDims()));
  var minScore = 1;
  var minIndex;
  for (var i = 0; i < profilePhotosEmbeddings.length; i++) {
    let dist = getDistance(profilePhotosEmbeddings[i], targetEmbedding);
    // console.log(dist);
    if (dist <= threshold && dist < minScore) {
      minScore = dist;
      minIndex = i;
    }
  }

  if (minScore !== 1) {
    return minIndex;
  }
  return null;
}

function l2_normalize(t) {
  var res = tf.mul(t, t);
  res = tf.sum(res);
  res = tf.sqrt(res);
  res = t.div(res);
  return res;
}

function getDistance(embedding1, embedding2) {
  var ed = embedding1.sub(embedding2);
  ed = tf.mul(ed, ed);
  ed = tf.sum(ed);
  ed = tf.sqrt(ed);
  const values = ed.dataSync();
  const arr = Array.from(values);
  return arr[0];
}

// module.exports = {
//   loadModel2 : loadModel,
//   matchFace : matchFace,
//   getProfilePhotoEmbeddings : getProfilePhotoEmbeddings,
// }

// var a = tf.tensor([3,3,3,3])
// var b = tf.tensor([1,1,1,1])
// var y = l2_normalize(b);
// y.print();
// console.log("Hello");
// loadModel().then(() => {
//   console.log('yes');
// }, (err) => {
//   console.log('no');
//   console.log(err);
// });
