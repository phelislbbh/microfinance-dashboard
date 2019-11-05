import React, { Component } from 'react';
import { Divider, Tabs, Switch, Row, Col } from 'antd';
import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import PropTypes from 'prop-types';
import formatMoney from 'accounting-js/lib/formatMoney.js';

import Expected from './expected';
import Collected from './collected';
import NotCollected from './not_collected';

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
		const {
			props: { schedule, filter },
			state: { showPieCharts, graphContainer }
		} = this;

		return (
			<div>
				<div
					ref={element => {
						this.graphContainer = element;
					}}
				>
					<Divider orientation="left">Expected</Divider>
					<Expected
						showPieCharts={showPieCharts}
						onShowPieChartsChange={showPieCharts => this.setState({ showPieCharts })}
						graphContainer={graphContainer}
						schedule={schedule}
						filter={filter}
					/>
					<Divider orientation="left">Collected</Divider>
					<Collected
						showPieCharts={showPieCharts}
						onShowPieChartsChange={showPieCharts => this.setState({ showPieCharts })}
						graphContainer={graphContainer}
						schedule={schedule}
						filter={filter}
					/>
					<Divider orientation="left">Not Collected</Divider>
					<NotCollected
						showPieCharts={showPieCharts}
						onShowPieChartsChange={showPieCharts => this.setState({ showPieCharts })}
						graphContainer={graphContainer}
						schedule={schedule}
						filter={filter}
					/>
				</div>
			</div>
		);
	};
}

Daily.propTypes = {
	schedule: PropTypes.object,
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
