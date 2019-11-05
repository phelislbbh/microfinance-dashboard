import React, { Component } from 'react';
import { Divider, Tabs, Switch, Row, Col } from 'antd';
import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import PropTypes from 'prop-types';
import formatMoney from 'accounting-js/lib/formatMoney.js';

import BarChart from '../../../../common/bar-chart';
import Line from '../../../../common/line';
import Doughnut from '../../../../common/doughnut';

import Configs from '../../../../../../configs';

import '../../../style.css';

const moment = extendMoment(Moment);
const { TabPane } = Tabs;

class Expected extends Component {
	renderCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			graphContainer
		} = this.props;

		const data = _.map(
			_.map(Configs.enumerateYears(startDate.toDate(), endDate.toDate()), date =>
				moment(date).format('YYYY-MM-DD')
			),
			period => {
				let count = 0;

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						count = count + 1;
					}
				});

				return {
					period,
					Count: count
				};
			}
		);

		return (
			<Line
				data={data}
				width={graphContainer}
				height={460}
				fields={['Count']}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{
					key: 'amount',
					formatter: value =>
						formatMoney(value, {
							symbol: '',
							precision: 0
						})
				}}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderAmount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			graphContainer
		} = this.props;

		const data = _.map(
			_.map(Configs.enumerateYears(startDate.toDate(), endDate.toDate()), date =>
				moment(date).format('YYYY-MM-DD')
			),
			period => {
				let totalAmount = 0;

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						totalAmount = totalAmount + parseFloat(entry.amount);
					}
				});

				return {
					period,
					Amount: totalAmount
				};
			}
		);

		return (
			<Line
				data={data}
				width={graphContainer}
				height={460}
				fields={['Amount']}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderPrincipalVsInterest = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalSeries = {
			Principal: 0,
			Interest: 0
		};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodSeries = {
					Principal: 0,
					Interest: 0
				};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						const { principal_to_pay, interest_to_pay } = entry;

						periodSeries.Principal = periodSeries.Principal + parseFloat(principal_to_pay);
						periodSeries.Interest = periodSeries.Interest + parseFloat(interest_to_pay);

						globalSeries.Principal = globalSeries.Principal + parseFloat(principal_to_pay);
						globalSeries.Interest = globalSeries.Interest + parseFloat(interest_to_pay);
					}
				});

				return {
					period,
					...periodSeries
				};
			}
		);

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(['Principal', 'Interest'], item => {
						const total = globalSeries[item];

						return { item: `${item} (UGX ${Configs.abbreviateNumber(total, 2)})`, total };
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={data}
				width={graphContainer}
				height={400}
				fields={['Principal', 'Interest']}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderProductsExpected = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalAmount = {};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						let {
							amount,
							product: { name }
						} = entry;
						name = name.replace('Salary Loan ', '');

						periodAmount[name] = (periodAmount[name] || 0) + parseFloat(amount);
						globalAmount[name] = (globalAmount[name] || 0) + parseFloat(amount);
					}
				});

				return {
					period,
					...periodAmount
				};
			}
		);

		const validProducts = _.sortBy(_.remove(_.keys(globalAmount), key => globalAmount[key] > 0));

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(validProducts, item => {
						const total = globalAmount[item];

						return { item: `${item} (UGX ${Configs.abbreviateNumber(total, 2)})`, total };
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={_.map(data, entry => {
					const defaults = _.transform(
						validProducts,
						(defaults, entry, index) => {
							defaults[entry] = 0;
						},
						{}
					);

					return { ...defaults, ..._.pick(entry, _.concat(['period'], validProducts)) };
				})}
				width={graphContainer}
				height={400}
				fields={validProducts}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderProductsCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalCount = {};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodCount = {};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						let {
							amount,
							product: { name }
						} = entry;
						name = name.replace('Salary Loan ', '');

						periodCount[name] = (periodCount[name] || 0) + 1;
						globalCount[name] = (globalCount[name] || 0) + 1;
					}
				});

				return {
					period,
					...periodCount
				};
			}
		);

		const validProducts = _.sortBy(_.remove(_.keys(globalCount), key => globalCount[key] > 0));

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(validProducts, item => {
						const total = globalCount[item];

						return {
							item: `${item} (${formatMoney(total, {
								symbol: '',
								precision: 0
							})})`,
							total
						};
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={_.map(data, entry => {
					const defaults = _.transform(
						validProducts,
						(defaults, entry, index) => {
							defaults[entry] = 0;
						},
						{}
					);

					return { ...defaults, ..._.pick(entry, _.concat(['period'], validProducts)) };
				})}
				width={graphContainer}
				height={400}
				fields={validProducts}
				transform={{ key: 'measure', value: 'count' }}
				color={['measure', Configs.colors]}
				yAxis={{
					key: 'count',
					formatter: value =>
						`${formatMoney(value, {
							symbol: '',
							precision: 0
						})}`
				}}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderAgeGroupExpected = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalAmount = {};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						let { amount, age_group } = entry;
						periodAmount[age_group] = (periodAmount[age_group] || 0) + parseFloat(amount);
						globalAmount[age_group] = (globalAmount[age_group] || 0) + parseFloat(amount);
					}
				});

				return {
					period,
					...periodAmount
				};
			}
		);

		const validAgeGroups = _.sortBy(_.remove(_.keys(globalAmount), key => globalAmount[key] > 0));

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(validAgeGroups, item => {
						const total = globalAmount[item];

						return { item: `${item} (UGX ${Configs.abbreviateNumber(total, 2)})`, total };
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={_.map(data, entry => {
					const defaults = _.transform(
						validAgeGroups,
						(defaults, entry, index) => {
							defaults[entry] = 0;
						},
						{}
					);

					return { ...defaults, ..._.pick(entry, _.concat(['period'], validAgeGroups)) };
				})}
				width={graphContainer}
				height={400}
				fields={validAgeGroups}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderAgeGroupCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalCount = {};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodCount = {};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						let { amount, age_group } = entry;
						periodCount[age_group] = (periodCount[age_group] || 0) + 1;
						globalCount[age_group] = (globalCount[age_group] || 0) + 1;
					}
				});

				return {
					period,
					...periodCount
				};
			}
		);

		const validAgeGroups = _.sortBy(_.remove(_.keys(globalCount), key => globalCount[key] > 0));

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(validAgeGroups, item => {
						const total = globalCount[item];

						return {
							item: `${item} (${formatMoney(total, {
								symbol: '',
								precision: 0
							})})`,
							total
						};
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={_.map(data, entry => {
					const defaults = _.transform(
						validAgeGroups,
						(defaults, entry, index) => {
							defaults[entry] = 0;
						},
						{}
					);

					return { ...defaults, ..._.pick(entry, _.concat(['period'], validAgeGroups)) };
				})}
				width={graphContainer}
				height={400}
				fields={validAgeGroups}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{
					key: 'amount',
					formatter: value =>
						`${formatMoney(value, {
							symbol: '',
							precision: 0
						})}`
				}}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderMaritalStatusExpected = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalAmount = {};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						let {
							amount,
							marital_status: { name }
						} = entry;
						name = name.replace('--Select--', 'Uncategorized');

						periodAmount[name] = (periodAmount[name] || 0) + parseFloat(amount);
						globalAmount[name] = (globalAmount[name] || 0) + parseFloat(amount);
					}
				});

				return {
					period,
					...periodAmount
				};
			}
		);

		const validMaritalStatuses = _.sortBy(_.remove(_.keys(globalAmount), key => globalAmount[key] > 0));

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(validMaritalStatuses, item => {
						const total = globalAmount[item];

						return { item: `${item} (UGX ${Configs.abbreviateNumber(total, 2)})`, total };
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={_.map(data, entry => {
					const defaults = _.transform(
						validMaritalStatuses,
						(defaults, entry, index) => {
							defaults[entry] = 0;
						},
						{}
					);

					return { ...defaults, ..._.pick(entry, _.concat(['period'], validMaritalStatuses)) };
				})}
				width={graphContainer}
				height={400}
				fields={validMaritalStatuses}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderMaritalStatusCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalCount = {};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodCount = {};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						let {
							amount,
							marital_status: { name }
						} = entry;
						name = name.replace('--Select--', 'Uncategorized');

						periodCount[name] = (periodCount[name] || 0) + 1;
						globalCount[name] = (globalCount[name] || 0) + 1;
					}
				});

				return {
					period,
					...periodCount
				};
			}
		);

		const validMaritalStatuses = _.sortBy(_.remove(_.keys(globalCount), key => globalCount[key] > 0));

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(validMaritalStatuses, item => {
						const total = globalCount[item];

						return {
							item: `${item} (${formatMoney(total, {
								symbol: '',
								precision: 0
							})})`,
							total
						};
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={_.map(data, entry => {
					const defaults = _.transform(
						validMaritalStatuses,
						(defaults, entry, index) => {
							defaults[entry] = 0;
						},
						{}
					);

					return { ...defaults, ..._.pick(entry, _.concat(['period'], validMaritalStatuses)) };
				})}
				width={graphContainer}
				height={400}
				fields={validMaritalStatuses}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{
					key: 'amount',
					formatter: value =>
						`${formatMoney(value, {
							symbol: '',
							precision: 0
						})}`
				}}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderVoteCodeExpected = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalAmount = {};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						let {
							amount,
							vote_code: { department }
						} = entry;

						periodAmount[department] = (periodAmount[department] || 0) + parseFloat(amount);
						globalAmount[department] = (globalAmount[department] || 0) + parseFloat(amount);
					}
				});

				return {
					period,
					...periodAmount
				};
			}
		);

		const validVoteCodes = _.sortBy(_.remove(_.keys(globalAmount), key => globalAmount[key] > 0));

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(validVoteCodes, item => {
						const total = globalAmount[item];

						return { item: `${item} (UGX ${Configs.abbreviateNumber(total, 2)})`, total };
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={_.map(data, entry => {
					const defaults = _.transform(
						validVoteCodes,
						(defaults, entry, index) => {
							defaults[entry] = 0;
						},
						{}
					);

					return { ...defaults, ..._.pick(entry, _.concat(['period'], validVoteCodes)) };
				})}
				width={graphContainer}
				height={400}
				fields={validVoteCodes}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	renderVoteCodeCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			schedule,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalCount = {};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodCount = {};

				_.forEach(schedule, entry => {
					if (entry[`${this.props.filter.type}_date`].startOf('year').format('YYYY-MM-DD') === period) {
						let {
							amount,
							vote_code: { department }
						} = entry;

						periodCount[department] = (periodCount[department] || 0) + 1;
						globalCount[department] = (globalCount[department] || 0) + 1;
					}
				});

				return {
					period,
					...periodCount
				};
			}
		);

		const validVoteCodes = _.sortBy(_.remove(_.keys(globalCount), key => globalCount[key] > 0));

		if (showPieCharts) {
			const legendOptions = {
				position: 'bottom',
				offsetX: 2,
				offsetY: 0,
				show: true
			};

			const labelOptions = {
				show: false
			};

			return (
				<Doughnut
					data={_.map(validVoteCodes, item => {
						const total = globalCount[item];

						return {
							item: `${item} (${formatMoney(total, {
								symbol: '',
								precision: 0
							})})`,
							total
						};
					})}
					transform={{
						field: 'total',
						dimension: 'item'
					}}
					width={graphContainer}
					height={400}
					legend={legendOptions}
					label={labelOptions}
					color={['item', Configs.colors]}
				/>
			);
		}

		return (
			<Line
				data={_.map(data, entry => {
					const defaults = _.transform(
						validVoteCodes,
						(defaults, entry, index) => {
							defaults[entry] = 0;
						},
						{}
					);

					return { ...defaults, ..._.pick(entry, _.concat(['period'], validVoteCodes)) };
				})}
				width={graphContainer}
				height={400}
				fields={validVoteCodes}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{
					key: 'amount',
					formatter: value =>
						`${formatMoney(value, {
							symbol: '',
							precision: 0
						})}`
				}}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('YYYY') }}
			/>
		);
	};

	render = () => {
		const {
			renderCount,
			renderAmount,
			renderPrincipalVsInterest,
			renderProductsCount,
			renderProductsExpected,
			renderAgeGroupCount,
			renderAgeGroupExpected,
			renderMaritalStatusCount,
			renderMaritalStatusExpected,
			renderVoteCodeCount,
			renderVoteCodeExpected,
			props: { schedule, showPieCharts, onShowPieChartsChange }
		} = this;

		return (
			<div>
				<div>
					<Tabs defaultActiveKey="1">
						<TabPane
							tab={`Count - ${formatMoney(schedule.length, {
								symbol: '',
								precision: 0
							})}`}
							key="1"
						>
							{renderCount()}
						</TabPane>
						<TabPane
							tab={`Amount - ${Configs.abbreviateNumber(
								_.sum(_.map(schedule, ({ amount }) => amount)),
								2
							)}`}
							key="2"
						>
							{renderAmount()}
						</TabPane>
						<TabPane tab={`Principal vs Interest`} key="3">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderPrincipalVsInterest()}
						</TabPane>
						<TabPane tab={`Products (Count)`} key="4">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderProductsCount()}
						</TabPane>
						<TabPane tab={`Products (Amount)`} key="5">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderProductsExpected()}
						</TabPane>
						<TabPane tab={`Age Group (Count)`} key="6">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderAgeGroupCount()}
						</TabPane>
						<TabPane tab={`Age Group (Amount)`} key="7">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderAgeGroupExpected()}
						</TabPane>
						<TabPane tab={`Marital Status (Count)`} key="8">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderMaritalStatusCount()}
						</TabPane>
						<TabPane tab={`Marital Status (Amount)`} key="9">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderMaritalStatusExpected()}
						</TabPane>
						<TabPane tab={`Vote Code (Count)`} key="10">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderVoteCodeCount()}
						</TabPane>
						<TabPane tab={`Vote Code (Amount)`} key="11">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderVoteCodeExpected()}
						</TabPane>
					</Tabs>
				</div>
			</div>
		);
	};
}

export default Expected;
