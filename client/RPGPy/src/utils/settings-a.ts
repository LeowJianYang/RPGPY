import axios from "axios";
const URL = import.meta.env.VITE_API_URL;

export type setup= {
    currentPassword?: string;
    newPassword?: string;
    userId?: string| number;
    type: 'password'
}| {
    newEmail?: string;
    userId?: string| number;
    type: 'email'
} | {
    password?: string;
    userId?: string| number;
    type: 'delete'
};

export type detailsType = 'password' | 'email' | 'delete';

type PasswordSetup = Extract<setup, {type: 'password'}>;
type EmailSetup = Extract<setup, {type: 'email'}>;
type DeleteSetup = Extract<setup, {type: 'delete'}>;


export const changePassword = async (data: PasswordSetup) =>{

  try{
     const res = await axios.patch(`${URL}/user/v1/${data.userId}/settings/password`, data, {withCredentials:true});
     return res.data.success;
  } catch (err:any){
      throw err.response?.data?? err;
  }

};

export const changeEmail = async (data: EmailSetup) => {
    try{
        const res = await axios.patch(`${URL}/user/v1/${data.userId}/settings/email`, { newEmail: data.newEmail }, { withCredentials: true });
        return res.data.success;
    } catch (err:any){
        throw err.response?.data?? err;
    }
};

export const deleteAccount = async (data: DeleteSetup) => {
    try{
        const res = await axios.delete(`${URL}/user/v1/${data.userId}/settings/account`, { data: { password: data.password }, withCredentials: true });
        await axios.post(`${URL}/auth/logout`, {}, { withCredentials: true });
        return res.data.success;
    } catch (err:any){
        throw err.response?.data?? err;
    }
};
