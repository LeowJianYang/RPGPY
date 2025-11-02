
import { useState, useEffect } from "react"
import { useUserStore } from "../../components/UserStore"
import { useNavigate } from "react-router-dom";
import "../css/Settings.css"
import axios from "axios"
import {IoMdArrowBack} from "react-icons/io"
import { useTheme } from "../utils/themeManager";
const URL= import.meta.env.VITE_API_URL;
import { useToast } from "../components/Toast";
import type { ModalFormProps } from "../components/ButtonCompo";
import { ModalForm, SelfButton } from "../components/ErrorModal";
export default function Settings(){
    
    const { user,setUser } = useUserStore();
    const navigate = useNavigate();
    const {notify} = useToast();
    // Use global theme hook
    const { theme, changeTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [language, setLanguage] = useState('english');
    const [ModalOpen, setModalOpen] = useState(false);
    const [modalProps, setModalProps] = useState<ModalFormProps>();
    
    useEffect(()=>{

        axios.get(`${URL}/authCookie`, {withCredentials:true}).then((res)=>{
            setUser({
                email: res.data.email,
                user: res.data.Username,
                uid: res.data.uid
            });
            console.log(res.data);
        })
        .catch((err)=>{
            console.log(err);
            window.location.href = "/login";
        })

    },[])
    
    // Load theme preference from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme-preference') as 'light' | 'dark' | 'system';
        if (savedTheme) {
            changeTheme(savedTheme);
        }
        
        // Apply theme to document root
        applyTheme(savedTheme || 'system');
    }, []);
    
    // Function to apply theme to the document
    const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
        const root = document.documentElement;
        
        if (selectedTheme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', selectedTheme);
        }
    };
    
    // Handle theme change
    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        changeTheme(newTheme);
        localStorage.setItem('theme-preference', newTheme);
        applyTheme(newTheme);
    };

    const handleAccountDecorationChange = async (header: string, decorationType: string) =>{
            await axios.post(`${URL}/user/v1/${decorationType}/${header}/${user?.uid}`,{},{withCredentials:true}).then((_res)=>{

                notify('info', 'Settings', `Account ${decorationType} updated successfully.`, 'top');

            }).catch((err)=>{
                notify('error', 'Settings', `Failed to update account ${decorationType}.`, 'top');
                console.error(err);
            });
    };

    const handleSelectDecoration = async (decorationType: string) =>{
        try{
            const response = await axios.get(`${URL}/user/v1/inventory/${decorationType}/${user?.uid}`,{withCredentials:true});
            console.log("[DEBUG] RESULT HEADER "+response.data);
            setModalProps({
                open:ModalOpen,
                title:`Select Account ${decorationType.charAt(0).toUpperCase() + decorationType.slice(1)}`,
                onCancel:()=>{setModalOpen(false)},
                onClose:()=>{setModalOpen(false)},
                footer:<>
                    <SelfButton type="danger" onClick={()=>{setModalOpen(false)}}>Close</SelfButton>
                </>,
                children:
                <>
                    <p>Click for select one {decorationType.charAt(0).toUpperCase() + decorationType.slice(1)} Decoration</p>
                    <div className="header-selection-container">
                        <div className="header-options-list">
                            {response.data.map((item:any, idx:number)=>(
                                <div key={idx} className={`header-option ${decorationType}`} onClick={()=>{handleAccountDecorationChange(item.id, decorationType)}}> 
                                    {decorationType === 'nametag' ? 
                                    <div>
                                        <div className="preview-text" style={{backgroundImage:`url(${URL}/user/v1/background/style/${user?.uid})`}}>AaBb</div>
                                        <div className="option-name">{item.name}</div>
                                    </div> 
                                    : 
                                    <div>
                                        <div className="preview-image" style={{backgroundImage:`url(${URL}/user/v1/${decorationType}/style/${user?.uid})`}}></div>
                                        <div className="option-name">{item.name}</div>
                                    </div>}
                                </div>
                            ))}
                        </div>

                    </div>
                </>

            });
        }
        catch(err){
            notify('error', 'Settings', 'Failed to retrieve account headers.', 'top');
            console.error(err);
        }
    };


    return(
        <div className="settings-container">
            {/* Header Section */}
            <div style={{display:'flex', flexDirection:'row',alignContent:'center',alignItems:'center', alignSelf:'center'}}>
                <IoMdArrowBack className="back-button" onClick={()=>{navigate(-1)}} />
                <p className="back-button" onClick={()=>{navigate(-1)}}>Back</p>
            </div>

            <div className="settings-header">
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Customize your experience and preferences</p>
            </div>

            <div className="settings-content">
                {/* Account Settings Section */}
                <div className="settings-section">
                    <div className="section-header">
                        <h2 className="section-title">Account Settings</h2>
                        <p className="section-description">Manage your account information and security</p>
                    </div>
                    
                    <div className="settings-group">
                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">👤</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Profile Information</h3>
                                    <p className="setting-description">Update your display name and profile picture</p>
                                </div>
                            </div>
                            <button className="setting-button primary">
                                Edit Profile
                            </button>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">📧</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Email Address</h3>
                                    <p className="setting-description">Change your email for login and notifications</p>
                                    <div className="setting-value">{user?.email || 'No email set'}</div>
                                </div>
                            </div>
                            <button className="setting-button secondary">
                                Change Email
                            </button>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">🔐</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Password</h3>
                                    <p className="setting-description">Update your password for better security</p>
                                </div>
                            </div>
                            <button className="setting-button danger">
                                Change Password
                            </button>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">ICON</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Account Header</h3>
                                    <p className="setting-description">Decorate with Account Header</p>
                                </div>
                            </div>
                            <button className="setting-button secondary" onClick={()=>{handleSelectDecoration('background'), setModalOpen(true)}}>
                                Change
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings Section */}
                <div className="settings-section">
                    <div className="section-header">
                        <h2 className="section-title">Appearance</h2>
                        <p className="section-description">Customize the look and feel of your interface</p>
                    </div>
                    
                    <div className="settings-group">
                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">🌓</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Theme Preference</h3>
                                    <p className="setting-description">Choose between light, dark, or system theme</p>
                                </div>
                            </div>
                            <div className="theme-selector">
                                <button 
                                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('light')}
                                >
                                    <span className="theme-icon">☀️</span>
                                    Light
                                </button>
                                <button 
                                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('dark')}
                                >
                                    <span className="theme-icon">🌙</span>
                                    Dark
                                </button>
                                <button 
                                    className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('system')}
                                >
                                    <span className="theme-icon">💻</span>
                                    System
                                </button>
                            </div>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">🌍</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Language</h3>
                                    <p className="setting-description">Select your preferred language</p>
                                </div>
                            </div>
                            <select 
                                className="setting-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="english">English</option>
                                <option value="chinese">中文</option>
                                <option value="malay">Bahasa Melayu</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">COLOUR</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Name Tag Color</h3>
                                    <p className="setting-description">Select your preferred name tag color</p>
                                </div>
                            </div>
                            <button className="setting-button secondary" onClick={()=>{handleSelectDecoration('nametag'), setModalOpen(true)}}>
                                Change
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="settings-section">
                    <div className="section-header">
                        <h2 className="section-title">Preferences</h2>
                        <p className="section-description">Configure notifications and application behavior</p>
                    </div>
                    
                    <div className="settings-group">
                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">🔔</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Push Notifications</h3>
                                    <p className="setting-description">Receive notifications about game updates and achievements</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={notifications}
                                    onChange={(e) => setNotifications(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">🔊</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Sound Effects</h3>
                                    <p className="setting-description">Enable sound effects and background music</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={soundEnabled}
                                    onChange={(e) => setSoundEnabled(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Danger Zone Section */}
                <div className="settings-section danger-zone">
                    <div className="section-header">
                        <h2 className="section-title danger-title">Danger Zone</h2>
                        <p className="section-description">Irreversible actions that affect your account</p>
                    </div>
                    
                    <div className="settings-group">
                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">🗑️</div>
                                <div className="setting-content">
                                    <h3 className="setting-label">Delete Account</h3>
                                    <p className="setting-description">Permanently delete your account and all associated data</p>
                                </div>
                            </div>
                            <button className="setting-button danger-destructive">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <ModalForm
                open={ModalOpen}
                close={modalProps?.close}
                title={modalProps?.title ?? ""}
                onCancel={modalProps?.onCancel}
                onClose={modalProps?.onClose}
                onOk={modalProps?.onOk}
                footer={modalProps?.footer}
            >
                {modalProps?.children}
            </ModalForm>

        </div>
    )
}