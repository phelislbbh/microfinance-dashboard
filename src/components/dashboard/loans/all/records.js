import React, { Component } from 'react';
import {
	DatePicker,
	Form,
	Input,
	Select,
	Table,
	Progress,
	Card,
	Row,
	Col,
	Button,
	Icon,
	Menu,
	message,
	Dropdown,
	Divider
} from 'antd';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { connect } from 'react-redux';
import formatMoney from 'accounting-js/lib/formatMoney.js';
import _ from 'lodash';
import { CSVLink } from 'react-csv';

import { changeLoansProperty } from '../../../../actions';
import Structure from '../../structure';
import Configs from '../../../../configs';

const moment = extendMoment(Moment);
const FormItem = Form.Item;
const Search = Input.Search;
const { RangePicker } = DatePicker;
const Option = Select.Option;

class Records extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: { keys: [] },
			query: '',
			filter: {
				status: '',
				type: ''
			}
		};
	}

	renderDownloadButton = data => {
		const downloadMenu = (
			<Menu>
				<Menu.Item key="1">
					<CSVLink data={data} target="_blank">
						<Icon type="file-excel" /> As a spreadsheet
					</CSVLink>
				</Menu.Item>
				<Menu.Item key="2">
					<Icon type="file-pdf" /> As a PDF
				</Menu.Item>
			</Menu>
		);

		return (
			<Dropdown.Button overlay={downloadMenu} className="records-filter-button">
				<Icon type="cloud-download" style={{ fontSize: '1rem', marginBottom: '-0.1rem' }} />
			</Dropdown.Button>
		);
	};

	render = () => {
		const {
			location,
			history,
			changeLoansProperty,
			loans: { products, fetchingLoans, loans, perPage },
			status: { statuses, fetchingStatuses },
			filter,
			onFilterChange
		} = this.props;
		const { selected, query } = this.state;

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
			_.remove(
				_.map(
					loans,
					({
						id,
						account,
						product,
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
						total_paid,
						total_remaining
					}) => {
						const cancelled = _.includes(cancelledStatuses, parseInt(status_id)) ? total_remaining : 0;
						const written_off = _.includes(writtenOffStatuses, parseInt(status_id)) ? total_remaining : 0;

						const total_loan =
							total_paid + (_.includes(rescheduledStatuses, status_id) ? 0 : total_remaining);
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
							amount: disbursal_amount,
							actual_amount: disbursal_amount - (last_loan ? last_loan.total_remaining : 0),
							total_loan,
							customer: customer ? customer.name : '-',
							collected: total_paid,
							completion: _.round((total_paid / total_loan) * 100, 1),
							balance: total_remaining,
							cancelled,
							written_off,
							status: status_id,
							is_topup,
							original_loans,
							date_created: moment(disbursal_date),
							maturity_date: moment(maturity_date)
						};
					}
				),
				({ account, customer }) =>
					_.includes(_.toLower(account), _.toLower(query)) ||
					_.includes(_.toLower(customer), _.toLower(query))
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

		if (this.state.filter.loanType) {
			const { loanType } = this.state.filter;

			data = _.remove(_.concat([], data), ({ account, is_topup }) => {
				return loanType === 'top-up' ? is_topup === 1 : is_topup === 0;
			});
		}

		if (this.state.filter.status.length > 0) {
			data = _.remove(_.concat([], data), ({ status }) => _.includes(this.state.filter.status, status));
		}

		let totalDisbursements = 0;
		let totalActualDisbursements = 0;
		let totalLoan = 0;
		let totalCollected = 0;
		let totalBalance = 0;

		let totalCancelled = 0;
		let totalWrittenOff = 0;

		_.forEach(data, ({ amount, actual_amount, total_loan, collected, balance, cancelled, written_off }) => {
			totalDisbursements = totalDisbursements + parseFloat(amount);
			totalActualDisbursements = totalActualDisbursements + parseFloat(actual_amount);
			totalLoan = totalLoan + parseFloat(total_loan);
			totalCollected = totalCollected + parseFloat(collected);
			totalBalance = totalBalance + parseFloat(balance);

			totalCancelled = totalCancelled + parseFloat(cancelled);
			totalWrittenOff = totalWrittenOff + parseFloat(written_off);
		});

		const columns = [
			{
				title: 'ID',
				dataIndex: 'id',
				render: text => text,
				width: 50
			},
			{
				title: 'Account',
				dataIndex: 'account',
				render: text => text,
				sorter: (a, b) => {
					return a.account.localeCompare(b.account);
				},
				width: 90
			},
			{
				title: 'Customer',
				dataIndex: 'customer',
				render: customer => (customer ? _.startCase(_.toLower(customer)) : '-')
			},
			{
				title: 'Product',
				dataIndex: 'product',
				render: product => (product ? _.replace(product.name, 'Salary Loan ', '') : '-'),
				width: 100,
				filters: _.map(products, ({ id, name }) => {
					return {
						text: _.replace(name, 'Salary Loan ', ''),
						value: id
					};
				}),
				onFilter: (product, record) => {
					return parseInt(record.product.id) === parseInt(product);
				}
			},
			{
				title: 'Disbursed',
				dataIndex: 'amount',
				render: text => {
					return (
						<span className="align-right">
							{formatMoney(text, {
								symbol: '',
								precision: 0
							})}
						</span>
					);
				},
				width: 100,
				sorter: (a, b) => {
					return parseInt(a.amount) - parseInt(b.amount);
				}
			},
			{
				title: 'Total Loan',
				dataIndex: 'total_loan',
				render: text => {
					return (
						<span className="align-right">
							{formatMoney(text, {
								symbol: '',
								precision: 0
							})}
						</span>
					);
				},
				width: 100,
				sorter: (a, b) => {
					return parseInt(a.total_loan) - parseInt(b.total_loan);
				}
			},
			{
				title: 'Balance',
				dataIndex: 'balance',
				render: text => {
					return (
						<span className="align-right">
							{formatMoney(text, {
								symbol: '',
								precision: 0
							})}
						</span>
					);
				},
				width: 100,
				sorter: (a, b) => {
					return parseInt(a.balance) - parseInt(b.balance);
				}
			},
			{
				title: 'Completion',
				dataIndex: 'completion',
				render: (text, record) => {
					let status = _.find(statuses, ({ id }) => parseInt(id) === parseInt(record.status));
					let color = '';

					if (status) {
						status = _.replace(
							_.replace(_.replace(status.name, 'Closed ', ''), 'Active In ', ''),
							'Opened-',
							''
						);

						if (status == 'Rescheduled') {
							color = '#f0ad4e';
						}

						status = _.includes(['Writtenoff', 'Cancelled'], status)
							? 'exception'
							: _.includes(['Bad Standing', 'Pending Disbursement', 'Good Standing'], status)
								? 'active'
								: 'success';
					}

					return <Progress percent={text} status={status} color={color} />;
				},
				width: 120,
				sorter: (a, b) => {
					return parseFloat(a.completion) - parseFloat(b.completion);
				}
			},
			{
				title: 'Disbursed',
				dataIndex: 'date_created',
				render: date => {
					return date !== 'Invalid date' ? date.format('D MMM, YYYY') : '-';
				},
				width: 100,
				sorter: (a, b) => {
					return a.date_created.valueOf() - b.date_created.valueOf();
				}
			},
			{
				title: 'Matures',
				dataIndex: 'maturity_date',
				render: date => {
					return date !== 'Invalid date' ? date.format('D MMM, YYYY') : '-';
				},
				width: 100,
				sorter: (a, b) => {
					return a.maturity_date.valueOf() - b.maturity_date.valueOf();
				}
			},
			{
				title: '',
				key: 'operation',
				render: (text, record) => {
					return (
						<div className="table-row-actions-container">
							<Button shape="circle" icon="bar-chart" size="small" onClick={() => {}} />
						</div>
					);
				},
				width: 40
			}
		];

		const rowSelection = {
			columnWidth: 1,
			selectedRowKeys: selected.keys,
			onChange: (keys, rows) => {
				this.setState({ selected: { ids: _.map(rows, ({ id }) => id), keys } });
			},
			getCheckboxProps: ({ id }) => ({ id: `${id}` })
		};

		const pagination = {
			pageSize: perPage,
			total: data.length,
			simple: false,
			defaultCurrent: 1,
			showQuickJumper: false,
			size: 'small',
			showSizeChanger: true,
			onShowSizeChange: (current, size) => {
				changeLoansProperty('perPage', size);
			}
		};

		const menu = (
			<Menu onClick={this.onActionsItemClick}>
				<Menu.Item key="reports">
					<Icon type="bar-chart" /> Reports
				</Menu.Item>
			</Menu>
		);

		return (
			<div>
				<div className="table-summary-container">
					<Row gutter={10}>
						<Col span={3}>
							<Card title="Disbursement" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalDisbursements, 1)}`}
							</Card>
						</Col>
						<Col span={3}>
							<Card title="Actual Disbursement" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalActualDisbursements, 1)}`}
							</Card>
						</Col>
						<Col span={3}>
							<Card title="Total Loan" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalLoan, 1)}`}
							</Card>
						</Col>
						<Col span={3}>
							<Card title="Collected" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalCollected, 1)}`}
							</Card>
						</Col>
						<Col span={3}>
							<Card title="Ideal Balance" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalBalance, 1)}`}
							</Card>
						</Col>
						<Col span={3}>
							<Card title="Actual Balance" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalBalance - totalCancelled - totalWrittenOff, 1)}`}
							</Card>
						</Col>
						<Col span={3}>
							<Card title="Cancelled" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalCancelled, 1)}`}
							</Card>
						</Col>
						<Col span={3}>
							<Card title="Written Off" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalWrittenOff, 1)}`}
							</Card>
						</Col>
					</Row>
				</div>
				<Row gutter={32} className="table-header">
					<Col span={7}>
						<div className="records-actions-container">
							<Dropdown overlay={menu} disabled={selected.keys.length > 0 ? false : true}>
								<Button>
									Actions <Icon type="down" />
								</Button>
							</Dropdown>
							<FormItem>
								<Input
									prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
									placeholder="Search"
									value={query}
									onChange={({ target: { value } }) => this.setState({ query: value })}
								/>
							</FormItem>
						</div>
					</Col>
					<Col span={17}>
						<div className="records-filter-container">
							<Select
								style={{ minWidth: '25%' }}
								mode="multiple"
								placeholder="- Filter by status -"
								onChange={value => {
									this.setState({ filter: { ...this.state.filter, status: value } });
								}}
							>
								{_.map(
									_.remove(_.concat([], statuses), ({ type, name }) => type === 'loan'),
									({ id, name }) => (
										<Option key={id} value={id}>
											{_.replace(
												_.replace(
													_.replace(_.replace(name, 'Active In ', ''), 'Closed ', ''),
													'Opened-',
													''
												),
												'Writtenoff',
												'Written Off'
											)}
										</Option>
									)
								)}
							</Select>
							<Select
								defaultValue=""
								style={{ width: 145 }}
								onChange={value => {
									this.setState({ filter: { ...this.state.filter, loanType: value } });
								}}
							>
								<Option value="">- Filter by type -</Option>
								<Option value="normal">Normal loan</Option>
								<Option value="top-up">Top-up loan</Option>
							</Select>
							<Select
								value={filter.type}
								style={{ width: 145 }}
								onChange={value => {
									onFilterChange({ ...filter, type: value });
								}}
							>
								<Option value="">- Filter by date -</Option>
								<Option value="disbursal">Disbursed between</Option>
								<Option value="maturity">Matures between</Option>
							</Select>
							<RangePicker
								value={filter.dates}
								onChange={(dates, dateString) => onFilterChange({ ...filter, dates })}
							/>
							{this.renderDownloadButton(
								_.map(data, entry => ({
									...entry,
									date_created: moment(entry.date_created).format('YYYY-MMM-DD'),
									maturity_date: moment(entry.maturity_date).format('YYYY-MMM-DD')
								}))
							)}
						</div>
					</Col>
				</Row>
				<Table
					rowKey="id"
					size="middle"
					loading={fetchingStatuses || fetchingLoans}
					rowSelection={rowSelection}
					columns={columns}
					dataSource={_.map(data, (entry, index) => ({ ...entry, rowKey: `${entry.id}` }))}
					pagination={pagination}
				/>
			</div>
		);
	};
}

const mapStateToProps = ({ screen, status }) => {
	return { screen, status };
};

export default connect(
	mapStateToProps,
	{ changeLoansProperty }
)(Form.create()(Records));
