import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import PropTypes from 'prop-types';
import _ from 'lodash';

class Series extends Component {
	render() {
		const { data, xAxis, yAxis, fields, transform, color, width, height, shape } = this.props;

		const ds = new DataSet();
		const dv = ds.createView().source(data);
		dv.transform({
			type: 'fold',
			fields,
			...transform
		});

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
			<div>
				<Chart width={width} height={height} data={dv} scale={scale}>
					<Legend />
					<Axis name={`${xAxis.key}`} />
					<Axis name={`${yAxis.key}`} />
					<Tooltip
						crosshairs={{
							type: 'y'
						}}
					/>
					<Geom type="line" shape={shape} color={color} position={`${xAxis.key}*${yAxis.key}`} size={2} />
					<Geom
						type="point"
						position={`${xAxis.key}*${transform.value}`}
						size={4}
						shape="circle"
						color={color}
						style={{
							stroke: '#fff',
							lineWidth: 1
						}}
					/>
				</Chart>
			</div>
		);
	}
}

Series.propTypes = {
	data: PropTypes.array,
	height: PropTypes.number,
	fields: PropTypes.array,
	transform: PropTypes.object,
	shape: PropTypes.string
};

Series.defaultProps = {
	data: [],
	height: 300,
	fields: [],
	transform: {},
	shape: 'smooth'
};

export default Series;
