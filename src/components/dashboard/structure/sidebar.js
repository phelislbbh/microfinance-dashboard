import React, { PureComponent } from 'react';
import { Layout, Menu, Icon } from 'antd';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import Configs from '../../../configs';

const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

class DashboardSidebar extends PureComponent {
	state = {
		selectedKeys: [],
		openKeys: [],
		updated: false
	};

	onClick = keyPath => {
		const { navigation, menuToggled } = this.props;

		const path = _.remove(
			_.uniq(
				_.transform(
					keyPath,
					(segments, segment) => {
						_.forEach(_.split(segment, '|'), entry => {
							segments.push(entry);
						});
					},
					[]
				)
			),
			key => key !== 'dashboard'
		).join('/');

		navigation.history.push(`/dashboard${path.length > 0 ? `/${path}` : ``}`, { menuToggled });
	};

	renderSubMenuItems = (parentKey, items) => {
		return _.map(items, ({ key, label }) => <Menu.Item key={key}>{label}</Menu.Item>);
	};

	renderMenuItems = () => {
		return _.map(this.props.menuItems, ({ key, label, icon, children }) => {
			if (typeof children !== 'undefined') {
				const parentKey = key;

				return (
					<SubMenu
						key={key}
						onTitleClick={() => {
							const openKeys = this.state.openKeys;

							this.setState({
								openKeys: _.includes(openKeys, key) ? _.remove(_.concat([], openKeys), value => key !== value) : [key]
							});
						}}
						title={
							<span>
								<Icon type={icon} />
								<span>{label}</span>
							</span>
						}
					>
						{_.map(children, ({ key, label }) => <Menu.Item key={`${parentKey}|${key}`}>{label}</Menu.Item>)}
					</SubMenu>
				);
			}

			return (
				<Menu.Item key={key}>
					<Icon type={icon} />
					<span>{label}</span>
				</Menu.Item>
			);
		});
	};

	componentDidUpdate = () => {
		if (!this.state.updated) {
			this.setState({ updated: true });
		}
	};

	render = () => {
		if (this.state.updated) {
			return (
				<Sider trigger={null} collapsible collapsed={this.props.menuToggled} theme="dark">
					<div className="logo">
						<Link to="/dashboard">
							<img className="logo-icon" alt="Logo" src={Configs.logos.icon} />
						</Link>
					</div>
					<Menu
						theme="dark"
						selectedKeys={this.state.selectedKeys}
						openKeys={this.state.openKeys}
						mode="inline"
						onClick={({ keyPath }) => this.onClick(keyPath)}
					>
						{this.renderMenuItems()}
					</Menu>
				</Sider>
			);
		}

		const keys = _.filter(_.split(this.props.navigation.location.pathname, '/'), key => !_.includes(['', 'dashboard'], key));

		const selectedKeys =
			keys.length === 0 ? ['dashboard'] : keys.length === 1 ? (keys[0] === 'users' ? keys : [`${keys[0]}|${keys[0]}`]) : [_.join(keys, '|')];
		const openKeys = this.props.menuToggled ? [] : keys.length > 0 ? [keys[0]] : [];

		this.setState({ selectedKeys, openKeys });

		return (
			<Sider trigger={null} collapsible theme="light" collapsed={this.props.menuToggled}>
				<div className="logo" />
				<Menu theme="light" selectedKeys={selectedKeys} openKeys={openKeys} mode="inline" onClick={({ keyPath }) => this.onClick(keyPath)}>
					{this.renderMenuItems()}
				</Menu>
			</Sider>
		);
	};
}

DashboardSidebar.propTypes = {
	menuToggled: PropTypes.bool
};

DashboardSidebar.defaultProps = {
	menuToggled: false
};

export default DashboardSidebar;
