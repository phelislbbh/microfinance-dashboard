import axios from 'axios';
import qs from 'querystring';
import moment from 'moment';

import {
	CHANGE_CUSTOMERS_PROPERTY,
	FETCH_VOTE_CODES,
	FETCH_VOTE_CODES_SUCCESSFUL,
	FETCH_VOTE_CODES_FAILED,
	FETCH_CUSTOMERS,
	FETCH_CUSTOMERS_SUCCESSFUL,
	FETCH_CUSTOMERS_FAILED
} from './types';
import Configs from '../configs';

export const changeCustomersProperty = (property, value) => {
	return {
		type: CHANGE_CUSTOMERS_PROPERTY,
		payload: { property, value }
	};
};

export const fetchVoteCodes = (onSuccess: () => {}, onFailure: () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_VOTE_CODES });

		axios
			.post(`${Configs.API.baseURL}customers/vote-codes`, qs.stringify({}))
			.then(response => {
				dispatch({ type: FETCH_VOTE_CODES_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(() => {
				dispatch({ type: FETCH_VOTE_CODES_FAILED });

				onFailure();
			});
	};
};

export const fetchCustomers = (onSuccess: () => {}, onFailure: () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_CUSTOMERS });

		axios
			.post(`${Configs.API.baseURL}customers`, qs.stringify({}))
			.then(response => {
				dispatch({ type: FETCH_CUSTOMERS_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(error => {
				dispatch({ type: FETCH_CUSTOMERS_FAILED, payload: error.response ? true : false });

				onFailure();
			});
	};
};
