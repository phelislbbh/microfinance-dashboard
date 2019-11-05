import React, { Component } from 'react';
import { Divider, Tabs, Switch, Row, Col } from 'antd';
import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import PropTypes from 'prop-types';
import formatMoney from 'accounting-js/lib/formatMoney.js';

import Disbursements from './disbursements';
import Collections from './collections';

import Configs from '../../../../../../configs';

import '../../../style.css';

const moment = extendMoment(Moment);
const { TabPane } = Tabs;

class Daily extends Component {
	state = {
		graphContainer: 0,
		showPieCharts: false
	};

	componentDidMount = () => {
		this.setState({
			graphContainer: this.graphContainer.clientWidth
		});
	};

	render = () => {
		const { props: { loans, filter }, state: { showPieCharts, graphContainer } } = this;

		return (
			<div>
				<div
					ref={element => {
						this.graphContainer = element;
					}}
				>
					<Divider orientation="left">Disbursements</Divider>
					<Disbursements
						filter={filter}
						showPieCharts={showPieCharts}
						onShowPieChartsChange={showPieCharts => this.setState({ showPieCharts })}
						graphContainer={graphContainer}
						loans={loans}
					/>
					<Divider orientation="left">Collections</Divider>
					<Collections
						filter={filter}
						showPieCharts={showPieCharts}
						onShowPieChartsChange={showPieCharts => this.setState({ showPieCharts })}
						graphContainer={graphContainer}
						loans={loans}
					/>
				</div>
			</div>
		);
	};
}

Daily.propTypes = {
	loans: PropTypes.object,
	filter: PropTypes.object
};

Daily.defaultProps = {
	data: {},
	filter: {
		type: '',
		date: [moment().startOf('year'), moment()]
	}
};

export default Daily;
