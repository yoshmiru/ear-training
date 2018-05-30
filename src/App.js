import React, { Component } from 'react';
import { Container, } from 'reactstrap';
//import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Intervals from './Intervals.js';

class App extends Component {
  render() {
    return (
      <Container className="App">
        <header className="App-header">
      {/*<img src={logo} className="App-logo" alt="logo" />*/}
          <h1 className="App-title">イヤトレ</h1>
        </header>
        <div className="App-intro">
          <Intervals/>
        </div>
      </Container>
    );
  }
}

export default App;
