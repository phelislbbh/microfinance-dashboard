import React, { Component } from 'react';

import Structure from '../structure';

class InactiveLoans extends Component {
	render = () => {
		const { location, history } = this.props;

		return (
			<Structure navigation={{ history, location }}>
				<div>Inactive loans</div>
			</Structure>
		);
	};
}

export default InactiveLoans;
