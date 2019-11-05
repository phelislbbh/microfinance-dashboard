import React, { Component } from 'react';
import { Form, Input, Table, Row, Col, Button, Icon, Menu, message, Dropdown, Divider } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import formatMoney from 'accounting-js/lib/formatMoney.js';
import _ from 'lodash';

import { changeCustomersProperty } from '../../../actions';
import Structure from '../structure';
import Configs from '../../../configs';

const FormItem = Form.Item;
const Search = Input.Search;

class VoteCodes extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: { keys: [] },
			query: ''
		};
	}

	componentDidMount = () => {
		document.title = `Vote Codes | ${Configs.settings.appName}`;
	};

	render = () => {
		const { location, history, changeCustomersProperty, fetchVoteCodes, customers: { fetchingVoteCodes, voteCodes, perPage } } = this.props;
		const { selected, query } = this.state;

		const data = _.sortBy(
			_.remove(
				_.map(voteCodes, ({ id, code, department, payroll }) => ({
					id,
					code,
					department,
					payroll,
					customers: _.countBy(this.props.customers.customers, ({ vote_code_id }) => parseInt(vote_code_id) === parseInt(code)).true
				})),
				({ department, code }) => _.includes(_.toLower(department), _.toLower(query)) || _.includes(_.toLower(code), _.toLower(query))
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
				title: 'Code',
				dataIndex: 'code',
				render: text => text,
				width: 50
			},
			{
				title: 'Department',
				dataIndex: 'department',
				render: text => text,
				sorter: (a, b) => {
					return a.department.localeCompare(b.department);
				}
			},
			{
				title: 'Payroll',
				dataIndex: 'payroll',
				render: text => text,
				width: 110,
				filters: _.map(_.uniq(_.remove(_.map(data, ({ payroll }) => payroll)), payroll => (payroll ? true : false)), payroll => {
					return {
						text: payroll,
						value: payroll
					};
				}),
				onFilter: (payroll, record) => record.payroll === payroll
			},
			{
				title: 'Customers',
				dataIndex: 'customers',
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
				width: 115,
				sorter: (a, b) => {
					return a.customers - b.customers;
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
				changeCustomersProperty('perPage', size);
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
			<Structure navigation={{ history, location }}>
				<Divider orientation="left">Vote Codes</Divider>
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
					loading={fetchingVoteCodes}
					rowSelection={rowSelection}
					columns={columns}
					dataSource={_.map(data, (entry, index) => ({ ...entry, rowKey: entry.id }))}
					pagination={pagination}
				/>
			</Structure>
		);
	};
}

const mapStateToProps = ({ user, customers }) => {
	return { user, customers: _.pick(customers, ['voteCodes', 'customers', 'fetchingVoteCodes', 'perPage']) };
};

export default connect(mapStateToProps, { changeCustomersProperty })(Form.create()(VoteCodes));
