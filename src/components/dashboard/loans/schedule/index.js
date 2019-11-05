import React, { Component } from 'react';
import { DatePicker, Select, Tabs, Row, Col, Menu, Dropdown, Icon, Divider } from 'antd';
import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { connect } from 'react-redux';

import { changeActiveScreen, fetchLoanSchedule } from '../../../../actions';

import Structure from '../../structure';
import Configs from '../../../../configs';

import Records from './records';
import Reports from './reports';

const moment = extendMoment(Moment);
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const Option = Select.Option;

class Loans extends Component {
	constructor(props) {
		super(props);

		this.state = {
			filter: {
				type: '',
				date: [moment().startOf('year'), moment()]
			}
		};
	}

	updateFilter = filter => {
		const {
			type,
			dates: [start_date, end_date]
		} = filter;

		this.setState({ filter });

		this.props.fetchLoanSchedule({
			date_type: `${type}_date`,
			start_date: `${moment(start_date).format('YYYY-MM-DD')} 00:00:00`,
			end_date: `${moment(end_date).format('YYYY-MM-DD')} 23:59:59`
		});
	};

	componentDidMount = () => {
		document.title = `Loans Schedule | ${Configs.settings.appName}`;

		this.setState({
			filter: {
				type: 'due',
				dates: [moment().startOf('year'), moment()]
			}
		});

		this.props.changeActiveScreen('allLoans');
	};

	render = () => {
		const {
			state: { filter },
			props: { location, history, schedule }
		} = this;

		return (
			<Structure navigation={{ history, location }}>
				<Divider orientation="left">Loan Schedule</Divider>
				<Tabs defaultActiveKey="2" className="main-tabs">
					<TabPane tab="Records" key="1">
						<Records
							schedule={schedule}
							filter={filter}
							onFilterChange={filter => this.updateFilter(filter)}
						/>
					</TabPane>
					<TabPane tab="Reports" key="2">
						<Reports
							schedule={schedule}
							filter={filter}
							onFilterChange={filter => this.updateFilter(filter)}
						/>
					</TabPane>
				</Tabs>
			</Structure>
		);
	};
}

const mapStateToProps = ({ screen, user, status, users, loans, customers }) => {
	return {
		user,
		users,
		schedule: _.map(loans.schedule, entry => {
			const {
				id,
				date_paid,
				due_date,
				installment,
				interest_to_pay,
				interest_paid,
				loan_id,
				principal_to_pay,
				principal_paid,
				dependencies: { loan, application }
			} = entry;

			const customer = _.find(customers.customers, ({ id }) => parseInt(id) === parseInt(application.customer));

			const voteCode = _.find(customers.voteCodes, ({ id }) => parseInt(id) === parseInt(customer.vote_code_id));

			const product = _.find(loans.products, ({ id }) => parseInt(id) === parseInt(loan.product_id));
			const marital_status = _.find(
				status.statuses,
				({ id }) => parseInt(id) === parseInt(customer.marital_status_id)
			);

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

			const lastDateAcceptableForPayment = moment(due_date)
				.startOf('month')
				.add(1, 'M')
				.endOf('month');

			const amount = parseFloat(interest_to_pay) + parseFloat(principal_to_pay);
			const total_paid = parseFloat(interest_paid) + parseFloat(principal_paid);

			return {
				id,
				paid_date: date_paid ? moment(date_paid) : '-',
				due_date: moment(due_date),
				disbursal_date: moment(loan.disbursal_date),
				maturity_date: moment(loan.maturity_date),
				installment,
				interest_to_pay,
				interest_paid,
				amount,
				balance: amount - total_paid,
				loan: loan.account,
				completion: _.round((total_paid / amount) * 100, 1),
				principal_to_pay,
				principal_paid,
				status: entry.status,
				customer: customer.name,
				vote_code: voteCode
					? _.pick(voteCode, ['id', 'code', 'department'])
					: { id: null, code: null, department: 'Uncategorized' },
				age_group,
				marital_status: marital_status
					? _.pick(marital_status, ['id', 'name'])
					: { id: null, name: 'Uncategorized' },
				product: product ? _.pick(product, ['id', 'name']) : { id: null, name: 'Uncategorized' },
				is_delayed: moment(date_paid).diff(lastDateAcceptableForPayment) > 0
			};
		})
	};
};

export default connect(
	mapStateToProps,
	{ changeActiveScreen, fetchLoanSchedule }
)(Loans);
