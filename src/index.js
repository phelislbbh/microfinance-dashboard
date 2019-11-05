import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { BrowserRouter } from 'react-router-dom';

import App from './app';
import serviceWorker from './service-worker';
import { stateRehydrated } from './actions';
import rootReducer from './reducers';

const store = createStore(rootReducer, {}, compose(applyMiddleware(thunk), autoRehydrate()));

persistStore(store, { blacklist: ['state'] }, () => {
	store.dispatch(stateRehydrated());
});

ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</Provider>,
	document.getElementById('root')
);

serviceWorker();
