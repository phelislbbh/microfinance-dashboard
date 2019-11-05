import React, { Component } from 'react';
import { Layout, Breadcrumb, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';

import Sidebar from './sidebar';
import Header from './header';
import Footer from './footer';

import './style.css';

import {
	fetchRoles,
	fetchUsers,
	fetchVoteCodes,
	fetchCustomers,
	fetchLoanProducts,
	fetchStatuses,
	fetchLoanApplications,
	fetchLoans,
	fetchLoanSchedule
} from '../../../actions';

const { Content } = Layout;

class Structure extends Component {
	state = {
		menuToggled: false,
		toggleSet: false,
		loaded: false,
		process: 'Booting up'
	};

	menuItems = [
		{
			key: 'dashboard',
			label: 'Dashboard',
			icon: 'dashboard'
		},
		{
			key: 'loans',
			label: 'Loans',
			icon: 'folder',
			children: [
				{ key: 'loans', label: 'All Loans' },
				{ key: 'schedule', label: 'Schedule' },
				{ key: 'applications', label: 'Applications' },
				{ key: 'products', label: 'Products' }
			]
		},
		{
			key: 'customers',
			label: 'Customers',
			icon: 'contacts',
			children: [{ key: 'customers', label: 'All Customers' }, { key: 'vote-codes', label: 'Vote Codes' }]
		},
		{
			key: 'users',
			label: 'Users',
			icon: 'team'
		}
	];

	toggleMenu = value => {
		this.setState({
			menuToggled: value
		});
	};

	renderBreadcrumbs = () => {
		const segments = _.remove(_.split(this.props.navigation.location.pathname, '/'), segment => segment !== '');

		return (
			<Breadcrumb style={{ padding: '16px' }}>
				{_.map(segments, (value, index) => {
					const items = _.slice(_.concat([], segments), 0, index + 1);

					let label = 'Dashboard';

					if (items.length > 1) {
						const root = _.find(this.menuItems, ({ key }) => key === items[1]);
						const children = root.children;

						if (typeof children !== 'undefined') {
							label = _.find(children, ({ key }) => key === items[items.length - 1]).label;
						} else {
							label = root.label;
						}
					}

					return (
						<Breadcrumb.Item key={index}>
							<Link to={`/${items.join('/')}`}>{label}</Link>
						</Breadcrumb.Item>
					);
				})}
			</Breadcrumb>
		);
	};

	componentDidUpdate = prevProps => {
		const {
			fetchRoles,
			fetchUsers,
			fetchVoteCodes,
			fetchCustomers,
			fetchLoanProducts,
			fetchStatuses,
			fetchLoanApplications,
			fetchLoans,
			fetchLoanSchedule,
			navigation: { history },
			user: { details },
			loans,
			state: { stateRehydrated }
		} = this.props;

		if (stateRehydrated && prevProps.state.stateRehydrated != stateRehydrated) {
			if (_.isEqual(details, {})) {
				history.push('/auth/login');
			} else {
				if (loans.length === 0) {
					this.setState({ process: 'Fetching user roles' });

					fetchRoles(
						() => {
							this.setState({ process: 'Fetching users' });

							fetchUsers(
								() => {
									this.setState({ process: 'Fetching vote codes' });

									fetchVoteCodes(
										() => {
											this.setState({ process: 'Fetching customers' });

											fetchCustomers(
												() => {
													this.setState({ process: 'Fetching loan products' });

													fetchLoanProducts(
														() => {
															this.setState({ process: 'Fetching statuses' });

															fetchStatuses(
																() => {
																	this.setState({
																		process: 'Fetching loan applications'
																	});

																	fetchLoanApplications(
																		{
																			start_date: `${moment()
																				.startOf('year')
																				.format('YYYY-MM-DD')} 00:00:00`,
																			end_date: `${moment().format(
																				'YYYY-MM-DD'
																			)} 23:59:59`
																		},
																		() => {
																			this.setState({
																				process: 'Fetching loans'
																			});

																			fetchLoans(
																				{
																					date_type: 'disbursal_date',
																					start_date: `${moment()
																						.startOf('year')
																						.format(
																							'YYYY-MM-DD'
																						)} 00:00:00`,
																					end_date: `${moment().format(
																						'YYYY-MM-DD'
																					)} 23:59:59`
																				},
																				() => {
																					this.setState({
																						process:
																							'Fetching loan schedule'
																					});

																					fetchLoanSchedule(
																						{
																							date_type: 'due_date',
																							start_date: `${moment()
																								.startOf('year')
																								.format(
																									'YYYY-MM-DD'
																								)} 00:00:00`,
																							end_date: `${moment().format(
																								'YYYY-MM-DD'
																							)} 23:59:59`
																						},
																						() => {
																							this.setState({
																								loaded: true
																							});
																						},
																						() => {}
																					);
																				},
																				() => {}
																			);
																		},
																		() => {}
																	);
																},
																() => {}
															);
														},
														() => {}
													);
												},
												() => {}
											);
										},
										() => {}
									);
								},
								() => {}
							);
						},
						() => {}
					);
				} else {
					this.setState({ loaded: true });
				}
			}
		}
	};

	componentDidMount = () => {
		const {
			state: { stateRehydrated },
			user: { details }
		} = this.props;

		if (stateRehydrated && !_.isEqual(details, {})) {
			this.setState({ loaded: true });
		} else {
			this.setState({ process: 'Warming up' });
		}
	};

	render = () => {
		const {
			props: {
				children,
				navigation: {
					location: { state }
				}
			},
			state: { loaded }
		} = this;
		let menuToggled = false;

		if (typeof state !== 'undefined' && typeof state.menuToggled !== 'undefined' && !this.state.toggleSet) {
			menuToggled = state.menuToggled;

			this.setState({
				menuToggled: state.menuToggled,
				toggleSet: true
			});
		} else {
			menuToggled = this.state.menuToggled;
		}

		if (loaded) {
			return (
				<Layout>
					<Sidebar menuItems={this.menuItems} menuToggled={menuToggled} navigation={this.props.navigation} />
					<Layout>
						<Header menuToggled={menuToggled} onMenuToggle={value => this.toggleMenu(value)} />
						<div style={{ marginTop: '65px', marginLeft: menuToggled ? '80px' : '200px' }}>
							{this.renderBreadcrumbs()}
							<Content>{children}</Content>
							<Footer />
						</div>
					</Layout>
				</Layout>
			);
		}

		return (
			<div className="loader-container">
				<div class="loader">
					<Spin size="large" />
					<span>{this.state.process}</span>
				</div>
			</div>
		);
	};
}

const mapStateToProps = ({ user, state, loans }) => {
	return { user, state, loans: loans.loans };
};

export default connect(
	mapStateToProps,
	{
		fetchRoles,
		fetchUsers,
		fetchVoteCodes,
		fetchCustomers,
		fetchLoanProducts,
		fetchStatuses,
		fetchLoanApplications,
		fetchLoans,
		fetchLoanSchedule
	}
)(Structure);
