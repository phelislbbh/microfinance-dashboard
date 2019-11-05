import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Register from '../../components/auth/register';

export default prefix => (
	<Switch>
		<Route exact path={prefix} component={Register} />
	</Switch>
);
