import axios from 'axios';
import Cookies from 'js-cookie';
// const baseURL = "https://uatservicesplatform.tataaia.com/api"
const baseURL = "https://devintegrationapi.tataaia.com/api"

const apiClient = axios.create({
    baseURL:baseURL
});

apiClient.interceptors.request.use(
    (config)=>{
        const token = Cookies.get("accessToken")
        if(token){
            config.headers.Authorization = `Bearer ${token}`,
            config.headers['Content-Type'] = "application/json"
        }
        return config;
    },
    (error)=> Promise.reject(error)
)


apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
   
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
   
        try {
          const refreshToken = Cookies.get('refreshToken');
          const { data } = await axios.post('/auth/refresh', { token: refreshToken });
   
          Cookies.set('accessToken', data.accessToken, { secure: true, sameSite: 'Strict' });
          apiClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
   
          return apiClient(originalRequest);
        } catch (err) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          sessionStorage.clear();
          window.location.href = '/docviewer/login';
        }
      }
   
      return Promise.reject(error);
    }
  );

export default apiClient;
 