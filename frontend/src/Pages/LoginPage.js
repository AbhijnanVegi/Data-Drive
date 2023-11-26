import React, { useState, useCallback } from 'react';
import { Tabs, Input, Button, Form, ConfigProvider } from 'antd';
import '../css/LoginPage.css'
import axios from 'axios';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.

const { TabPane } = Tabs;

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState('login');

    const particlesInit = useCallback(async engine => {
        console.log(engine);
        // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        //await loadFull(engine);
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async container => {
        await console.log(container);
    }, []);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };


    const handleLoginSubmit = async (values) => {
        console.log(values);
        // disable axios status validation
        axios.defaults.validateStatus = () => true;

        let formData = new FormData();

        for (let key in values){
            formData.append(key, values[key]);
        }
        axios('http://localhost:8000/auth/login', { 
            method: "post", 
            withCredentials: true, 
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            } 
        })
            .then((response) => {
                console.log("response")
                console.log(response.data.access_token)
                localStorage.setItem('token', response.data.access_token);
                if (response.status === 200) {
                    window.location.href = '/home';
                }
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
            "data": {
                "username": values.username,
                "email": values.Signemail,
                "password": values.signupPassword
            }
        }
        axios('http://localhost:8000/auth/register', { method: "post", withCredentials: true, data: request })
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
            <Particles
                id="tsparticles"
                className="particles-canvas"
                init={particlesInit}
                loaded={particlesLoaded}
                options={{
                    background: {
                        color: {
                            value: "#ffffff",
                        },
                    },
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onClick: {
                                enable: true,
                                mode: "push",
                            },
                            onHover: {
                                enable: true,
                                mode: "repulse",
                            },
                            resize: true,
                        },
                        modes: {
                            push: {
                                quantity: 4,
                            },
                            repulse: {
                                distance: 200,
                                duration: 0.4,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: "#000000",
                        },
                        links: {
                            color: "#000000",
                            distance: 150,
                            enable: true,
                            opacity: 0.5,
                            width: 1,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "bounce",
                            },
                            random: false,
                            speed: 6,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800,
                            },
                            value: 80,
                        },
                        opacity: {
                            value: 0.5,
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 5 },
                        },
                    },
                    detectRetina: true,
                }}
            />
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
                                    name="username"
                                    rules={[{ required: true, message: 'Please enter your username!' }]}
                                >
                                    <Input placeholder="Username" />
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