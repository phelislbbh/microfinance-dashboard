import { CHANGE_ACTIVE_SCREEN } from '../actions/types';

const INITIAL_STATE = {
	screen: ''
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case CHANGE_ACTIVE_SCREEN:
			return { screen: action.payload };

		default:
			return state;
	}
};
