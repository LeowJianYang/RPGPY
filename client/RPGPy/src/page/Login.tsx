


import { useLoginCheck } from "../../components/LoginStore";
import { useEffect, useState } from "react";
import "../css/Login.css";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from 'antd';
import RegisterPage from "./Register";
import axios from "axios";
import { useUserStore } from "../../components/UserStore";
import { useToast } from "../components/Toast";
import { ConfigProvider } from 'antd';
import { useTheme } from "../utils/themeManager";
const loginIllustration = "/rpgpy-trans.png"; 






export default function LoginPage() {
    const [loginform] = Form.useForm<{ email: string, password: string }>();
    const { isLogin, setIsLogin } = useLoginCheck();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { setUser } = useUserStore();
    const URL = import.meta.env.VITE_API_URL;
    const {notify} = useToast();
    const { theme } = useTheme();


    useEffect(() => {
        axios.get(`${URL}/authCookie`, { withCredentials: true }).then((res) => {
            setUser({
                user: res.data.Username,
                email: res.data.Email,
                uid: res.data.UID
            });
            setIsLogin(true);
            window.location.href = "/dashboard";
        }).catch((err) => {
            console.log("Not logged in:", err);
        });
    }, []);

    useEffect(() => {
        if (isLogin) {
            window.location.href = "/dashboard";
        }
    }, [isLogin]);

    const handleLogin = async (values: any) => {
        const { email, password, remember } = values;
        setLoading(true);
        try {
            const res = await axios.post(`${URL}/auth/login`, {
                email,
                password,
                remember,
            }, {
                withCredentials: true,
            });

            if (res.data.success) {
                setIsLogin(true);
            }
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    notify("error", "Login Failed", "Invalid email or password", "top");
                } else {
                    notify("error", "Login Failed", "Something went wrong! Status: " + err.response?.status, "top");
                }
            } else {
                notify("error", "Login Failed", "An unexpected error occurred: " + err, "top");
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleForm = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsSignUp(!isSignUp);
    };

    if (isLogin) {
        return null; 
    }

    return (
        <div className="auth-outer-container">
            <div className="auth-card">
                <div className="auth-illustration-container">
                    <img src={loginIllustration} alt="Login Illustration" />
                    <h2>Adventure Awaits</h2>
                    <p>Join our community and start your journey.</p>
                </div>
                <div className="auth-form-container">
                    {!isSignUp ? (
                        <>
                            <h1 className="auth-title">Welcome Back!</h1>
                            <p className="auth-subtitle">Please enter your details to log in.</p>
                            
                            <ConfigProvider
                                theme={{
                                
                                        token:{
                                            colorText: theme === 'system' || theme === 'dark' ? '#f1f5f9' : '#000000',
                                            colorTextPlaceholder: theme === 'system' || theme === 'dark' ? '#000000' : '#6b7280',
                                        },
                                        components: {
                                        Form: {
                                            labelColor: theme === 'system' || theme === 'dark' ? '#f1f5f9' : '#000000'

                                        },

                                        Input:{
                                            activeBg: theme === 'system' || theme === 'dark' ? '#EA8C55' : '#ffffff',
                                        }
                                    },

                                 
                                }}
                                >
                            
                            
                                <Form
                                    form={loginform}
                                    name="Login"
                                    initialValues={{ remember: true }}
                                    onFinish={handleLogin}
                                    layout="vertical"
                                >
                                    <Form.Item
                                        name="email"
                                        label="Email Address"
                                        rules={[{ required: true, message: "Please enter your email!", type: "email" }]}
                                        className="auth-form-item"
                                        style={{ color: 'white' }}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="your.email@example.com" size="large" style={{ backgroundColor: theme === 'dark' || theme==='system' ? '#EA8C55' : '#ffffff' }} />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        label="Password"
                                        rules={[{ required: true, message: "Please enter your password!" }]}
                                        className="auth-form-item"
                                        
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Your password" size="large" style={{ backgroundColor: theme === 'dark' || theme==='system' ? '#EA8C55' : '#ffffff' }}/>
                                    </Form.Item>

                                    <div className="auth-link-group">
                                        <Form.Item name="remember" valuePropName="checked" noStyle>
                                            <Checkbox>Remember me</Checkbox>
                                        </Form.Item>
                                        <a href="#">Forgot Password?</a>
                                    </div>

                                    <Form.Item>
                                        <Button block type="primary" htmlType="submit" className="auth-button" loading={loading}>
                                            Login
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </ConfigProvider>
                            <p className="auth-switch-text">
                                Don't have an account? <a href="" onClick={toggleForm}>Sign Up</a>
                            </p>
                        </>
                    ) : (
                        <RegisterPage onToggleForm={toggleForm} />
                    )}
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading...</p>
                </div>
            )}
        </div>
    );
}