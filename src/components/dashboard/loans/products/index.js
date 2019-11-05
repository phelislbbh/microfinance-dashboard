import React, { Component } from 'react';
import { Form, Input, Tabs, Table, Row, Col, Button, Icon, Menu, message, Dropdown, Divider } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
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
		document.title = `Loan Products | ${Configs.settings.appName}`;
	};

	renderRecords = () => {
		const { location, history, changeLoansProperty, loans: { fetchingLoanProducts, products, perPage } } = this.props;
		const { selected, query } = this.state;

		const data = _.sortBy(
			_.remove(
				_.map(products, ({ id, name }) => ({
					id,
					name
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
				render: text => _.startCase(_.toLower(text)),
				sorter: (a, b) => {
					return a.name.localeCompare(b.name);
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
					loading={fetchingLoanProducts}
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
				<Divider orientation="left">Loan Products</Divider>
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

const mapStateToProps = ({ user, loans }) => {
	return { user, loans: _.pick(loans, ['products', 'fetchingLoanProducts', 'perPage']) };
};

export default connect(mapStateToProps, { changeLoansProperty })(Form.create()(LoanProducts));
