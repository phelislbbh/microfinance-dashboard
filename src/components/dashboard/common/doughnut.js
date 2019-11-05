import React from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend, Guide } from 'bizcharts';
import DataSet from '@antv/data-set';
import PropTypes from 'prop-types';
import _ from 'lodash';

class Doughnut extends React.Component {
	render() {
		const { data, transform, color } = this.props;
		const { DataView } = DataSet;
		const { Html } = Guide;

		const dv = new DataView();
		dv.source(data).transform({
			type: 'percent',
			as: 'percent',
			...transform
		});

		const cols = {
			percent: {
				formatter: val => `${_.round(val * 100, 2)}%`
			}
		};

		return (
			<div>
				<Chart width={this.props.width} height={this.props.height} data={dv} scale={cols} padding={[10, 10, 100, 10]} forceFit>
					<Coord type={'theta'} radius={1} innerRadius={0.5} />
					<Axis name="percent" />
					{this.props.legend.show ? <Legend {...this.props.legend} /> : <span />}
					<Tooltip
						showTitle={false}
						itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
					/>
					<Geom
						type="intervalStack"
						position="percent"
						color={color}
						Tooltip={[
							`${transform.dimension}*percent`,
							(item, percent) => {
								percent = percent * 100 + '%';

								return {
									name: item,
									value: percent,
									combination: `${item}x${percent}`
								};
							}
						]}
						style={{
							lineWidth: 1,
							stroke: '#fff'
						}}
					>
						{this.props.label.show ? <Label {...this.props.label} /> : <span />}
					</Geom>
				</Chart>
			</div>
		);
	}
}

Doughnut.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
	label: PropTypes.object,
	data: PropTypes.array,
	transform: PropTypes.object
};

Doughnut.defaultProps = {
	width: 200,
	height: 200,
	label: {
		show: true
	},
	data: [],
	transform: {}
};

export default Doughnut;
