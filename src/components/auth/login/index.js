import React, { Component } from 'react';
import { Form, Icon, Input, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import './style.css';

import { logout, login } from '../../../actions';
import Configs from '../../../configs';

const FormItem = Form.Item;

class Login extends Component {
	onSubmit = () => {
		const { form: { setFieldsValue, getFieldValue } } = this.props;

		const username = getFieldValue(`username`);
		const password = getFieldValue(`password`);

		this.props.login(
			{ username, password },
			() => {
				message.success(`Welcome back, ${this.props.user.details.name}!`, 3, () => {
					this.props.history.push('/dashboard');
				});
			},
			error => {
				setFieldsValue({ password: '' });

				message.error(error, 5, () => {});
			}
		);
	};

	onChangeText = (field, value) => {
		this.setState({ ...this.state, error: '', [field]: value });
	};

	componentDidMount = () => {
		document.title = Configs.getDocumentTitle('Login');

		this.props.logout();
	};

	render = () => {
		const { form: { setFieldsValue, getFieldValue }, user: { loggingIn } } = this.props;
		const { getFieldDecorator } = this.props.form;

		const username = getFieldValue(`username`);
		const password = getFieldValue(`password`);

		return (
			<div>
				<div className="auth-form-container">
					<Link to="/">
						<img className="logo-icon" alt="Logo" src={Configs.logos.icon} />
					</Link>
					<Form
						onSubmit={event => {
							event.preventDefault();

							this.onSubmit();
						}}
						className="login-form"
					>
						<FormItem label="Username" colon={false}>
							{getFieldDecorator('username', {
								rules: [
									{
										required: true,
										whitespace: true,
										message: 'Username is required'
									}
								]
							})(
								<Input
									prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
									placeholder="Username"
									onChange={({ target: { value } }) => this.onChangeText('username', value)}
								/>
							)}
						</FormItem>
						<FormItem label="Password" colon={false}>
							{getFieldDecorator('password', {
								rules: [
									{
										required: true,
										whitespace: true,
										message: 'Password is required'
									}
								]
							})(
								<Input
									prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
									type="password"
									placeholder="Password"
									onChange={({ target: { value } }) => this.onChangeText('password', value)}
								/>
							)}
						</FormItem>
						<FormItem>
							<Button loading={loggingIn} block type="primary" htmlType="submit" disabled={username && password ? false : true}>
								Log in
							</Button>
						</FormItem>
					</Form>
				</div>
			</div>
		);
	};
}

const mapStateToProps = ({ user }) => {
	return { user };
};

export default connect(mapStateToProps, { logout, login })(Form.create()(Login));
