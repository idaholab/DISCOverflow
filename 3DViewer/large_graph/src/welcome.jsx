import React from "react";
import Destination from './destination.jsx';
import routes from './routes.js'

export default class WelcomePage extends React.Component {
  render() {

    console.log(routes)
    let destinations = []
    for (const route of routes) {
      destinations.push((<Destination description='' href={`#/galaxy/${route}`} name={route} media=''/>))
    }
    return (
      <div className='container'>
        <h1>Welcome to the Code Galaxies, Commander</h1>
        <h2>Choose your destination:</h2>
        <div className='media-list'>
          {
            destinations
          }
        </div>
      </div>
    );
  }
}
