import axios from "axios"
import { useUserStore } from "../../components/UserStore"
import React,{ useEffect, type Key, type ReactNode, useState } from "react"
import { UserOutlined, TeamOutlined,DesktopOutlined,LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined, FileTextOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, theme,Button,Layout,Modal } from "antd";
import DashPage from "./DashPage";
import MultiPage from "./MultiPage";
import ProfilePage from "./ProfilePage";
import Documentation from "./Documentation";
import "../css/LoginDe.css";




export default function DashboardPage(){
    const {Sider} = Layout;

    const {setUser} = useUserStore();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState<string[]>(['1']);
    const [page, setPage]= useState<React.ReactNode>(<DashPage/>);

    const {confirm} =Modal;
    const URL= import.meta.env.VITE_API_URL;

    
    const {
        // @ts-ignore
    token: { darkDangerItemColor, darkDangerItemActiveBg},
    } = theme.useToken();


    useEffect(()=>{

        axios.get(`${URL}/authCookie`, {withCredentials:true}).then((res)=>{
            setUser(res.data.Username);
            console.log(res.data.user);
        })
        .catch((err)=>{
            console.log(err);
            window.location.href = "/login";
        })



    },[])


    useEffect(()=>{


        switch(selectedKey[0]){
            case "1":
                setPage(<DashPage/>);
                break;
            case "2":
                setPage(<MultiPage/>);
                break;
            case "3":
                setPage(<ProfilePage/>);
                break;
            
            case "5":
                setPage(<Documentation/>);
                break;

            case "4":
                handleLogoutConfirm();
                break;
            default:
                setPage(<DashPage/>);
                break;
        }


    },[selectedKey])


   const handleLogoutConfirm = async() =>{
        confirm({
            title:"Do You Want To Log Out ?",
            icon:<LogoutOutlined/>,
            content:"Click Ok Button Proceed to Log out.",
            okText:'Ok',
            cancelText:'Cancel',
            okType:'danger',
            async onOk() {
            return new Promise((resolve,reject)=>{
                
                setTimeout(async ()=>{

                  try{

                    const res= await axios.post(`${URL}/auth/logout`,{},{withCredentials:true});

                    if(res.status===200){
                        setUser(null);
                        window.location.href = "/login";
                        resolve("Sucess" + res.data?.message);  
                    }else{
                        console.log(res.data.message);
                        reject("Logout Failed" + res.data?.message);
                    }
                   
                } catch(err){
                    reject(err);
                }}
                ,1000)
            })
            .then((res)=>{
                console.log(res);
            })
            .catch((err)=>{
                console.log(err);
            })
   
            },
            onCancel(){}

        })
    }


    type MenuItems = Required<MenuProps>['items'][number];

    function GetItems(
        label: ReactNode,
        key: Key,
        icon?: ReactNode,
        children?: MenuItems[],
        danger?: boolean
    ): MenuItems{
        return{
            key,
            icon,
            children,
            label,
            danger
        } as MenuItems;
    }


    const items:MenuItems[]=[
        GetItems("Dashboard", "1", <DesktopOutlined/>),
        GetItems("MultiPlayer", "2", <TeamOutlined/>),
        GetItems("Account", "sub1", <UserOutlined/>,[
            GetItems('Profile','3'),
            GetItems('Logout','4', <LogoutOutlined/>, undefined, true)
        ]),
        GetItems("Documentation", "5", <FileTextOutlined/>),
    ];
    
    const toggleCollapsed= ()=>{
        setCollapsed(!collapsed);
    }

    const handleOnClick= (e:any)=>{
        setSelectedKey([e.key]);
        console.log(e.key);
    }


    return(
        //Container Flex Direction Column
        <div className='container-dashboard'> 
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <Button type="primary" onClick={toggleCollapsed} style={{margin:16}}>
                    {collapsed ? <MenuUnfoldOutlined/>:<MenuFoldOutlined/>}
                </Button>
                <Menu
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    items={items}
                    theme="dark"
                    inlineCollapsed={collapsed}
                    selectedKeys={selectedKey}
                    onClick={handleOnClick}
                    className="menu"
                    style={{borderRadius:"10px", color:darkDangerItemColor, backgroundColor:darkDangerItemActiveBg}}
                    
                >

                </Menu>

            </Sider>

            <div className="Content-dashboard">
                {/* <div className="Header">
                    
                </div> */}
                
                <div className="Body">
                    {page}
                </div>

            </div>
        </div>
    )
}