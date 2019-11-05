import React, { Component } from 'react';
import { Form, Input, Tabs, Table, Row, Col, Button, Icon, Menu, message, Dropdown, Divider } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import formatMoney from 'accounting-js/lib/formatMoney.js';
import _ from 'lodash';

import { changeLoansProperty } from '../../../../actions';
import Structure from '../../structure';
import Configs from '../../../../configs';

const FormItem = Form.Item;
const Search = Input.Search;
const { TabPane } = Tabs;

class LoanProducts extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: { keys: [] },
			query: ''
		};
	}

	componentDidMount = () => {
		document.title = `Loan Applications | ${Configs.settings.appName}`;
	};

	renderRecords = () => {
		const {
			location,
			history,
			changeLoansProperty,
			loans: { fetchingLoanApplications, applications, perPage },
			customers,
			users,
			status: { statuses, fetchingStatuses }
		} = this.props;
		const { selected, query } = this.state;

		const data = _.sortBy(
			_.remove(
				_.map(applications, ({ id, number, purpose, amount, status_id, customer, period, sales_person, created_by, date_created }) => {
					const customerRecord = _.find(customers, ({ id }) => parseInt(id) === parseInt(customer));

					return {
						id,
						number,
						purpose,
						amount,
						status: status_id,
						customer: customerRecord ? _.startCase(_.toLower(customerRecord.name)) : '-',
						period,
						sales_person,
						created_by,
						date_created: moment(date_created)
					};
				}),
				({ number, customer }) => _.includes(_.toLower(number), _.toLower(query)) || _.includes(_.toLower(customer), _.toLower(query))
			),
			'name'
		);

		const columns = [
			{
				title: 'ID',
				dataIndex: 'id',
				render: text => text,
				width: 50
			},
			{
				title: 'Number',
				dataIndex: 'number',
				render: text => text,
				sorter: (a, b) => {
					return parseInt(a.number) - parseInt(b.number);
				},
				width: 100
			},
			{
				title: 'Customer',
				dataIndex: 'customer',
				render: text => text,
				sorter: (a, b) => {
					return a.customer.localeCompare(b.customer);
				}
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
				width: 125,
				sorter: (a, b) => {
					return parseInt(a.amount) - parseInt(b.amount);
				}
			},
			{
				title: 'Status',
				dataIndex: 'status',
				render: text => {
					const status = _.find(statuses, ({ id }) => parseInt(id) === parseInt(text));

					return status ? status.name : '-';
				},
				width: 120,
				filters: _.map(_.uniq(_.map(data, ({ status }) => parseInt(status))), statusId => {
					const status = _.find(statuses, ({ id }) => parseInt(id) === parseInt(statusId));

					return {
						text: status ? status.name : statusId,
						value: statusId
					};
				}),
				onFilter: (status, record) => parseInt(record.status) === parseInt(status)
			},
			{
				title: 'Period',
				dataIndex: 'period',
				render: text => {
					return `${text} months`;
				},
				width: 100,
				filters: _.map(_.uniq(_.map(data, ({ period }) => parseInt(period))), period => {
					return {
						text: period,
						value: period
					};
				}),
				onFilter: (period, record) => parseInt(record.period) === parseInt(period),
				sorter: (a, b) => {
					return parseInt(a.period) - parseInt(b.period);
				}
			},
			{
				title: 'Created By',
				dataIndex: 'created_by',
				render: userId => {
					const user = _.find(users.users, ({ id, name }) => id === userId);

					return user ? user.name : '';
				},
				width: 150,
				filters: _.map(_.uniq(_.map(data, ({ created_by }) => parseInt(created_by))), created_by => {
					const user = _.find(users.users, ({ id }) => parseInt(id) === parseInt(created_by));

					return {
						text: user ? user.name : created_by,
						value: created_by
					};
				}),
				onFilter: (created_by, record) => parseInt(record.created_by) === parseInt(created_by)
			},
			{
				title: 'Created On',
				dataIndex: 'date_created',
				render: date => {
					return date !== 'Invalid date' ? date.format('D MMM, YYYY') : '-';
				},
				width: 110,
				sorter: (a, b) => {
					return a.date_created.valueOf() - b.date_created.valueOf();
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
			getCheckboxProps: ({ id }) => ({ id })
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
					<Col span={17} />
				</Row>
				<Table
					rowKey="id"
					size="middle"
					loading={fetchingStatuses || fetchingLoanApplications}
					rowSelection={rowSelection}
					columns={columns}
					dataSource={_.map(data, (entry, index) => ({ ...entry, rowKey: entry.id }))}
					pagination={pagination}
				/>
			</div>
		);
	};

	render = () => {
		const { location, history } = this.props;

		return (
			<Structure navigation={{ history, location }}>
				<Divider orientation="left">Loan Applications</Divider>
				<Tabs defaultActiveKey="1" onChange={this.callback}>
					<TabPane tab="Records" key="1">
						{this.renderRecords()}
					</TabPane>
					<TabPane tab="Reports" key="2" />
				</Tabs>
			</Structure>
		);
	};
}

const mapStateToProps = ({ user, status, users, loans, customers }) => {
	return { user, status, users, loans: _.pick(loans, ['applications', 'fetchingLoanApplications', 'perPage']), customers: customers.customers };
};

export default connect(mapStateToProps, { changeLoansProperty })(Form.create()(LoanProducts));
