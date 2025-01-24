import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

 
const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
 
    useEffect(() => {
      const token = Cookies.get('accessToken');
      if (!token) {
        sessionStorage.clear();
        router.push('/login'); 
      }
    }, [router]);
 
    return <WrappedComponent {...props} />;
  };
};


export default withAuth ;


// app.post("/api/ajaxCall", async (req, res, next) => {
//   console.log(req.body);

//   var apiUrl = req.body.apiUrl;
//   var headers = req.body.headers;
//   var parametersList = req.body.parametersList;

//   let axRes = await axios({
//     method: "POST",
//     url: apiUrl,
//     headers: headers,
//     data: parametersList,
//   });

//   console.log(JSON.stringify(axRes.data));
//   res.json(axRes.data)
// });

// app.use(
//   bodyParser.json({limit: '35mb'}),
//   express.json(),
//   cors()
// //    { origin: 'http://localhost:8000'  }
// );

// const express = require('express');
// const app = express();
// const port = 3004;
// const cors = require('cors');
// const axios = require('axios');
// const bodyParser = require('body-parser');
 
// app.use(
//     bodyParser.json({limit: '35mb'}),
//     express.json(),
//     cors()
// //    { origin: 'http://localhost:8000'  }
// );
 
 
// app.listen(port, () => console.log(`API listening on port ${port}!`));