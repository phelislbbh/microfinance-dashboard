import { FETCH_STATUSES, FETCH_STATUSES_SUCCESSFUL, FETCH_STATUSES_FAILED } from '../actions/types';

const INITIAL_STATE = {
	fetchingStatuses: false,
	statuses: []
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case FETCH_STATUSES:
			return { ...state, fetchingStatuses: true };

		case FETCH_STATUSES_SUCCESSFUL:
			return { ...state, fetchingStatuses: false, statuses: action.payload };

		case FETCH_STATUSES_FAILED:
			return { ...state, fetchingStatuses: false };

		default:
			return state;
	}
};
