import React, { PureComponent } from 'react';
import { Chart, Geom, Legend, Axis, Tooltip } from 'bizcharts';
import _ from 'lodash';
import PropTypes from 'prop-types';

class BarChart extends PureComponent {
	titleOptions = {
		offset: 70,
		textStyle: {
			fontSize: 14
		}
	};

	labelOptions = {
		autoRotate: false
	};

	lineOptions = {
		stroke: '#ddd',
		fill: '#fff',
		lineWidth: 1
	};

	render = () => {
		const { titleOptions, lineOptions, labelOptions, props: { colors, data, xAxis, yAxis, height, width, showAxisLabels } } = this;

		const highestYValue = _.reverse(_.sortBy(data, `${yAxis.key}`))[0][`${yAxis.key}`];
		const lowestYValue = _.sortBy(data, `${yAxis.key}`)[0][`${yAxis.key}`];

		let scale = {};

		scale[`${yAxis.key}`] = {
			alias: yAxis.label || yAxis.key,
			type: 'linear',
			...yAxis
		};
		scale[`${xAxis.key}`] = {
			alias: xAxis.label || xAxis.key,
			...xAxis
		};

		return (
			<div className="chart-container">
				<Chart height={height} data={data} scale={scale} width={width ? width : height}>
					<Legend />
					<Axis title={showAxisLabels ? titleOptions : false} name={xAxis.key} line={lineOptions} label={labelOptions} />
					<Axis title={showAxisLabels ? titleOptions : false} name={yAxis.key} line={lineOptions} label={labelOptions} />
					<Tooltip
						crosshairs={{
							type: 'y'
						}}
					/>
					<Geom type="interval" color={colors} position={`${xAxis.key}*${yAxis.key}`} />
				</Chart>
			</div>
		);
	};
}

BarChart.propTypes = {
	data: PropTypes.array,
	height: PropTypes.number,
	xAxis: PropTypes.object,
	yAxis: PropTypes.object,
	width: PropTypes.number
};

BarChart.defaultProps = {
	data: [],
	height: 300,
	xAxis: {},
	yAxis: {}
};

export default BarChart;
