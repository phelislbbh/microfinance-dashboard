import {
	CHANGE_CUSTOMERS_PROPERTY,
	FETCH_VOTE_CODES,
	FETCH_VOTE_CODES_SUCCESSFUL,
	FETCH_VOTE_CODES_FAILED,
	FETCH_CUSTOMERS,
	FETCH_CUSTOMERS_SUCCESSFUL,
	FETCH_CUSTOMERS_FAILED
} from '../actions/types';

const INITIAL_STATE = {
	fetchingVoteCodes: false,
	voteCodes: [],
	fetchingCustomers: false,
	customers: [],
	perPage: 10
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case CHANGE_CUSTOMERS_PROPERTY:
			return { ...state, [action.payload.property]: action.payload.value };

		case FETCH_VOTE_CODES:
			return { ...state, fetchingVoteCodes: true };

		case FETCH_VOTE_CODES_SUCCESSFUL:
			return { ...state, fetchingVoteCodes: false, voteCodes: action.payload };

		case FETCH_VOTE_CODES_FAILED:
			return { ...state, fetchingVoteCodes: false };

		case FETCH_CUSTOMERS:
			return { ...state, fetchingCustomers: true };

		case FETCH_CUSTOMERS_SUCCESSFUL:
			return { ...state, fetchingCustomers: false, customers: action.payload };

		case FETCH_VOTE_CODES_FAILED:
			return { ...state, fetchingCustomers: false };

		default:
			return state;
	}
};
