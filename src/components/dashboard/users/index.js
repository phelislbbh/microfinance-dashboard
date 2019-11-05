import React, { Component } from 'react';
import { Form, Input, Table, Row, Col, Button, Icon, Menu, message, Dropdown, Divider } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import _ from 'lodash';

import { changeUsersProperty } from '../../../actions';
import Structure from '../structure';
import Configs from '../../../configs';

const FormItem = Form.Item;
const Search = Input.Search;

class Users extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: { keys: [] },
			query: '',
			sort: {
				name: 'asc'
			}
		};
	}

	componentDidMount = () => {
		document.title = `Users | ${Configs.settings.appName}`;
	};

	render = () => {
		const { location, history, changeUsersProperty, fetchingRoles, fetchRoles, fetchingUsers, users } = this.props;
		const { selected, query } = this.state;

		const data = _.sortBy(
			_.remove(
				_.map(users.users, ({ id, email, login, name, phone, role }) => ({
					id,
					name,
					email,
					phone,
					role,
					login: login.name,
					status: login.status,
					lastLogin: moment(login.last_login)
				})),
				({ name }) => _.includes(_.toLower(name), _.toLower(query))
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
				title: 'Name',
				dataIndex: 'name',
				render: text => text,
				sorter: (a, b) => {
					return a.name.localeCompare(b.name);
				}
			},
			{
				title: 'Email Address',
				dataIndex: 'email',
				render: text => {
					return (
						<div className="truncate" title={text}>
							{_.truncate(text, { length: 30 })}
						</div>
					);
				},
				width: 175
			},
			{
				title: 'Phone Number',
				dataIndex: 'phone',
				render: text => text,
				width: 120
			},
			{
				title: 'Role',
				dataIndex: 'role',
				render: roleId => {
					const role = _.find(users.roles, ({ id }) => id === roleId);

					return role ? role.name : '-';
				},
				width: 120,
				filters: _.remove(_.map(users.roles, ({ id, name }) => ({ text: name, value: id })), ({ text }) => text !== '--Select--'),
				onFilter: (role, record) => parseInt(record.role) === parseInt(role)
			},
			{
				title: 'Status',
				dataIndex: 'status',
				render: status => {
					return status === 0 ? 'Inactive' : 'Active';
				},
				width: 80,
				filters: [{ text: 'Active', value: 1 }, { text: 'Inactive', value: 0 }],
				onFilter: (status, record) => parseInt(record.status) === parseInt(status)
			},
			{
				title: 'Last Login',
				dataIndex: 'lastLogin',
				render: date => {
					return date !== 'Invalid date' ? date.format('D MMM, YYYY') : '-';
				},
				width: 110,
				sorter: (a, b) => {
					return a.lastLogin.valueOf() - b.lastLogin.valueOf();
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
			pageSize: users.perPage,
			total: data.length,
			simple: false,
			defaultCurrent: 1,
			showQuickJumper: false,
			size: 'small',
			showSizeChanger: true,
			onShowSizeChange: (current, size) => {
				changeUsersProperty('perPage', size);
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
				<Divider orientation="left">Users</Divider>
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
					loading={users.fetchingRoles || users.fetchingUsers}
					rowSelection={rowSelection}
					columns={columns}
					dataSource={_.map(data, (entry, index) => ({ ...entry, rowKey: entry.id }))}
					pagination={pagination}
				/>
			</Structure>
		);
	};
}

const mapStateToProps = ({ user, users }) => {
	return { user, users };
};

export default connect(mapStateToProps, { changeUsersProperty })(Form.create()(Users));
