import { CHANGE_ACTIVE_SCREEN } from './types';

export const changeActiveScreen = screen => {
	return {
		type: CHANGE_ACTIVE_SCREEN,
		payload: screen
	};
};
