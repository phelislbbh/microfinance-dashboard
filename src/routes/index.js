import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from '../components/home';

import auth from './auth';
import dashboard from './dashboard';

export default () => (
	<Switch>
		<Route exact path="/" component={Home} />
		<Route path="/auth" render={() => auth('/auth')} />
		<Route path="/dashboard" render={() => dashboard('/dashboard')} />
	</Switch>
);
