import React, { useState, useCallback } from 'react';
import { Tabs, ConfigProvider } from 'antd';
import './css/LoginPage.css'
import axios from 'axios';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.
import { particlesConfig } from './particlesConfig';
import { LoginForm } from '../components/LoginForm';
import { SignupForm } from '../components/SignupForm';


const { TabPane } = Tabs;

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState('login');

    const particlesInit = useCallback(async engine => {
        console.log(engine);
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
        axios.defaults.validateStatus = () => true;

        let formData = new FormData();

        for (let key in values) {
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
                    colorPrimary: '#2c2c2e',
                    borderRadius: 6,
                    fontFamily: 'Quicksand, sans-serif',
                },
            }}
        >
            <Particles
                id="tsparticles"
                className="particles-canvas"
                init={particlesInit}
                loaded={particlesLoaded}
                options={particlesConfig}
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
                            <LoginForm handleLoginSubmit={handleLoginSubmit} validatePassword={validatePassword} />
                        </TabPane>
                        <TabPane tab="Signup" key="signup">
                            <SignupForm handleSignupSubmit={handleSignupSubmit} validatePassword={validatePassword} />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;