import React from 'react';
import { Switch, Route } from 'react-router-dom';

import login from './login';
import register from './register';

export default prefix => (
	<Switch>
		<Route path={`${prefix}/login`} render={() => login(`${prefix}/login`)} />
		<Route path={`${prefix}/register`} render={() => register(`${prefix}/register`)} />
	</Switch>
);
