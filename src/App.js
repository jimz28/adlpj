import React from 'react';
import { Route, Router } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import Header from './components/header';
import Album from './components/album';
import Home from './components/home';
import './App.css';
// import Classifier from './components/classifier';
import ImageInput from './components/imageInput';


function App() {
  return (
    <div className="App">
      <Router history={createHistory()}>
        <div className="route">
          <Header />
          <Route exact path="/" component={Home} />
          <Route exact path="/album" component={Album} />
          <Route exact path="/photo" component={ImageInput} />
        </div>
      </Router>
    </div>
  );
}

export default App;
