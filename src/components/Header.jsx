import React, { useEffect, useState } from 'react';
import '../styling/header.css';
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { CgProfile } from "react-icons/cg";
import { CiLogout,CiUser } from "react-icons/ci";
import { SiTata } from "react-icons/si";
import BrandLogo from '@/images/svg/BrandLogo';
import OverlayLoader from './OverlayLoader';

const Header = () => {
    const [userCreds, setUserCreds] = useState({ userName: null, password: null });
    const [loader ,setLoader] =useState(false)
    const router = useRouter();
    useEffect(() => {
        setUserCreds({
            userName: sessionStorage.getItem("userName"),
            // password: sessionStorage.getItem("password")
        });
    }, []);
    const logout = () => {
        setLoader(true)
        setTimeout(()=>{
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            sessionStorage.clear();
            setLoader(false)
            router.push('/login');
        },2000)
    };
    return (
        <>
            <header className="header">
                <div className="brand"><BrandLogo/>Document Viewer</div>
                <div className='profile-wrapper'>
                    <CgProfile style={{color:"white"}} />
                    <div className='profile-popup'>
                        <p><CiUser/> {userCreds.userName}</p>
                        <p onClick={logout}><CiLogout style={{color:"red"}} /> Logout</p>
                    </div>
                </div>
            </header>
            {loader && <OverlayLoader/>}
        </>
    );
};
export default Header;