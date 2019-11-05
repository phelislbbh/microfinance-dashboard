import { combineReducers } from 'redux';

import state from './state';
import screen from './screen';
import status from './status';
import user from './user';
import users from './users';
import customers from './customers';
import loans from './loans';

export default combineReducers({
	state,
	screen,
	status,
	user,
	users,
	customers,
	loans
});
