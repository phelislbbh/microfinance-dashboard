import React, { Component } from 'react';
import { DatePicker, Select, Tabs, Row, Col, Menu, Affix, Dropdown, Icon, Divider } from 'antd';
import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { connect } from 'react-redux';

import { changeLoansProperty } from '../../../../../actions';
import Structure from '../../../structure';

import Daily from './daily';
import Monthly from './monthly';
import Quarterly from './quarterly';
import Annual from './annual';

import Configs from '../../../../../configs';

import '../../style.css';

const moment = extendMoment(Moment);
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const Option = Select.Option;

class Reports extends Component {
	state = {
		activeReports: 'daily'
	};

	onChangeSection = ({ item, key }) => {
		this.setState({ activeReports: key });
	};

	onDateFilterChange = (dates, dateString) => {
		this.setState({
			filter: { ...this.state.filter, date: dates }
		});
	};

	renderGraphs = () => {
		const { activeReports } = this.state;

		switch (activeReports) {
			case 'daily':
				return this.renderDailyGraphs();

				break;

			case 'monthly':
				return this.renderMonthlyGraphs();

				break;

			case 'quarterly':
				return this.renderQuarterlyGraphs();

				break;

			case 'annual':
				return this.renderAnnualGraphs();

				break;

			default:
				break;
		}
	};

	renderDailyGraphs = () => {
		const {
			renderDisbursements,
			renderPayments,
			renderMissedPayments,
			props: {
				filter,
				onFilterChange,
				loans: { loans, products },
				status: { statuses, fetchingStatuses }
			}
		} = this;

		const cancelledStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Cancelled'),
			({ id }) => id
		);
		const writtenOffStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Writtenoff'),
			({ id }) => id
		);
		const unaccountedStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Obligation Met'),
			({ id }) => id
		);
		const rescheduledStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Rescheduled'),
			({ id }) => id
		);

		let data = _.sortBy(
			_.map(
				loans,
				({
					id,
					account,
					age_group,
					product,
					application_id,
					disbursal_amount,
					disbursal_date,
					principal_paid,
					principal_remaining,
					interest_paid,
					interest_remaining,
					status_id,
					date_created,
					is_topup,
					customer,
					maturity_date,
					marital_status,
					vote_code,
					total_paid,
					total_remaining
				}) => {
					const cancelled = _.includes(cancelledStatuses, parseInt(status_id)) ? total_remaining : 0;
					const written_off = _.includes(writtenOffStatuses, parseInt(status_id)) ? total_remaining : 0;

					const total_loan = total_paid + (_.includes(rescheduledStatuses, status_id) ? 0 : total_remaining);
					let original_loans = [];
					let last_loan = null;

					if (is_topup) {
						original_loans = _.remove(_.concat([], loans), prevLoan => {
							return (
								_.includes(unaccountedStatuses, parseInt(status_id)) &&
								prevLoan.customer.id === customer.id &&
								moment()
									.range(prevLoan.disbursal_date, prevLoan.maturity_date)
									.contains(moment(disbursal_date).toDate())
							);
						});

						original_loans = _.remove(_.concat([], original_loans), entry => entry.account !== account);
						last_loan = _.last(original_loans);
					}

					return {
						id,
						account,
						product,
						age_group,
						amount: disbursal_amount,
						actual_amount: disbursal_amount - (last_loan ? last_loan.total_remaining : 0),
						total_loan,
						employer: customer.employer || 'Uncategorized',
						principal_paid,
						principal_remaining,
						interest_paid,
						interest_remaining,
						completion: _.round((total_paid / total_loan) * 100, 1),
						balance: total_remaining,
						cancelled,
						written_off,
						status: status_id,
						is_topup,
						original_loans,
						date_created: moment(disbursal_date),
						maturity_date: moment(maturity_date),
						marital_status,
						vote_code
					};
				}
			),
			'name'
		);

		if (filter.type !== '') {
			const [fromDate, toDate] = filter.dates;

			if (fromDate && toDate) {
				data = _.remove(_.concat([], data), ({ date_created, maturity_date }) =>
					moment()
						.range(fromDate, toDate)
						.contains(filter.type === 'disbursal' ? date_created.toDate() : maturity_date.toDate())
				);
			}
		}

		if (filter.dates[0]) {
			return (
				<div>
					<Daily filter={filter} loans={data} products={products} />
				</div>
			);
		}

		return <div />;
	};

	renderMonthlyGraphs = () => {
		const {
			renderDisbursements,
			renderPayments,
			renderMissedPayments,
			props: {
				filter,
				onFilterChange,
				loans: { loans, products },
				status: { statuses, fetchingStatuses }
			}
		} = this;

		const cancelledStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Cancelled'),
			({ id }) => id
		);
		const writtenOffStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Writtenoff'),
			({ id }) => id
		);
		const unaccountedStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Obligation Met'),
			({ id }) => id
		);
		const rescheduledStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Rescheduled'),
			({ id }) => id
		);

		let data = _.sortBy(
			_.map(
				loans,
				({
					id,
					account,
					age_group,
					product,
					application_id,
					disbursal_amount,
					disbursal_date,
					principal_paid,
					principal_remaining,
					interest_paid,
					interest_remaining,
					status_id,
					date_created,
					is_topup,
					customer,
					maturity_date,
					marital_status,
					vote_code,
					total_paid,
					total_remaining
				}) => {
					const cancelled = _.includes(cancelledStatuses, parseInt(status_id)) ? total_remaining : 0;
					const written_off = _.includes(writtenOffStatuses, parseInt(status_id)) ? total_remaining : 0;

					const total_loan = total_paid + (_.includes(rescheduledStatuses, status_id) ? 0 : total_remaining);
					let original_loans = [];
					let last_loan = null;

					if (is_topup) {
						original_loans = _.remove(_.concat([], loans), prevLoan => {
							return (
								_.includes(unaccountedStatuses, parseInt(status_id)) &&
								prevLoan.customer.id === customer.id &&
								moment()
									.range(prevLoan.disbursal_date, prevLoan.maturity_date)
									.contains(moment(disbursal_date).toDate())
							);
						});

						original_loans = _.remove(_.concat([], original_loans), entry => entry.account !== account);
						last_loan = _.last(original_loans);
					}

					return {
						id,
						account,
						product,
						age_group,
						amount: disbursal_amount,
						actual_amount: disbursal_amount - (last_loan ? last_loan.total_remaining : 0),
						total_loan,
						employer: customer.employer || 'Uncategorized',
						principal_paid,
						principal_remaining,
						interest_paid,
						interest_remaining,
						completion: _.round((total_paid / total_loan) * 100, 1),
						balance: total_remaining,
						cancelled,
						written_off,
						status: status_id,
						is_topup,
						original_loans,
						date_created: moment(disbursal_date),
						maturity_date: moment(maturity_date),
						marital_status,
						vote_code
					};
				}
			),
			'name'
		);

		if (filter.type !== '') {
			const [fromDate, toDate] = filter.dates;

			if (fromDate && toDate) {
				data = _.remove(_.concat([], data), ({ date_created, maturity_date }) =>
					moment()
						.range(fromDate, toDate)
						.contains(filter.type === 'disbursal' ? date_created.toDate() : maturity_date.toDate())
				);
			}
		}

		if (filter.dates[0]) {
			return (
				<div>
					<Monthly filter={filter} loans={data} products={products} />
				</div>
			);
		}

		return <div />;
	};

	renderQuarterlyGraphs = () => {
		const {
			renderDisbursements,
			renderPayments,
			renderMissedPayments,
			props: {
				filter,
				onFilterChange,
				loans: { loans, products },
				status: { statuses, fetchingStatuses }
			}
		} = this;

		const cancelledStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Cancelled'),
			({ id }) => id
		);
		const writtenOffStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Writtenoff'),
			({ id }) => id
		);
		const unaccountedStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Obligation Met'),
			({ id }) => id
		);
		const rescheduledStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Rescheduled'),
			({ id }) => id
		);

		let data = _.sortBy(
			_.map(
				loans,
				({
					id,
					account,
					age_group,
					product,
					application_id,
					disbursal_amount,
					disbursal_date,
					principal_paid,
					principal_remaining,
					interest_paid,
					interest_remaining,
					status_id,
					date_created,
					is_topup,
					customer,
					maturity_date,
					marital_status,
					vote_code,
					total_paid,
					total_remaining
				}) => {
					const cancelled = _.includes(cancelledStatuses, parseInt(status_id)) ? total_remaining : 0;
					const written_off = _.includes(writtenOffStatuses, parseInt(status_id)) ? total_remaining : 0;

					const total_loan = total_paid + (_.includes(rescheduledStatuses, status_id) ? 0 : total_remaining);
					let original_loans = [];
					let last_loan = null;

					if (is_topup) {
						original_loans = _.remove(_.concat([], loans), prevLoan => {
							return (
								_.includes(unaccountedStatuses, parseInt(status_id)) &&
								prevLoan.customer.id === customer.id &&
								moment()
									.range(prevLoan.disbursal_date, prevLoan.maturity_date)
									.contains(moment(disbursal_date).toDate())
							);
						});

						original_loans = _.remove(_.concat([], original_loans), entry => entry.account !== account);
						last_loan = _.last(original_loans);
					}

					return {
						id,
						account,
						product,
						age_group,
						amount: disbursal_amount,
						actual_amount: disbursal_amount - (last_loan ? last_loan.total_remaining : 0),
						total_loan,
						employer: customer.employer || 'Uncategorized',
						principal_paid,
						principal_remaining,
						interest_paid,
						interest_remaining,
						completion: _.round((total_paid / total_loan) * 100, 1),
						balance: total_remaining,
						cancelled,
						written_off,
						status: status_id,
						is_topup,
						original_loans,
						date_created: moment(disbursal_date),
						maturity_date: moment(maturity_date),
						marital_status,
						vote_code
					};
				}
			),
			'name'
		);

		if (filter.type !== '') {
			const [fromDate, toDate] = filter.dates;

			if (fromDate && toDate) {
				data = _.remove(_.concat([], data), ({ date_created, maturity_date }) =>
					moment()
						.range(fromDate, toDate)
						.contains(filter.type === 'disbursal' ? date_created.toDate() : maturity_date.toDate())
				);
			}
		}

		if (filter.dates[0]) {
			return (
				<div>
					<Quarterly filter={filter} loans={data} products={products} />
				</div>
			);
		}

		return <div />;
	};

	renderAnnualGraphs = () => {
		const {
			renderDisbursements,
			renderPayments,
			renderMissedPayments,
			props: {
				filter,
				onFilterChange,
				loans: { loans, products },
				status: { statuses, fetchingStatuses }
			}
		} = this;

		const cancelledStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Cancelled'),
			({ id }) => id
		);
		const writtenOffStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Writtenoff'),
			({ id }) => id
		);
		const unaccountedStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Obligation Met'),
			({ id }) => id
		);
		const rescheduledStatuses = _.map(
			_.remove(_.concat([], statuses), ({ name }) => name === 'Closed Rescheduled'),
			({ id }) => id
		);

		let data = _.sortBy(
			_.map(
				loans,
				({
					id,
					account,
					age_group,
					product,
					application_id,
					disbursal_amount,
					disbursal_date,
					principal_paid,
					principal_remaining,
					interest_paid,
					interest_remaining,
					status_id,
					date_created,
					is_topup,
					customer,
					maturity_date,
					marital_status,
					vote_code,
					total_paid,
					total_remaining
				}) => {
					const cancelled = _.includes(cancelledStatuses, parseInt(status_id)) ? total_remaining : 0;
					const written_off = _.includes(writtenOffStatuses, parseInt(status_id)) ? total_remaining : 0;

					const total_loan = total_paid + (_.includes(rescheduledStatuses, status_id) ? 0 : total_remaining);
					let original_loans = [];
					let last_loan = null;

					if (is_topup) {
						original_loans = _.remove(_.concat([], loans), prevLoan => {
							return (
								_.includes(unaccountedStatuses, parseInt(status_id)) &&
								prevLoan.customer.id === customer.id &&
								moment()
									.range(prevLoan.disbursal_date, prevLoan.maturity_date)
									.contains(moment(disbursal_date).toDate())
							);
						});

						original_loans = _.remove(_.concat([], original_loans), entry => entry.account !== account);
						last_loan = _.last(original_loans);
					}

					return {
						id,
						account,
						product,
						age_group,
						amount: disbursal_amount,
						actual_amount: disbursal_amount - (last_loan ? last_loan.total_remaining : 0),
						total_loan,
						employer: customer.employer || 'Uncategorized',
						principal_paid,
						principal_remaining,
						interest_paid,
						interest_remaining,
						completion: _.round((total_paid / total_loan) * 100, 1),
						balance: total_remaining,
						cancelled,
						written_off,
						status: status_id,
						is_topup,
						original_loans,
						date_created: moment(disbursal_date),
						maturity_date: moment(maturity_date),
						marital_status,
						vote_code
					};
				}
			),
			'name'
		);

		if (filter.type !== '') {
			const [fromDate, toDate] = filter.dates;

			if (fromDate && toDate) {
				data = _.remove(_.concat([], data), ({ date_created, maturity_date }) =>
					moment()
						.range(fromDate, toDate)
						.contains(filter.type === 'disbursal' ? date_created.toDate() : maturity_date.toDate())
				);
			}
		}

		if (filter.dates[0]) {
			return (
				<div>
					<Annual filter={filter} loans={data} products={products} />
				</div>
			);
		}

		return <div />;
	};

	render = () => {
		const { filter, onFilterChange } = this.props;

		return (
			<div>
				<div className="reports-filter-container" style={{ marginRight: '-0.5rem' }}>
					<Select
						value={filter.type}
						style={{ width: 145 }}
						onChange={value => {
							onFilterChange({ ...filter, type: value });
						}}
					>
						<Option value="">-- Filter by date --</Option>
						<Option value="disbursal">Disbursed between</Option>
						<Option value="maturity">Matures between</Option>
					</Select>
					<RangePicker
						value={filter.dates}
						onChange={(dates, dateString) => onFilterChange({ ...filter, dates })}
					/>
				</div>
				<Row gutter={32}>
					<Col span="3">
						<Affix offsetTop={80}>
							<Menu
								defaultSelectedKeys={['daily']}
								mode="inline"
								theme="light"
								onSelect={this.onChangeSection}
							>
								<Menu.Item key="daily">Daily</Menu.Item>
								<Menu.Item key="monthly">Monthly</Menu.Item>
								<Menu.Item key="quarterly">Quarterly</Menu.Item>
								<Menu.Item key="annual">Annual</Menu.Item>
							</Menu>
						</Affix>
					</Col>
					<Col span="21">{this.renderGraphs()}</Col>
				</Row>
			</div>
		);
	};
}

const mapStateToProps = ({ screen, status, users, loans, customers }) => {
	return { screen, status };
};

export default connect(
	mapStateToProps,
	{}
)(Reports);
