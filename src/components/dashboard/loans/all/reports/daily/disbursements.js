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

class Disbursements extends Component {
	renderCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			graphContainer
		} = this.props;

		const data = _.map(
			_.map(Configs.enumerateDates(startDate.toDate(), endDate.toDate()), date =>
				moment(date).format('YYYY-MM-DD')
			),
			period => {
				let count = 0;

				_.forEach(loans, entry => {
					const { principal_paid, interest_paid, date_created, maturity_date } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderBookValueDisbursements = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			graphContainer
		} = this.props;

		const data = _.map(
			_.map(Configs.enumerateDates(startDate.toDate(), endDate.toDate()), date =>
				moment(date).format('YYYY-MM-DD')
			),
			period => {
				let totalAmount = 0;

				_.forEach(loans, entry => {
					const { amount } = entry;
					console.log(entry);
					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						totalAmount = totalAmount + parseFloat(amount);
					}
				});

				return {
					period,
					'Book Value': totalAmount
				};
			}
		);

		return (
			<Line
				data={data}
				width={graphContainer}
				height={460}
				fields={['Book Value']}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderActualDisbursements = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			graphContainer
		} = this.props;

		const data = _.map(
			_.map(Configs.enumerateDates(startDate.toDate(), endDate.toDate()), date =>
				moment(date).format('YYYY-MM-DD')
			),
			period => {
				let totalAmount = 0;

				_.forEach(loans, entry => {
					const { actual_amount } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						totalAmount = totalAmount + parseFloat(actual_amount);
					}
				});

				return {
					period,
					Actual: totalAmount
				};
			}
		);

		return (
			<Line
				data={data}
				width={graphContainer}
				height={460}
				fields={['Actual']}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderBookValueVsActualDisbursements = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalSeries = {
			'Book Value': 0,
			Actual: 0
		};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodSeries = {
					'Book Value': 0,
					Actual: 0
				};

				_.forEach(loans, entry => {
					const { amount, actual_amount } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						periodSeries['Book Value'] = periodSeries['Book Value'] + parseFloat(amount);
						periodSeries['Actual'] = periodSeries['Actual'] + parseFloat(actual_amount);

						globalSeries['Book Value'] = globalSeries['Book Value'] + parseFloat(amount);
						globalSeries['Actual'] = globalSeries['Actual'] + parseFloat(actual_amount);
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
					data={_.map(['Book Value', 'Actual'], item => {
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
				fields={['Book Value', 'Actual']}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderProductsDisbursements = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalAmount = {};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(loans, entry => {
					const { amount, product } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						let { name } = product;
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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderProductsCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalCount = {};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodCount = {};

				_.forEach(loans, entry => {
					const { product } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						let { name } = product;
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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderAgeGroupDisbursements = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalAmount = {};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(loans, entry => {
					const { amount, age_group } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderAgeGroupCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalCount = {};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodCount = {};

				_.forEach(loans, entry => {
					const { amount, age_group } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderMaritalStatusDisbursements = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalAmount = {};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(loans, entry => {
					const { amount, marital_status } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						let { name } = marital_status;
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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderMaritalStatusCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalCount = {};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodCount = {};

				_.forEach(loans, entry => {
					const { amount, marital_status } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						let { name } = marital_status;
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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderVoteCodeDisbursements = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalAmount = {};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(loans, entry => {
					const { amount, vote_code } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						let { department } = vote_code;

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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	renderVoteCodeCount = () => {
		const {
			filter: {
				dates: [startDate, endDate],
				type
			},
			loans,
			products,
			graphContainer,
			showPieCharts
		} = this.props;

		let globalCount = {};

		const data = _.map(
			_.map(Configs.enumerateDates(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodCount = {};

				_.forEach(loans, entry => {
					const { amount, vote_code } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`].format(
							'YYYY-MM-DD'
						) === period
					) {
						let { department } = vote_code;

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
				xAxis={{ key: 'period', label: 'Period', formatter: date => moment(date).format('D, MMM, YY') }}
			/>
		);
	};

	render = () => {
		const {
			renderCount,
			renderBookValueDisbursements,
			renderActualDisbursements,
			renderBookValueVsActualDisbursements,
			renderProductsDisbursements,
			renderProductsCount,
			renderAgeGroupDisbursements,
			renderAgeGroupCount,
			renderMaritalStatusDisbursements,
			renderMaritalStatusCount,
			renderVoteCodeDisbursements,
			renderVoteCodeCount,
			props: { loans, showPieCharts, onShowPieChartsChange }
		} = this;

		return (
			<div>
				<div>
					<Tabs defaultActiveKey="1">
						<TabPane
							tab={`Count - ${formatMoney(loans.length, {
								symbol: '',
								precision: 0
							})}`}
							key="1"
						>
							{renderCount()}
						</TabPane>
						<TabPane
							tab={`Book Value Amount - UGX ${Configs.abbreviateNumber(
								_.sum(_.map(loans, ({ amount }) => parseFloat(amount))),
								2
							)}`}
							key="2"
						>
							{renderBookValueDisbursements()}
						</TabPane>
						<TabPane
							tab={`Actual Amount - UGX ${Configs.abbreviateNumber(
								_.sum(_.map(loans, ({ actual_amount }) => parseFloat(actual_amount))),
								2
							)}`}
							key="3"
						>
							{renderActualDisbursements()}
						</TabPane>
						<TabPane tab="Book Value Amount vs Actual Amount" key="4">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderBookValueVsActualDisbursements()}
						</TabPane>
						<TabPane tab="Products (By Amount)" key="5">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderProductsDisbursements()}
						</TabPane>
						<TabPane tab="Products (By Count)" key="6">
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
						<TabPane tab="Age Group (By Amount)" key="7">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderAgeGroupDisbursements()}
						</TabPane>
						<TabPane tab="Age Group (By Count)" key="8">
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
						<TabPane tab="Marital Status (By Amount)" key="9">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderMaritalStatusDisbursements()}
						</TabPane>
						<TabPane tab="Marital Status (By Count)" key="10">
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
						<TabPane tab="Vote Code (By Amount)" key="11">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderVoteCodeDisbursements()}
						</TabPane>
						<TabPane tab="Vote Code (By Count)" key="12">
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
					</Tabs>
				</div>
			</div>
		);
	};
}

Disbursements.propTypes = {
	loans: PropTypes.object,
	filter: PropTypes.object
};

Disbursements.defaultProps = {
	data: {},
	filter: {
		type: '',
		date: [moment().startOf('year'), moment()]
	}
};

export default Disbursements;
