import { LOGIN, LOGIN_SUCCESSFUL, LOGIN_FAILED, LOGOUT } from '../actions/types';

const INITIAL_STATE = {
	loggingIn: false,
	details: {},
	validatingUserToken: false
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case LOGIN:
			return { ...state, loggingIn: true };

		case LOGIN_SUCCESSFUL:
			return { ...state, loggingIn: false, details: action.payload };

		case LOGIN_FAILED:
			return { ...state, loggingIn: false, details: {} };

		case LOGOUT:
			return { ...INITIAL_STATE };

		default:
			return state;
	}
};
