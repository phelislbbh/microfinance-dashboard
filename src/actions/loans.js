import axios from 'axios';
import qs from 'querystring';

import {
	CHANGE_LOANS_PROPERTY,
	FETCH_LOAN_PRODUCTS,
	FETCH_LOAN_PRODUCTS_SUCCESSFUL,
	FETCH_LOAN_PRODUCTS_FAILED,
	FETCH_LOAN_APPLICATIONS,
	FETCH_LOAN_APPLICATIONS_SUCCESSFUL,
	FETCH_LOAN_APPLICATIONS_FAILED,
	FETCH_LOANS,
	FETCH_LOANS_SUCCESSFUL,
	FETCH_LOANS_FAILED,
	FETCH_LOAN_SCHEDULE,
	FETCH_LOAN_SCHEDULE_SUCCESSFUL,
	FETCH_LOAN_SCHEDULE_FAILED
} from './types';
import Configs from '../configs';

export const changeLoansProperty = (property, value) => {
	return {
		type: CHANGE_LOANS_PROPERTY,
		payload: { property, value }
	};
};

export const fetchLoanProducts = (onSuccess = () => {}, onFailure = () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_LOAN_PRODUCTS });

		axios
			.post(`${Configs.API.baseURL}loans/products`, qs.stringify({}))
			.then(response => {
				dispatch({ type: FETCH_LOAN_PRODUCTS_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(() => {
				dispatch({ type: FETCH_LOAN_PRODUCTS_FAILED });

				onFailure();
			});
	};
};

export const fetchLoanApplications = (details = {}, onSuccess = () => {}, onFailure = () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_LOAN_APPLICATIONS });

		axios
			.post(`${Configs.API.baseURL}loans/applications`, qs.stringify({}))
			.then(response => {
				dispatch({ type: FETCH_LOAN_APPLICATIONS_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(() => {
				dispatch({ type: FETCH_LOAN_APPLICATIONS_FAILED });

				onFailure();
			});
	};
};

export const fetchLoans = (details = {}, onSuccess = () => {}, onFailure = () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_LOANS });

		axios
			.post(`${Configs.API.baseURL}loans`, qs.stringify({ ...details }))
			.then(response => {
				dispatch({ type: FETCH_LOANS_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(() => {
				dispatch({ type: FETCH_LOANS_FAILED });

				onFailure();
			});
	};
};

export const fetchLoanSchedule = (details = {}, onSuccess = () => {}, onFailure = () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_LOAN_SCHEDULE });

		axios
			.post(`${Configs.API.baseURL}loans/schedule`, qs.stringify({ ...details }))
			.then(response => {
				dispatch({ type: FETCH_LOAN_SCHEDULE_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(() => {
				dispatch({ type: FETCH_LOAN_SCHEDULE_FAILED });

				onFailure();
			});
	};
};
