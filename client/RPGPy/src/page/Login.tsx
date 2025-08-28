


import {useLoginCheck} from "../../components/LoginStore";
import { useEffect, useState } from "react";
import "../css/Login.css";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Flex } from 'antd';
import RegisterPage from "./Register";
import axios from "axios";
import {useUserStore} from "../../components/UserStore";



export default function LoginPage(){
   
    const [loginform] = Form.useForm<{username:string, password:string}>();
    const {isLogin, setIsLogin} = useLoginCheck();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const {setUser} = useUserStore();




    useEffect(()=>{
        setLoading(true);
        axios.get("http://localhost:3000/authCookie", {withCredentials:true}).then((res)=>{
            setUser(res.data.user);
            setIsLogin(true);
            console.log(res.data.user);
            setLoading(false);
            window.location.href = "/dashboard";
        })
        .catch((err)=>{
            console.log(err);
            setLoading(false);
        })

        if(isLogin){
            window.location.href = "/dashboard";
        }
    },[isLogin])


   
    const handleLogin = async (values:any)=>{
        const {username, password, remember} = values;

                setLoading(true);
                try{

                    const res= await axios.post("http://localhost:3000/auth/login", {
                        username: username,
                        password: password,
                        remember: remember,
                    },{
                        withCredentials: true,
                    });

                    if(res.data.success){
                        alert("Successfull login"); 
                        setIsLogin(true);
                    }

                    setLoading(false);
                   
                }
                
                catch(err:any){ 
                    console.log(err.message);
                    if(axios.isAxiosError(err)){
                        if(err.response?.status ===401){
                         
                            alert("Invalid Username or Password !");
                        } else{
                            alert("Something went wrong !"+ err.response?.status);
                        }
                    }else{
                        alert("Something went wrong !" + err);
                    }
                    setLoading(false);
                }
            
        }


        if(isLogin=== false ){
            return (
                <div className="outer">
                    <div className="LoginContainer">
                        <div className="LoginInner">
                        {!isSignUp? ( 
                        //========================LOGIN FORM HERE !!!=============================
                            <Form
                            form={loginform}
                            name="Login"
                            initialValues={{remember:true}}
                            style={{maxWidth:360}}
                            autoComplete="off"
                            onFinish={handleLogin}
                            >
                                <div>
                                    <p className="LoginTitle">Welcome Back !</p>
                                </div>
                                <Form.Item
                                name="username"
                                rules={[{required: true, message:"Please enter your username !"}]}
                                 >
                                    <Input prefix={<UserOutlined/>} placeholder="Username">
                                    </Input>
                                </Form.Item>

                                <Form.Item
                                name="password"
                                rules={[{required: true, message:"Please enter your password !"}]}
                                 >
                                    <Input.Password prefix={<LockOutlined/>} placeholder="Password">
                                    </Input.Password>
                                </Form.Item>

                                <Flex justify="space-between" align="center">
                                  <Form.Item>
                                    
                                    <Form.Item name="remember" valuePropName="checked">
                                        <Checkbox style={{color:"#ffffff"}}>Remember me</Checkbox>
                                    </Form.Item>

                                    <a href="">Forgot Password</a>

                                    <p style={{color:"#ffffff", fontSize:"13px"}}>Don't have an Account? <a href="" onClick={(e)=>{e.preventDefault(), setIsSignUp(true)}}>Sign Up</a></p>

                                </Form.Item>  

                 
                                </Flex>

                                <Form.Item >
                                    <div className="ItemBlw">
                                        
                                        <Button block type="primary" htmlType="submit" className="LoginBtn">
                                            Login
                                        </Button>
                                         <p className="LoginCont">or Login With </p>

                                        <a href="" className="GoogleA">Google</a>
                                    </div>
                                   
            
                                   
                                </Form.Item>
                            </Form>
                        ):(
                    // ========================SIGN UP FORM HERE!!!=====================================
                            <RegisterPage/>
                    )}

                        </div>
                    </div>

                    {loading &&(
                        <div className="overlay">
                            <div className="loading-container">
                                <div className="spinner"></div>                            
                                <p style={{fontSize:"clamp(0.625rem,4vh,1.25rem)", color:"#ffffff", textAlign:"center"}}>Loading...</p>
                            </div>
                        </div>
                    )}
                </div>
            
            )
        }




}