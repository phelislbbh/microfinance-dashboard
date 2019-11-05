import React, { Component } from 'react';

import Structure from '../structure';

class LoanPeriod extends Component {
	render = () => {
		const { location, history } = this.props;

		return (
			<Structure navigation={{ history, location }}>
				<div>Loan period</div>
			</Structure>
		);
	};
}

export default LoanPeriod;
