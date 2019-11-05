import React, { Component } from 'react';
import { connect } from 'react-redux';

import { changeActiveScreen } from '../../actions';

import Structure from './structure';

class Dashboard extends Component {
	componentDidMount = () => {
		setTimeout(() => {
			this.props.changeActiveScreen('dashboard');
		}, 1000);
	};

	render = () => {
		const { location, history } = this.props;

		return (
			<Structure navigation={{ history, location }}>
				<div>dashboard</div>
			</Structure>
		);
	};
}

const mapStateToProps = ({ screen }) => {
	return { screen };
};

export default connect(mapStateToProps, { changeActiveScreen })(Dashboard);
