import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Loans from '../../components/dashboard/loans/all';
import Schedule from '../../components/dashboard/loans/schedule';
import Applications from '../../components/dashboard/loans/applications';
import Products from '../../components/dashboard/loans/products';

export default prefix => (
	<Switch>
		<Route exact path={prefix} component={Loans} />
		<Route exact path={`${prefix}/schedule`} component={Schedule} />
		<Route exact path={`${prefix}/applications`} component={Applications} />
		<Route exact path={`${prefix}/products`} component={Products} />
	</Switch>
);
