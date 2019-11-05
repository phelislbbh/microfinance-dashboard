import React, { Component } from 'react';

import Structure from '../structure';

class Loan extends Component {
	render = () => {
		const { location, history } = this.props;

		return (
			<Structure navigation={{ history, location }}>
				<div>{`Loan: ${JSON.stringify(this.props.match.params.number)}`}</div>
			</Structure>
		);
	};
}

export default Loan;
