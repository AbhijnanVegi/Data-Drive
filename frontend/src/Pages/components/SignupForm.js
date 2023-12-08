import React from 'react';
import { Form, Input, Button } from 'antd';

/**
 * SignupForm component.
 * 
 * @param {Object} props - The component props.
 * @param {Function} props.handleSignupSubmit - The function to handle signup form submission.
 * @param {Function} props.validatePassword - The function to validate the password.
 * @returns {JSX.Element} The SignupForm component.
 */
export const SignupForm = ({ handleSignupSubmit, validatePassword }) => (
  <Form name="signup-form" onFinish={handleSignupSubmit}>
    <Form.Item
      name="username"
      rules={[{ required: true, message: 'Please enter your name!' }]}
    >
      <Input placeholder="Name" />
    </Form.Item>
    <Form.Item
      name="Signemail"
      rules={[
        { required: true, message: 'Please enter your email!' },
        { type: 'email', message: 'Please enter a valid email address!' },
      ]}
    >
      <Input placeholder="Email" />
    </Form.Item>
    <Form.Item
      name="signupPassword"
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
    <Form.Item
      name="signupConfirmPassword"
      dependencies={['signupPassword']}
      rules={[
        { required: true, message: 'Please confirm your password!' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('signupPassword') === value) {
              return Promise.resolve();
            }
            return Promise.reject('Passwords do not match!');
          },
        }),
      ]}
    >
      <Input.Password placeholder="Confirm Password" />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit">
        Signup
      </Button>
    </Form.Item>
  </Form>
);