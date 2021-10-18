import React from "react";
import Destination from './destination.jsx';
let routes = require('./routes.json')

export default class WelcomePage extends React.Component {
  render() {
    let dests = []
    console.log(routes)
    let i = 0
    for (const route of routes) {
      console.log(route)
      dests.push(<Destination key={i++} name={route} href={`#/galaxy/${route}`} description='' media=''/>)
    }
    return (
      <div className='container'>
        <h1>Welcome to the Code Galaxies, Commander</h1>
        <h2>Choose your destination:</h2>
        <div className='media-list'>
          {dests}
        </div>
      </div>
    );
  }
}
