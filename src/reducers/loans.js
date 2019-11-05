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
} from '../actions/types';

const INITIAL_STATE = {
	fetchingLoanProducts: false,
	products: [],
	fetchingApplications: false,
	applications: [],
	fetchingLoans: false,
	loans: [],
	fetchingLoansSchedule: false,
	schedule: [],
	perPage: 10
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case CHANGE_LOANS_PROPERTY:
			return { ...state, [action.payload.property]: action.payload.value };

		case FETCH_LOAN_PRODUCTS:
			return { ...state, fetchingLoanProducts: true };

		case FETCH_LOAN_PRODUCTS_SUCCESSFUL:
			return { ...state, fetchingLoanProducts: false, products: action.payload };

		case FETCH_LOAN_PRODUCTS_FAILED:
			return { ...state, fetchingLoanProducts: false };

		case FETCH_LOAN_APPLICATIONS:
			return { ...state, fetchingApplications: true };

		case FETCH_LOAN_APPLICATIONS_SUCCESSFUL:
			return { ...state, fetchingApplications: false, applications: action.payload };

		case FETCH_LOAN_APPLICATIONS_FAILED:
			return { ...state, fetchingApplications: false };

		case FETCH_LOANS:
			return { ...state, fetchingLoans: true };

		case FETCH_LOANS_SUCCESSFUL:
			return { ...state, fetchingLoans: false, loans: action.payload };

		case FETCH_LOANS_FAILED:
			return { ...state, fetchingLoans: false };

		case FETCH_LOAN_SCHEDULE:
			return { ...state, fetchingLoansSchedule: true };

		case FETCH_LOAN_SCHEDULE_SUCCESSFUL:
			return { ...state, fetchingLoansSchedule: false, schedule: action.payload };

		case FETCH_LOAN_SCHEDULE_FAILED:
			return { ...state, fetchingLoansSchedule: false };

		default:
			return state;
	}
};
