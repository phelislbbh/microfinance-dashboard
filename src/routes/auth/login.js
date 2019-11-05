import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Login from '../../components/auth/login';

export default prefix => (
	<Switch>
		<Route exact path={prefix} component={Login} />
	</Switch>
);
