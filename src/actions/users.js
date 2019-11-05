import axios from 'axios';
import qs from 'querystring';
import moment from 'moment';

import {
	CHANGE_USERS_PROPERTY,
	FETCH_USER_ROLES,
	FETCH_USER_ROLES_SUCCESSFUL,
	FETCH_USER_ROLES_FAILED,
	FETCH_USERS,
	FETCH_USERS_SUCCESSFUL,
	FETCH_USERS_FAILED
} from './types';
import Configs from '../configs';

export const changeUsersProperty = (property, value) => {
	return {
		type: CHANGE_USERS_PROPERTY,
		payload: { property, value }
	};
};

export const fetchRoles = (onSuccess: () => {}, onFailure: () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_USER_ROLES });

		axios
			.post(`${Configs.API.baseURL}users/roles`, qs.stringify({}))
			.then(response => {
				dispatch({ type: FETCH_USER_ROLES_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(() => {
				dispatch({ type: FETCH_USER_ROLES_FAILED });

				onFailure();
			});
	};
};

export const fetchUsers = (onSuccess: () => {}, onFailure: () => {}) => {
	return dispatch => {
		dispatch({ type: FETCH_USERS });

		axios
			.post(`${Configs.API.baseURL}users`, qs.stringify({}))
			.then(response => {
				dispatch({ type: FETCH_USERS_SUCCESSFUL, payload: response.data.data });

				onSuccess();
			})
			.catch(error => {
				dispatch({ type: FETCH_USERS_FAILED, payload: error.response ? true : false });

				onFailure();
			});
	};
};
