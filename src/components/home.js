import React, { Component } from 'react';
import { Icon } from 'antd';
import { connect } from 'react-redux';

class Home extends Component {
	componentDidUpdate = () => {
		const { history, user: { details: { name } } } = this.props;

		if (typeof name === 'undefined') {
			history.push('/auth/login');
		} else {
			history.push('/dashboard');
		}
	};

	render = () => {
		if (!this.props.state.stateRehydrated) {
			return (
				<div className="page-loader-container">
					<Icon type="loading" />
				</div>
			);
		}

		return <div>Homepage</div>;
	};
}

const mapStateToProps = ({ state, user }) => {
	return { state, user };
};

export default connect(mapStateToProps, {})(Home);
