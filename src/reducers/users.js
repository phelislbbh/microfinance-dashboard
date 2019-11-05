import {
	CHANGE_USERS_PROPERTY,
	FETCH_USER_ROLES,
	FETCH_USER_ROLES_SUCCESSFUL,
	FETCH_USER_ROLES_FAILED,
	FETCH_USERS,
	FETCH_USERS_SUCCESSFUL,
	FETCH_USERS_FAILED
} from '../actions/types';

const INITIAL_STATE = {
	fetchingRoles: false,
	roles: [],
	fetchingUsers: false,
	users: [],
	perPage: 10
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case CHANGE_USERS_PROPERTY:
			return { ...state, [action.payload.property]: action.payload.value };

		case FETCH_USER_ROLES:
			return { ...state, fetchingRoles: true };

		case FETCH_USER_ROLES_SUCCESSFUL:
			return { ...state, fetchingRoles: false, roles: action.payload };

		case FETCH_USER_ROLES_FAILED:
			return { ...state, fetchingRoles: false };

		case FETCH_USERS:
			return { ...state, fetchingUsers: true, page: action.payload };

		case FETCH_USERS_SUCCESSFUL:
			return { ...state, fetchingUsers: false, users: action.payload };

		case FETCH_USER_ROLES_FAILED:
			return { ...state, fetchingUsers: false };

		default:
			return state;
	}
};
