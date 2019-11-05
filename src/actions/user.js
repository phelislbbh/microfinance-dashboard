import axios from 'axios';
import qs from 'querystring';
import moment from 'moment';

import { STATE_REHYDRATED, LOGIN, LOGIN_SUCCESSFUL, LOGIN_FAILED, LOGOUT } from './types';
import Configs from '../configs';

export const stateRehydrated = () => {
	return {
		type: STATE_REHYDRATED
	};
};

export const logout = () => {
	return {
		type: LOGOUT
	};
};

export const login = (details = {}, onSuccess: () => {}, onFailure: () => {}) => {
	return dispatch => {
		dispatch({ type: LOGIN });

		const { username, password } = details;

		axios
			.post(`${Configs.API.baseURL}user/login`, qs.stringify({ username, password }))
			.then(response => {
				dispatch({ type: LOGIN_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(error => {
				dispatch({ type: LOGIN_FAILED });

				onFailure(`Oops! We couldn't log you in. Try again.`);
			});
	};
};
