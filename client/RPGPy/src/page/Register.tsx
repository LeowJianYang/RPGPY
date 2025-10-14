

import axios from "axios";
import { useState } from "react";
import "../css/Login.css";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Form, Input } from 'antd';
import { useToast } from "../components/Toast";
import { useTheme } from "../utils/themeManager";

interface RegisterPageProps {
    onToggleForm: (e: React.MouseEvent) => void;
}

export default function RegisterPage({ onToggleForm }: RegisterPageProps) {
    const [create] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const {notify} = useToast();
    const URL = import.meta.env.VITE_API_URL;
    const { theme } = useTheme();

    const handleCreateAccount = async (values: any) => {
        const { Regemail, Regusername, Regpassword } = values;
        setLoading(true);
        try {
            const res = await axios.post(`${URL}/auth/register`, {
                newusername: Regusername,
                newpassword: Regpassword,
                newemail: Regemail
            });

            if (res.data.success) {
                notify('success','Account Created',"Account created successfully! Please log in.", "topRight");
                // switch back to the login form
                onToggleForm(new MouseEvent('click') as any); 
            } else {
                notify('error','Registration Failed', "Something went wrong: " + res.data.message, "topRight");
            }
        } catch (err: any) {
            console.error("Registration failed:", err);
            if (axios.isAxiosError(err) && err.response) {
                notify('error','Registration Failed', "Registration failed: " + err.response.data.message, "topRight");
            
            } else {
                notify('error','Registration Failed', "An unexpected error occurred during registration.", "topRight");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className="auth-title">Create an Account</h1>
            <p className="auth-subtitle">Join us to start your adventure!</p>
                <ConfigProvider
                    theme={{
                                
                        token:{
                            colorText: theme === 'system' || theme === 'dark' ? '#f1f5f9' : '#000000',
                            colorTextPlaceholder: theme === 'system' || theme === 'dark' ? '#ffffff' : '#6b7280',
                        },
                        components: {
                        Form: {
                            labelColor: theme === 'system' || theme === 'dark' ? '#f1f5f9' : '#000000'
                        },
                        Input:{
                            activeBg: theme === 'system' || theme === 'dark' ? '#1e293b' : '#ffffff',
                            
                        }
                    },

                    
                    }}
                >
                    <Form
                        form={create}
                        name="CreateAccount"
                        onFinish={handleCreateAccount}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            name="Regemail"
                            label="Email Address"
                            rules={[{ required: true, message: "Please enter your Email!", type: "email" }]}
                            className="auth-form-item"
                        >
                            <Input prefix={<MailOutlined />} placeholder="your.email@example.com" size="large" style={{ backgroundColor: theme === 'system' || theme === 'dark' ? '#EA8C55' : '#ffffff' }}/>
                        </Form.Item>

                        <Form.Item
                            name="Regusername"
                            label="Username"
                            rules={[{ required: true, message: "Please choose a username!" }]}
                            className="auth-form-item"
                        >
                            <Input prefix={<UserOutlined />} placeholder="Your unique username" size="large" style={{ backgroundColor: theme === 'system' || theme === 'dark' ? '#EA8C55' : '#ffffff' }} />
                        </Form.Item>

                        <Form.Item
                            name="Regpassword"
                            label="Password"
                            rules={[{ required: true, message: "Please enter your password!" }]}
                            className="auth-form-item"
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Create a strong password" size="large" style={{ backgroundColor: theme === 'system' || theme === 'dark' ? '#EA8C55' : '#ffffff' }}/>
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            label="Confirm Password"
                            dependencies={["Regpassword"]}
                            hasFeedback
                            rules={[
                                { required: true, message: "Please confirm your password!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("Regpassword") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("The two passwords do not match!"));
                                    },
                                }),
                            ]}
                            className="auth-form-item"
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" size="large" style={{ backgroundColor: theme === 'system' || theme === 'dark' ? '#EA8C55' : '#ffffff' }} />
                        </Form.Item>

                        <Form.Item>
                            <Button block type="primary" htmlType="submit" className="auth-button" loading={loading}>
                                Create Account
                            </Button>
                        </Form.Item>
                    </Form>
            </ConfigProvider>
            <p className="auth-switch-text">
                Already have an account? <a href="" onClick={onToggleForm}>Log In</a>
            </p>
        </>
    );
}