import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Dashboard from '../../components/dashboard';
import loans from './loans';
import customers from './customers';
import Users from '../../components/dashboard/users';

export default prefix => (
	<Switch>
		<Route exact path={prefix} component={Dashboard} />
		<Route path={`${prefix}/loans`} render={() => loans(`${prefix}/loans`)} />
		<Route path={`${prefix}/customers`} render={() => customers(`${prefix}/customers`)} />
		<Route exact path={`${prefix}/users`} component={Users} />
	</Switch>
);
