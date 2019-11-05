const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');

module.exports = function override(config, env) {
	config = injectBabelPlugin(
		['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }], // change importing css to less
		config
	);
	config = rewireLess.withLoaderOptions({
		modifyVars: {
			'@primary-color': '#683467',
			'@link-color': '#1890ff',
			'@font-size-base': '13px',
			'@border-radius-base': '4px',
			'@box-shadow-base': '0 1px 4px rgba(0, 0, 0, .15)',
			'@primary-1': 'rgba(104, 52, 103, 0.15)',
			'@table-row-hover-bg': 'rgba(104, 52, 103, 0.05)'
		},
		javascriptEnabled: true
	})(config, env);
	return config;
};
