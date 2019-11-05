import React, { Component } from 'react';
import { Form, Input, Table, Row, Col, Button, Icon, Menu, message, Dropdown, Divider } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import _ from 'lodash';

import { changeCustomersProperty } from '../../../actions';
import Structure from '../structure';
import Configs from '../../../configs';

const FormItem = Form.Item;
const Search = Input.Search;

class Customers extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: { keys: [] },
			query: ''
		};
	}

	componentDidMount = () => {
		document.title = `Customers | ${Configs.settings.appName}`;
	};

	render = () => {
		const { location, history, changeCustomersProperty, fetchCustomers, customers, loans } = this.props;
		const { selected, query } = this.state;

		const data = _.sortBy(
			_.remove(
				_.map(
					customers.customers,
					({ id, first_phone, client_number, date_registered, employer, ipps_number, name, profession, vote_code_id }, index) => {
						return {
							id,
							phone: first_phone,
							date_registered: moment(date_registered),
							employer,
							ipps: ipps_number,
							name,
							profession,
							vote_code: vote_code_id,
							loans: _.remove(_.concat([], loans), ({ customer }) => parseInt(customer) === id)
						};
					}
				),
				({ number, ipps, name }) =>
					_.includes(_.toLower(number), _.toLower(query)) ||
					_.includes(_.toLower(ipps), _.toLower(query)) ||
					_.includes(_.toLower(name), _.toLower(query))
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
				render: text => _.startCase(_.toLower(text)),
				sorter: (a, b) => {
					return a.name.localeCompare(b.name);
				}
			},
			{
				title: 'IPPS',
				dataIndex: 'ipps',
				render: text => text,
				width: 145
			},
			{
				title: 'Profession',
				dataIndex: 'profession',
				render: text => {
					return (
						<div className="truncate" title={_.startCase(_.toLower(text))}>
							{_.truncate(_.startCase(_.toLower(text)), { length: 20 })}
						</div>
					);
				},
				width: 100
			},
			{
				title: 'Employer',
				dataIndex: 'employer',
				render: text => {
					return (
						<div className="truncate" title={_.startCase(_.toLower(text))}>
							{_.truncate(_.startCase(_.toLower(text)), { length: 30 })}
						</div>
					);
				},
				width: 120,
				filters: _.map(_.uniq(_.map(data, ({ employer }) => employer)), employer => {
					return {
						text: _.startCase(_.toLower(employer)),
						value: employer
					};
				}),
				onFilter: (employer, record) => record.employer === employer
			},
			{
				title: 'Vote Code',
				dataIndex: 'vote_code',
				render: text => {
					const voteCode = _.find(customers.voteCodes, ({ code }) => parseInt(code) === text);

					if (voteCode) {
						return (
							<div className="truncate" title={_.startCase(_.toLower(voteCode.department))}>
								{_.truncate(_.startCase(_.toLower(voteCode.department)), { length: 30 })}
							</div>
						);
					}

					return '-';
				},
				width: 140,
				filters: _.map(
					_.uniq(_.remove(_.map(data, ({ vote_code }) => vote_code)), vote_code => {
						return vote_code ? true : false;
					}),
					vote_code => {
						const voteCode = _.find(customers.voteCodes, ({ code }) => parseInt(code) === vote_code);

						return {
							text: voteCode ? voteCode.department : vote_code,
							value: vote_code
						};
					}
				),
				onFilter: (vote_code, record) => parseInt(record.vote_code) === parseInt(vote_code)
			},
			{
				title: 'Loans',
				dataIndex: 'loans',
				render: loans => loans.length,
				width: 80,
				sorter: (a, b) => {
					return a.loans.length - b.loans.length;
				}
			},
			{
				title: 'Registered',
				dataIndex: 'date_registered',
				render: date => {
					return date !== 'Invalid date' ? date.format('D MMM, YYYY') : '-';
				},
				width: 110,
				sorter: (a, b) => {
					return a.date_registered.valueOf() - b.date_registered.valueOf();
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
			pageSize: customers.perPage,
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
				<Divider orientation="left">Customers</Divider>
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
					loading={customers.fetchingCustomers}
					rowSelection={rowSelection}
					columns={columns}
					dataSource={_.map(data, (entry, index) => ({ ...entry, rowKey: entry.id }))}
					pagination={pagination}
				/>
			</Structure>
		);
	};
}

const mapStateToProps = ({ user, customers, loans }) => {
	return {
		user,
		customers: _.pick(customers, ['voteCodes', 'customers', 'fetchingCustomers', 'perPage']),
		loans: _.map(loans.loans, loan => {
			const application = _.find(loans.applications, ({ id }) => parseInt(id) === parseInt(loan.application_id));

			return { ..._.pick(loan, ['id']), customer: application ? application.customer : null };
		})
	};
};

export default connect(mapStateToProps, { changeCustomersProperty })(Form.create()(Customers));
