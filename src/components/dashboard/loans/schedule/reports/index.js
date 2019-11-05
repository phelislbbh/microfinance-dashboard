import React, { Component } from 'react';
import { DatePicker, Select, Tabs, Row, Col, Menu, Affix, Dropdown, Icon, Divider } from 'antd';
import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { connect } from 'react-redux';

import { changeLoansProperty } from '../../../../../actions';
import Structure from '../../../structure';

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
		activeReports: 'monthly'
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

	renderMonthlyGraphs = () => {
		const { schedule, filter } = this.props;

		return <Monthly schedule={schedule} filter={filter} />;
	};

	renderQuarterlyGraphs = () => {
		const { schedule, filter } = this.props;

		return <Quarterly schedule={schedule} filter={filter} />;
	};

	renderAnnualGraphs = () => {
		const { schedule, filter } = this.props;

		return <Annual schedule={schedule} filter={filter} />;
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
						<Option value="disbursal">Disbursed between</Option>
						<Option value="maturity">Matures between</Option>
						<Option value="due">Due between</Option>
						<Option value="paid">Paid between</Option>
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
								defaultSelectedKeys={['monthly']}
								mode="inline"
								theme="light"
								onSelect={this.onChangeSection}
							>
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
	return {
		screen,
		status
	};
};

export default connect(
	mapStateToProps,
	{}
)(Reports);
