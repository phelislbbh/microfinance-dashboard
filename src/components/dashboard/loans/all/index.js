import React, { Component } from 'react';
import { DatePicker, Tabs, Row, Col, Menu, Dropdown, Icon, Divider } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { connect } from 'react-redux';

import { changeActiveScreen, fetchLoans } from '../../../../actions';

import Structure from '../../structure';
import Configs from '../../../../configs';

import Records from './records';
import Reports from './reports';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

class Loans extends Component {
	state = {
		filter: {
			type: '',
			dates: ['', '']
		}
	};

	updateFilter = filter => {
		const { type, dates: [start_date, end_date] } = filter;

		this.setState({ filter });

		this.props.fetchLoans({
			date_type: `${type}_date`,
			start_date: `${moment(start_date).format('YYYY-MM-DD')} 00:00:00`,
			end_date: `${moment(end_date).format('YYYY-MM-DD')} 23:59:59`
		});
	};

	componentDidMount = () => {
		document.title = `Loans | ${Configs.settings.appName}`;

		this.setState({
			filter: {
				type: 'disbursal',
				dates: [moment().startOf('year'), moment()]
			}
		});

		this.props.changeActiveScreen('allLoans');
	};

	render = () => {
		const { state: { filter }, props: { location, history, loans } } = this;

		return (
			<Structure navigation={{ history, location }}>
				<Divider orientation="left">Loans</Divider>
				<Tabs defaultActiveKey="1" className="main-tabs">
					<TabPane tab="Records" key="1">
						<Records loans={loans} filter={filter} onFilterChange={filter => this.updateFilter(filter)} />
					</TabPane>
					<TabPane tab="Reports" key="2">
						<Reports loans={loans} filter={filter} onFilterChange={filter => this.updateFilter(filter)} />
					</TabPane>
				</Tabs>
			</Structure>
		);
	};
}

const mapStateToProps = ({ screen, user, status, users, loans, customers }) => {
	return {
		screen,
		user,
		status,
		users,
		loans:
			screen.screen == 'allLoans'
				? {
						..._.pick(loans, ['products', 'fetchingLoanApplications', 'perPage']),
						loans: _.map(loans.loans, loan => {
							const {
								is_topup,
								interest_paid,
								interest_remaining,
								principal_paid,
								principal_remaining,
								disbursal_date,
								maturity_date
							} = loan;

							const application = _.find(loans.applications, ({ id }) => parseInt(id) === parseInt(loan.application_id));
							const customer = _.find(customers.customers, ({ id }) => parseInt(id) === parseInt(application.customer));
							const vote_code = _.find(customers.voteCodes, ({ id }) => parseInt(id) === parseInt(customer.vote_code_id));
							const product = _.find(loans.products, ({ id }) => parseInt(id) === parseInt(loan.product_id));
							const marital_status = _.find(status.statuses, ({ id }) => parseInt(id) === parseInt(customer.marital_status_id));

							let age_group = '0-10';
							const age = moment().diff(customer.date_of_birth, 'years', false);

							if (age < 11) {
								age_group = '0-10';
							} else if (age < 21) {
								age_group = '11-20';
							} else if (age < 31) {
								age_group = '21-30';
							} else if (age < 41) {
								age_group = '31-40';
							} else if (age < 51) {
								age_group = '41-50';
							} else if (age < 61) {
								age_group = '51-60';
							} else if (age < 71) {
								age_group = '61-70';
							} else if (age < 81) {
								age_group = '71-80';
							} else if (age < 91) {
								age_group = '81-90';
							} else if (age < 101) {
								age_group = '91-100';
							} else {
								age_group = '100+';
							}

							return {
								...loan,
								total_paid: parseFloat(interest_paid) + parseFloat(principal_paid),
								total_remaining: parseFloat(interest_remaining) + parseFloat(principal_remaining),
								application: application.id,
								customer: _.pick(customer, ['id', 'name', 'employer', 'gender']),
								vote_code: vote_code
									? _.pick(vote_code, ['id', 'code', 'department'])
									: { id: null, code: null, department: 'Uncategorized' },
								age_group,
								marital_status: marital_status ? _.pick(marital_status, ['id', 'name']) : { id: null, name: 'Uncategorized' },
								product: product ? _.pick(product, ['id', 'name']) : { id: null, name: 'Uncategorized' }
							};
						})
					}
				: { products: [], loans: [], applications: [] }
	};
};

export default connect(mapStateToProps, { changeActiveScreen, fetchLoans })(Loans);
