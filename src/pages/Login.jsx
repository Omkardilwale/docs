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
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(false);
  const [dropdownSelection, setDropdownSelection] = useState('');
  const [wfId, setWfId] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const router = useRouter();
  const develope = true;

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    if (!UserId) {
      setError('UserId is required');
      setLoader(false);
      return;
    }

    if (!dropdownSelection) {
      setError('Please select an option from the dropdown');
      setLoader(false);
      return;
    }

    setError('');
    setMessage('');

    const requestBody = {
      userId: UserId,
      source: dropdownSelection.toLowerCase()
    };

    try {
      const response = await login(requestBody);
      const data = await response.json();
      console.log(data)

      if (data._wfId) {
        setWfId(data._wfId);
        setShowOtpField(true);
        setMessage('Please enter the OTP sent to your registered mobile number');
      } else {
        setError('Failed to get OTP');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoader(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    if (!otp) {
      setError('OTP is required');
      setLoader(false);
      return;
    }

    const requestBody = {
      userId: UserId,
      _wfId: wfId,
      otp: otp,
      source: dropdownSelection.toLowerCase()
    };

    try {
      const response = await login(requestBody);
      const data = await response.json();
      console.log(data)

      if (data._status.code===0) {
        Cookies.set('accessToken', data.accessToken, {secure: true, sameSite: 'Strict'});
        Cookies.set('refreshToken', data.refreshToken, {secure: true, sameSite: 'Strict'});
        Cookies.set('userName',data.user.employee.ntId)
        router.push('/document-viewer');
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}><BrandLogoSvg/></h2>
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}
        
        <form onSubmit={showOtpField ? handleFinalSubmit : handleInitialSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="UserId" className={styles.label}><IoPerson/> UserId</label>
            <input
              type="text"
              id="UserId"
              value={UserId}
              onChange={(e) => setUserId(e.target.value)}
              className={styles.input}
              disabled={showOtpField}
            />
          </div>

          {showOtpField ? (
            <div className={styles.inputGroup}>
              <label htmlFor="otp" className={styles.label}><PiPasswordFill/> OTP</label>
              <input
                type="password"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.input}
              />
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label htmlFor="role" className={styles.label}><BsFillLaptopFill/> Role</label>
              <select
                id="role"
                value={dropdownSelection}
                onChange={(e) => setDropdownSelection(e.target.value)}
                className={styles.input}
              >
                <option value="">Select Role</option>
                <option value="WEB">WEB</option>
                <option value="INDIVIDUALLIFE">INDIVIDUALLIFE</option>
                <option value="INDIVIDUALLIFEBRANCH">INDIVIDUALLIFEBRANCH</option>
                <option value="CALLCENTER">CALLCENTER</option>
                <option value="CORPORATEBUSINESS">CORPORATEBUSINESS</option>
                <option value="DOPSBRANCH">DOPSBRANCH</option>
                <option value="DOPSHO">DOPSHO</option>
                <option value="HR">HR</option>
              </select>
            </div>
          )}
          
          {loader ? 
            <button className={styles.button}>
              {showOtpField ? 'Verifying OTP...' : 'Sending OTP...'}
              <OverlayLoader/>
            </button> 
            : 
            <button type="submit" className={styles.button}>
              {showOtpField ? 'Verify OTP' : 'Get OTP'}
            </button>
          }
        </form>
      </div>
    </div>
  );
}