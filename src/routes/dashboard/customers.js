import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Customers from '../../components/dashboard/customers';
import VoteCodes from '../../components/dashboard/customers/vote-codes';

export default prefix => (
	<Switch>
		<Route exact path={prefix} component={Customers} />
		<Route exact path={`${prefix}/vote-codes`} component={VoteCodes} />
	</Switch>
);
