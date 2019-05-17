import React from 'react';
import { Route, Router } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import Header from './components/header';
import Clustering from './components/clustering';
import ImageInput from './components/imageInput';
import Home from './components/home';
// import './App.css';



function App() {
  return (
    <div className="App">
      <Router history={createHistory()}>
        <div className="route">
          <Header />
          <Route exact path="/" component={Home} />
          <Route exact path="/face-clustering" component={Clustering} />
          <Route exact path="/face-recognition" component={ImageInput} />
        </div>
      </Router>
    </div>
  );
}

export default App;
