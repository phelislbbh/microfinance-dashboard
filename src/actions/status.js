import axios from 'axios';
import qs from 'querystring';
import moment from 'moment';

import { FETCH_STATUSES, FETCH_STATUSES_SUCCESSFUL, FETCH_STATUSES_FAILED } from './types';
import Configs from '../configs';

export const fetchStatuses = (onSuccess: () => {}, onFailure: () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_STATUSES });

		axios
			.post(`${Configs.API.baseURL}statuses`, qs.stringify({}))
			.then(response => {
				dispatch({ type: FETCH_STATUSES_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(error => {
				dispatch({ type: FETCH_STATUSES_FAILED });
			});
	};
};
