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
			users,
			status: { statuses, fetchingStatuses },
			loans: { fetchingLoansSchedule, perPage },
			schedule,
			filter,
			onFilterChange
		} = this.props;
		const { selected, query } = this.state;

		let data = schedule;

		if (filter.type !== '') {
			const [fromDate, toDate] = filter.dates;

			if (fromDate && toDate) {
				data = _.remove(_.concat([], data), ({ due_date }) =>
					moment()
						.range(fromDate, toDate)
						.contains(due_date.toDate())
				);
			}
		}

		if (filter.status) {
			data = _.remove(data, ({ status }) => parseInt(status) === parseInt(filter.status));
		}
		let expectedAmount = 0;
		let actualAmount = 0;
		let onTimeAmount = 0;
		let totalBalance = 0;

		_.forEach(schedule, ({ amount, balance, is_delayed }) => {
			const actual = amount - balance;

			expectedAmount = expectedAmount + parseFloat(amount);
			actualAmount = actualAmount + actual;
			onTimeAmount = onTimeAmount + (is_delayed ? 0 : actual);
			totalBalance = totalBalance + balance;
		});
		const columns = [
			{
				title: 'ID',
				dataIndex: 'id',
				render: id => id,
				width: 60
			},
			{
				title: 'Customer',
				dataIndex: 'customer',
				render: customer => (customer ? _.startCase(_.toLower(customer)) : '-')
			},
			/*{
				title: 'Vote Code',
				dataIndex: 'vote_code',
				render: text => {
					const voteCode = _.find(voteCodes, ({ code }) => parseInt(code) === text);

					if (voteCode) {
						return (
							<div className="truncate" title={_.startCase(_.toLower(voteCode.department))}>
								{_.truncate(_.startCase(_.toLower(voteCode.department)), { length: 30 })}
							</div>
						);
					}

					return '-';
				},
				width: 165,
				filters: _.map(
					_.uniq(_.remove(_.map(data, ({ vote_code }) => vote_code)), vote_code => {
						return vote_code ? true : false;
					}),
					vote_code => {
						const voteCode = _.find(voteCodes, ({ code }) => parseInt(code) === vote_code);

						return {
							text: voteCode ? voteCode.department : vote_code,
							value: vote_code
						};
					}
				),
				onFilter: (vote_code, record) => parseInt(record.vote_code) === parseInt(vote_code)
			},*/
			{
				title: 'Loan',
				dataIndex: 'loan',
				render: loan => loan,
				width: 80
			},
			{
				title: '#',
				dataIndex: 'installment',
				render: installment => installment,
				width: 40
			},
			{
				title: 'Amount',
				dataIndex: 'amount',
				render: text => {
					return (
						<span className="align-right">
							{formatMoney(text, {
								symbol: '',
								precision: 2
							})}
						</span>
					);
				},
				width: 95,
				sorter: (a, b) => {
					return parseInt(a.amount) - parseInt(b.amount);
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
								precision: 2
							})}
						</span>
					);
				},
				width: 95,
				sorter: (a, b) => {
					return parseInt(a.balance) - parseInt(b.balance);
				}
			},
			{
				title: 'Completion',
				dataIndex: 'completion',
				render: (text, record) => {
					return <Progress percent={text} />;
				},
				width: 120,
				sorter: (a, b) => {
					return parseFloat(a.completion) - parseFloat(b.completion);
				}
			},
			{
				title: 'Due Date',
				dataIndex: 'due_date',
				render: date => {
					return date !== 'Invalid date' ? date.format('D MMM, YYYY') : '-';
				},
				width: 110,
				sorter: (a, b) => {
					return a.due_date.valueOf() - b.due_date.valueOf();
				}
			},
			{
				title: 'Date Paid',
				dataIndex: 'paid_date',
				render: date => {
					return date !== '-' ? date.format('D MMM, YYYY') : '-';
				},
				width: 110,
				sorter: (a, b) => {
					return a.paid_date.valueOf() - b.paid_date.valueOf();
				}
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
						<Col span={4}>
							<Card title="Expected" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(expectedAmount, 2)}`}
							</Card>
						</Col>
						<Col span={4}>
							<Card title="Collected" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(actualAmount, 2)}`}
							</Card>
						</Col>
						<Col span={4}>
							<Card title="Collected (On-time)" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(onTimeAmount, 2)}`}
							</Card>
						</Col>
						<Col span={4}>
							<Card title="Collected (Delayed)" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(actualAmount - onTimeAmount, 2)}`}
							</Card>
						</Col>
						<Col span={4}>
							<Card title="Missed" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalBalance, 2)}`}
							</Card>
						</Col>
						<Col span={4}>
							<Card title="Missed" bordered={false}>
								{`UGX ${Configs.abbreviateNumber(totalBalance, 2)}`}
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
								defaultValue=""
								style={{ width: 170 }}
								onChange={value => {
									this.setState({ filter: { ...this.state.filter, status: value } });
								}}
							>
								<Option value="">-- Filter by status --</Option>
								<Option value="1">Paid</Option>
								<Option value="0">Not Paid</Option>
							</Select>
							<Select
								value={filter.type}
								style={{ width: 145 }}
								onChange={value => {
									onFilterChange({ ...filter, type: value });
								}}
							>
								<Option value="disbursal">Disbursed between</Option>
								<Option value="maturity">Matures between</Option>
								<Option value="due">Due between</Option>
								<Option value="paid">Paid between</Option>
							</Select>
							<RangePicker
								value={filter.dates}
								onChange={(dates, dateString) => onFilterChange({ ...filter, dates })}
							/>
							{this.renderDownloadButton(
								_.map(data, entry => ({
									...entry,
									due_date: moment(entry.due_date).format('YYYY-MMM-DD'),
									date_paid: moment(entry.date_paid).format('YYYY-MMM-DD')
								}))
							)}
						</div>
					</Col>
				</Row>
				<Table
					rowKey="id"
					size="middle"
					loading={fetchingLoansSchedule}
					rowSelection={rowSelection}
					columns={columns}
					dataSource={_.map(data, (entry, index) => ({ ...entry, rowKey: `${entry.id}` }))}
					pagination={pagination}
				/>
			</div>
		);
	};
}

const mapStateToProps = ({ screen, user, status, loans }) => {
	return { user, status, loans: _.pick(loans, ['fetchingLoansSchedule', 'perPage']) };
};

export default connect(
	mapStateToProps,
	{ changeLoansProperty }
)(Form.create()(Records));
