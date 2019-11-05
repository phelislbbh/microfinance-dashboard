import React, { Component } from 'react';
import { Layout, Icon } from 'antd';
import PropTypes from 'prop-types';

const { Header } = Layout;

class DashboardHeader extends Component {
	render = () => {
		const { menuToggled, onMenuToggle } = this.props;

		return (
			<Header style={{ background: '#fff', padding: 0, left: menuToggled ? '80px' : '200px' }}>
				<Icon className="trigger" type={menuToggled ? 'menu-unfold' : 'menu-fold'} onClick={() => onMenuToggle(!menuToggled)} />
			</Header>
		);
	};
}

DashboardHeader.propTypes = {
	menuToggled: PropTypes.bool,
	onMenuToggle: PropTypes.func
};

DashboardHeader.defaultProps = {
	menuToggled: false,
	onMenuToggle: () => {}
};

export default DashboardHeader;
