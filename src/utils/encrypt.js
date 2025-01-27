import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

const secretKey = Cookies.get('accessToken');
const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  };

const decryptData = (encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey); // Replace with your actual secret key
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)); // Decrypt and parse the data
};

export {encryptData,decryptData};
