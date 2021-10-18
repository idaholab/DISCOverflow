/**
 * This is the entry point to the app
 */
import './styles/main.less';

import React from 'react';
import {render} from 'react-dom';
import WelcomePage from './welcome';
import GalaxyPage from './galaxy/galaxyPage.jsx';
import { Router, Route, History } from 'react-router';

render(
  <Router>
    <Route path='/' component={WelcomePage}/>
    <Route path='/galaxy/:name' component={GalaxyPage} />
  </Router>,
  document.getElementById('app')
);
