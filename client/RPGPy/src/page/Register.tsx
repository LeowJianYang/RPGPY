

import axios from "axios";
import {useLoginCheck} from "../../components/LoginStore";
import { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import "../css/Login.css";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import { Button, Form, Input } from 'antd';


export default function RegisterPage(){

    const [create] = Form.useForm<{Regusername:string, Regpassword:string}>();
    const {isLogin, setIsLogin} = useLoginCheck();
    const [loading, setLoading] = useState(false);
    // const [isSignUp, setIsSignUp] = useState(false);




      const navigate = useNavigate();

        useEffect(()=>{
            if(isLogin){
                navigate("/dashboard",{replace:true});
            }
        },[navigate])


        const handleCreateAccount = async (values:any)=>{
        console.log(values);
        const {Regusername, Regpassword} = values;
        console.log(Regusername, Regpassword);
        setLoading(true);
        try{
            const res = await axios.post('http://localhost:3000/auth/register',{
                newusername: Regusername,
                newpassword: Regpassword,
            })
            
            const {message}= res.data;

            if( res.data.success){
                alert(`Account created successfully ! FROM SERVER: ${message}`);
                 setIsLogin(true);
                 setLoading(false)
            } else{
                alert("Something went wrong ! FROM SERVER: "+ message);
                setLoading(false);
            }

        } catch (err:any){
            console.log(err.message);
        }
    }






    return(
        <div>

      
                    <Form
                        form={create}
                        name="CreateAccount"
                        style={{maxWidth:360}}
                        autoComplete="off"
                        onFinish={handleCreateAccount}
                        >
                            <div>
                                <p className="LoginTitle">Create Account</p>
                            </div>
                        <Form.Item
                        name="Regusername"
                        rules={[{required: true, message:"Please enter your username !"}]}
                        >
                            <Input prefix={<UserOutlined/>} placeholder="Username"></Input>
                        </Form.Item>

                        <Form.Item
                        name="Regpassword"
                        rules={[{required: true, message:"Please enter your password !"}]}
                        >
                            <Input.Password prefix={<LockOutlined/>} placeholder="Password"></Input.Password>
                        </Form.Item>

                            <Form.Item
                            name="confirm"
                            dependencies={["Regpassword"]}
                            hasFeedback  // Small Icons show X or tick
                            rules={[{required:true, message:"Please confirm your password !"},({getFieldValue})=>({
                                validator(_,value){ // Validate the Two Password Details must be same 
                                    if(!value || getFieldValue("Regpassword")===value){
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("The two passwords that you entered do not match !"));
                                }
                            })]}>

                                <Input.Password prefix={<LockOutlined/>} placeholder="Confirm Password"></Input.Password>

                            </Form.Item>

                        <Form.Item>
                            <div className="ItemBlw">
                                
                                    <Button block type="primary" htmlType="submit" className="LoginBtn">Create Account !</Button>
                            
                            </div>

                        </Form.Item>

                    </Form>
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