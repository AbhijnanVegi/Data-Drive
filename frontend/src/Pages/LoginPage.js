import React, { useState } from 'react';
import { Tabs, Input, Button, Form, ConfigProvider } from 'antd';
import '../css/LoginPage.css'
import axios from 'axios';

const { TabPane } = Tabs;

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState('login');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };


    const handleLoginSubmit = async (values) => {
        console.log(values);
        // disable axios status validation
        axios.defaults.validateStatus = () => true;
        axios.post('http://localhost:5000/auth/login', values)
            .then((response) => {
                console.log("response")
                console.log(response)
                if(response.status === 200)
                    window.location.href = '/dashboard';
                else
                    alert(response.data.message)
            })
            .catch((error) => {
                alert("ERROR!")
            });
    };

    const handleSignupSubmit = async (values) => {
        axios.defaults.validateStatus = () => true;
        const request = {
            username: values.username,
            email: values.Signemail,
            password: values.signupPassword,
        }
        axios.post('http://localhost:5000/auth/register', request)
            .then((response) => {
                console.log("response")
                console.log(response)
            })
            .catch((error) => {
                console.log("error");
                console.log(error)
            });
    };



    const validatePassword = (password) => {
        const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&!])[A-Za-z\d@#$%^&!]{8,}$/;
        return passwordPattern.test(password);
    };
    return (
        <ConfigProvider
            theme={{
                token: {
                    // Seed Token
                    colorPrimary: '#2c2c2e',
                    borderRadius: 6,
                    fontFamily: 'Quicksand, sans-serif',
                    // Alias Token
                },
            }}
        >
            <div className='login-container'>
                {/* create text at top of login box */}
                <div className='login-text'>
                    <h1>Welcome to Data Drive!</h1>
                    <p>Sign in or create an account to get started.</p>
                </div>
                <div className='login-box'>
                    <Tabs activeKey={activeTab} onChange={handleTabChange}>
                        <TabPane tab="Login" key="login">
                            <Form name="login-form" onFinish={handleLoginSubmit}>
                                <Form.Item
                                    name="email"
                                    rules={[{ required: true, message: 'Please enter your email!' },
                                    { type: 'email', message: 'Please enter a valid email address!' },
                                    ]}
                                >
                                    <Input placeholder="Email" />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'Please enter your password!' },
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
                        </TabPane>
                        <TabPane tab="Signup" key="signup">
                            <Form name="signup-form" onFinish={handleSignupSubmit}>
                                <Form.Item
                                    name="username"
                                    rules={[{ required: true, message: 'Please enter your name!' }]}
                                >
                                    <Input placeholder="Name" />
                                </Form.Item>
                                <Form.Item
                                    name="Signemail"
                                    rules={[{ required: true, message: 'Please enter your email!' },
                                    { type: 'email', message: 'Please enter a valid email address!' },
                                    ]}
                                >
                                    <Input placeholder="Email" />
                                </Form.Item>
                                <Form.Item
                                    name="signupPassword"
                                    rules={[{ required: true, message: 'Please enter your password!' },
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
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;