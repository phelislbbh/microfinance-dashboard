import React, { Component } from 'react';

import Structure from '../structure';

class ActiveLoans extends Component {
	render = () => {
		const { location, history } = this.props;

		return (
			<Structure navigation={{ history, location }}>
				<div>Active loans</div>
			</Structure>
		);
	};
}

export default ActiveLoans;
