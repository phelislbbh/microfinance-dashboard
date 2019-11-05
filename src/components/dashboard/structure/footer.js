import React, { PureComponent } from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

class DashboardFooter extends PureComponent {
	render = () => {
		return <Footer style={{ textAlign: 'center' }}>{`Copyright ${new Date().getFullYear()}. All Rights Reserved.`}</Footer>;
	};
}

export default DashboardFooter;
