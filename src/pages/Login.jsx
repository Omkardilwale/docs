import { useState } from 'react';
import styles from '../styling/login.module.css';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { login, sendEvent } from '@/utils/api';
import { RiLoginBoxFill } from "react-icons/ri";
import { IoPerson } from "react-icons/io5";
import { PiPasswordFill } from "react-icons/pi";
import { BsFillLaptopFill } from "react-icons/bs";
import BrandLogoSvg from '../images/svg/BrandLogo';
import OverlayLoader from '@/components/OverlayLoader';
import { commonEventAttributes } from '@/utils/utils';

export default function Login() {
  const [UserId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loader , setLoader] = useState(false);
  const [dropdownSelection, setDropdownSelection] = useState('');
  const router = useRouter();
  const develope = true


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    if (!UserId || !password) {
      setError('Both UserId and Password are required');
      return;
    }
    sessionStorage.setItem("userName",UserId)
    sessionStorage.setItem("password",password)

    if (!dropdownSelection) {
      setError('Please select an option from the dropdown');
      setLoader(false);
      return;
    }

    setError('');
    setMessage(''); // Clear any previous messages

    const requestBody = {
      userId: UserId,
      _wfId: null,
      password: password,
      newPassword: null,
      deviceId: '4075998b-6aad-4606-ad9d-51007598ba20',
      deviceAttr: {
        manufacturer: 'Netscape',
        model: 'Microsoft Edge (MacOS)',
        version: '131.0.0.0',
        os: 'MacOS',
        browser: 'Microsoft Edge',
      },
      fcmDeviceToken: 'fcmDeviceToken_1',
      source: 'web',
    };

    try {
      if(!develope){
        const response = await login(requestBody);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status) {
          console.log("tokens",data)
          Cookies.set('accessToken' , data.accessToken,{secure:true,sameSite:'Strict'});
          Cookies.set('refreshToken' , data.refreshToken,{secure:true,sameSite:'Strict'});
          sendEvent({
            name: "login_success",
            attributes: {
              userId:UserId,
              role: dropdownSelection,
              ...commonEventAttributes(),
            }
          })
          router.push('/document-viewer');
        } else {
          sendEvent({
            name: "login_failed",
            attributes: {
              userId:UserId,
              role: dropdownSelection,
              ...commonEventAttributes(),
            }
          })
          setError(data._status?.code === 0 ? 'Invalid credentials' : 'Login failed');
        }
        setLoader(false);


      }else{
        const accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2ODcyNzg3OTB9.dPBBnz2H6tfWZ4HqCy45L3SLI-elRHPeP4aHw2mJR3e3n1tl1Yi48E3gspBpExjpYqpErartaGVkso-9WjAqoQ"
        const refreshToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MTU5OTAiLCJ1c2VySWQiOiI2MTU5OTAiLCJyb2xlIjoiQUdFTlQiLCJyb2xlVHlwZSI6IkVMUCIsInVzZXJHcm91cCI6InNpZGRoaSIsImNoYW5uZWwiOiJBR0NZIiwiZ3JvdXBJZCI6bnVsbCwiYWRkaXRpb25hbFJvbGUiOm51bGwsImFkZGl0aW9uYWxSb2xlVHlwZSI6bnVsbCwic291cmNlIjoid2ViIiwibG9naW5Nb2RlIjoiUGFzc3dvcmQiLCJkZXNpZ25hdGlvbiI6IkVMIiwiaXNzIjoiYWNtZSIsImF1ZCI6ImFjbWVBdWQiLCJpYXQiOjE3MzYzMzMyNjUsImV4cCI6MTczNjM3NjQ2NX0.NWxGH3Da9gmE3GZe10q2OEuYAoC2ErofmXQPKfCxg6DtFrJwA715fV5Rkc3h4aG34--eFThOOhy0cFiLjTa3Lw"
     
        Cookies.set('accessToken' , accessToken,{secure:true,sameSite:'Strict'});
        Cookies.set('refreshToken' , refreshToken,{secure:true,sameSite:'Strict'});
        sendEvent({
          name: "login_success",
          attributes: {
            userId:UserId,
            role: dropdownSelection,
            ...commonEventAttributes(),
          }
        })
        router.push('/document-viewer');

        setLoader(false);

      }
    } catch (err) {
      sendEvent({
        name: "login_error",
        attributes: {
          userId:UserId,
          role: dropdownSelection,
          ...commonEventAttributes(),
        }
      })
      setError(`Error: ${err.message}`);
      setLoader(false);
    }
  };

  return (
    <>
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}><BrandLogoSvg/></h2>
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="UserId" className={styles.label}><IoPerson/> UserId</label>
            <input
              type="text"
              id="UserId"
              value={UserId}
              onChange={(e) => setUserId(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}><PiPasswordFill/> Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="role" className={styles.label}><BsFillLaptopFill/> Role</label>
            <select
              id="role"
              value={dropdownSelection}
              onChange={(e) => setDropdownSelection(e.target.value)}
              className={styles.input}
            >
              <option value="">Select Role</option>
              <option value="INDIVIDUALLIFE">INDIVIDUALLIFE</option>
              <option value="INDIVIDUALLIFEBRANCH">INDIVIDUALLIFEBRANCH</option>
              <option value="CALLCENTER">CALLCENTER</option>
              <option value="CORPORATEBUSINESS">CORPORATEBUSINESS</option>
              <option value="DOPSBRANCH">DOPSBRANCH</option>
              <option value="DOPSHO">DOPSHO</option>
              <option value="HR">HR</option>
            </select>
          </div>
          
          {loader ? <button className={styles.button}>Logging in...<OverlayLoader/></button>:<button type="submit" className={styles.button}>Login</button>}
        </form>
      </div>
    </div>
    </>
  );
};