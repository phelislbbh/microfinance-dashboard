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

class Collections extends Component {
	renderCollected = () => {
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

				_.forEach(loans, entry => {
					const { principal_paid, interest_paid } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						periodSeries.Principal = periodSeries.Principal + parseFloat(principal_paid);
						periodSeries.Interest = periodSeries.Interest + parseFloat(interest_paid);

						globalSeries.Principal = globalSeries.Principal + parseFloat(principal_paid);
						globalSeries.Interest = globalSeries.Interest + parseFloat(interest_paid);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderRemaining = () => {
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

				_.forEach(_.remove(_.concat([], loans), ({ status }) => _.includes([13, 14], status)), entry => {
					const { principal_remaining, interest_remaining } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						periodSeries.Principal = periodSeries.Principal + parseFloat(principal_remaining);
						periodSeries.Interest = periodSeries.Interest + parseFloat(interest_remaining);

						globalSeries.Principal = globalSeries.Principal + parseFloat(principal_remaining);
						globalSeries.Interest = globalSeries.Interest + parseFloat(interest_remaining);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderCollectedVsRemaining = () => {
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
			Collected: 0,
			Remaining: 0
		};

		const data = _.map(
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodSeries = {
					Collected: 0,
					Remaining: 0
				};

				_.forEach(loans, entry => {
					const { principal_paid, principal_remaining, interest_paid, interest_remaining } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						periodSeries.Collected =
							globalSeries.Collected + parseFloat(principal_paid) + parseFloat(interest_paid);
						periodSeries.Remaining =
							globalSeries.Remaining + parseFloat(principal_remaining) + parseFloat(interest_remaining);

						globalSeries.Collected =
							globalSeries.Collected + parseFloat(principal_paid) + parseFloat(interest_paid);
						globalSeries.Remaining =
							globalSeries.Remaining + parseFloat(principal_remaining) + parseFloat(interest_remaining);
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
					data={_.map(['Collected', 'Remaining'], item => {
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
				fields={['Collected', 'Remaining']}
				transform={{ key: 'measure', value: 'amount' }}
				color={['measure', Configs.colors]}
				yAxis={{ key: 'amount', formatter: value => `UGX ${Configs.abbreviateNumber(value, 1)}` }}
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderProductsCollected = () => {
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
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(loans, entry => {
					const { principal_paid, interest_paid, product } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						let { name } = product;
						name = name.replace('Salary Loan ', '');

						periodAmount[name] =
							(periodAmount[name] || 0) + parseFloat(principal_paid) + parseFloat(interest_paid);
						globalAmount[name] =
							(globalAmount[name] || 0) + parseFloat(principal_paid) + parseFloat(interest_paid);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderProductsRemaining = () => {
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
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(_.remove(_.concat([], loans), ({ status }) => _.includes([13, 14], status)), entry => {
					const { principal_remaining, interest_remaining, product } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						let { name } = product;
						name = name.replace('Salary Loan ', '');

						periodAmount[name] =
							(periodAmount[name] || 0) +
							parseFloat(principal_remaining) +
							parseFloat(interest_remaining);
						globalAmount[name] =
							(globalAmount[name] || 0) +
							parseFloat(principal_remaining) +
							parseFloat(interest_remaining);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderAgeGroupCollected = () => {
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
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(loans, entry => {
					const { principal_paid, interest_paid, age_group } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						periodAmount[age_group] =
							(periodAmount[age_group] || 0) + parseFloat(principal_paid) + parseFloat(interest_paid);
						globalAmount[age_group] =
							(globalAmount[age_group] || 0) + parseFloat(principal_paid) + parseFloat(interest_paid);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderAgeGroupRemaining = () => {
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
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(_.remove(_.concat([], loans), ({ status }) => _.includes([13, 14], status)), entry => {
					const { principal_remaining, interest_remaining, age_group } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						periodAmount[age_group] =
							(periodAmount[age_group] || 0) +
							parseFloat(principal_remaining) +
							parseFloat(interest_remaining);
						globalAmount[age_group] =
							(globalAmount[age_group] || 0) +
							parseFloat(principal_remaining) +
							parseFloat(interest_remaining);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderMaritalStatusCollected = () => {
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
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(loans, entry => {
					const { principal_paid, interest_paid, marital_status } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						let { name } = marital_status;
						name = name.replace('--Select--', 'Uncategorized');

						periodAmount[name] =
							(periodAmount[name] || 0) + parseFloat(principal_paid) + parseFloat(interest_paid);
						globalAmount[name] =
							(globalAmount[name] || 0) + parseFloat(principal_paid) + parseFloat(interest_paid);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderMaritalStatusRemaining = () => {
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
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(_.remove(_.concat([], loans), ({ status }) => _.includes([13, 14], status)), entry => {
					const { principal_remaining, interest_remaining, marital_status } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						let { name } = marital_status;
						name = name.replace('--Select--', 'Uncategorized');

						periodAmount[name] =
							(periodAmount[name] || 0) +
							parseFloat(principal_remaining) +
							parseFloat(interest_remaining);
						globalAmount[name] =
							(globalAmount[name] || 0) +
							parseFloat(principal_remaining) +
							parseFloat(interest_remaining);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderVoteCodeCollected = () => {
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
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(loans, entry => {
					const { principal_paid, interest_paid, vote_code } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						let { department } = vote_code;

						periodAmount[department] =
							(periodAmount[department] || 0) + parseFloat(principal_paid) + parseFloat(interest_paid);
						globalAmount[department] =
							(globalAmount[department] || 0) + parseFloat(principal_paid) + parseFloat(interest_paid);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	renderVoteCodeRemaining = () => {
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
			_.map(Configs.enumerateYears(startDate, endDate), date => moment(date).format('YYYY-MM-DD')),
			(period, index) => {
				let periodAmount = {};

				_.forEach(_.remove(_.concat([], loans), ({ status }) => _.includes([13, 14], status)), entry => {
					const { principal_remaining, interest_remaining, vote_code } = entry;

					if (
						entry[`${this.props.filter.type === 'disbursal' ? 'date_created' : 'maturity_date'}`]
							.startOf('year')
							.format('YYYY-MM-DD') === period
					) {
						let { department } = vote_code;

						periodAmount[department] =
							(periodAmount[department] || 0) +
							parseFloat(principal_remaining) +
							parseFloat(interest_remaining);
						globalAmount[department] =
							(globalAmount[department] || 0) +
							parseFloat(principal_remaining) +
							parseFloat(interest_remaining);
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
				xAxis={{
					key: 'period',
					label: 'Period',
					formatter: date => moment(date).format('YYYY')
				}}
			/>
		);
	};

	render = () => {
		const {
			renderCollected,
			renderRemaining,
			renderCollectedVsRemaining,
			renderProductsCollected,
			renderProductsRemaining,
			renderAgeGroupCollected,
			renderAgeGroupRemaining,
			renderMaritalStatusCollected,
			renderMaritalStatusRemaining,
			renderVoteCodeCollected,
			renderVoteCodeRemaining,
			props: { loans, showPieCharts, onShowPieChartsChange }
		} = this;

		return (
			<div>
				<div>
					<Tabs defaultActiveKey="1">
						<TabPane
							tab={`Collected - UGX ${Configs.abbreviateNumber(
								_.sum(
									_.map(
										loans,
										({ principal_paid, interest_paid }) =>
											parseFloat(principal_paid) + parseFloat(interest_paid)
									)
								),
								2
							)}`}
							key="1"
						>
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderCollected()}
						</TabPane>
						<TabPane
							tab={`Remaining - UGX ${Configs.abbreviateNumber(
								_.sum(
									_.map(
										_.remove(_.concat([], loans), ({ status }) => _.includes([13, 14], status)),
										({ principal_remaining, interest_remaining }) =>
											parseFloat(principal_remaining) + parseFloat(interest_remaining)
									)
								),
								2
							)}`}
							key="2"
						>
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderRemaining()}
						</TabPane>
						<TabPane tab={`Collected vs Remaining`} key="3">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderCollectedVsRemaining()}
						</TabPane>
						<TabPane tab={`Products (Collected)`} key="4">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderProductsCollected()}
						</TabPane>
						<TabPane tab={`Products (Remaining)`} key="5">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderProductsRemaining()}
						</TabPane>
						<TabPane tab={`Age Group (Collected)`} key="6">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderAgeGroupCollected()}
						</TabPane>
						<TabPane tab={`Age Group (Remaining)`} key="7">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderAgeGroupRemaining()}
						</TabPane>
						<TabPane tab={`Marital Status (Collected)`} key="8">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderMaritalStatusCollected()}
						</TabPane>
						<TabPane tab={`Marital Status (Remaining)`} key="9">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderMaritalStatusRemaining()}
						</TabPane>
						<TabPane tab={`Vote Codes (Collected)`} key="10">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderVoteCodeCollected()}
						</TabPane>
						<TabPane tab={`Vote Codes (Remaining)`} key="11">
							<div className="switch-container">
								<Switch
									size="small"
									checked={showPieCharts}
									onChange={() => onShowPieChartsChange(!showPieCharts)}
								/>
								<div className="switch-container-label">Show as a pie chart</div>
							</div>
							{renderVoteCodeRemaining()}
						</TabPane>
					</Tabs>
				</div>
			</div>
		);
	};
}

Collections.propTypes = {
	loans: PropTypes.object,
	filter: PropTypes.object
};

Collections.defaultProps = {
	data: {},
	filter: {
		type: '',
		date: [moment().startOf('year'), moment()]
	}
};

export default Collections;
