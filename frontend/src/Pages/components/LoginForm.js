import React from 'react';
import { Form, Input, Button } from 'antd';

/**
 * Renders a login form component.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.handleLoginSubmit - The function to handle login form submission.
 * @param {Function} props.validatePassword - The function to validate the password.
 * @returns {JSX.Element} The rendered login form.
 */
export const LoginForm = ({ handleLoginSubmit, validatePassword }) => (
  <Form name="login-form" onFinish={handleLoginSubmit}>
    <Form.Item
      name="username"
      rules={[{ required: true, message: 'Please enter your username!' }]}
    >
      <Input placeholder="Username" />
    </Form.Item>
    <Form.Item
      name="password"
      rules={[
        { required: true, message: 'Please enter your password!' },
        {
          validator: (_, value) => {
            if (validatePassword(value)) {
              return Promise.resolve();
            }
            return Promise.reject(
              'Password must be at least 8 characters long with one uppercase letter, one lowercase letter, and one symbol.'
            );
          },
        },
      ]}
    >
      <Input.Password placeholder="Password" />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit">
        Login
      </Button>
    </Form.Item>
  </Form>
);