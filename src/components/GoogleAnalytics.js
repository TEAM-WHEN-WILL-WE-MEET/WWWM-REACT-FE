import { useEffect } from 'react';
import axios from 'axios';

const GoogleAnalytics = () => {
  useEffect(() => {
       // 'client_id', 'client_secret', 'refresh_token'을 사용하여 갱신된 'access_token'을 요청
       axios.post('https://accounts.google.com/o/oauth2/token',
        {
            "client_id": `${process.env.REACT_APP_OAUTH_CLIENT_ID}`,
            "client_secret": `${process.env.REACT_APP_OAUTH_CLIENT_SECRET}`,
            "refresh_token": `${process.env.REACT_APP_OAUTH_REFRESH_TOKEN}`,
            "grant_type": "refresh_token"
        }
         ).then((response) => {   
            axios.post(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.REACT_APP_GA4_PROPERTY_ID}:runReport`,
            {
            "dimensions": [{ "name":"date" }],
            "metrics": [
                        { "name": "activeUsers" },
                        { "name": "bounceRate" },
                        { "name": "engagementRate" },
                        { "name": "eventCount" },
                        { "name": "newUsers" },
                        { "name": "organicGoogleSearchClicks" },
                        { "name": "sessions" },
                        { "name": "wauPerMau" },
                ],
            "dateRanges": [{ "startDate":"2025-01-01", "endDate":"today" }],
            "keepEmptyRows": true
            },
            {
                headers: {
                    'Authorization': `Bearer ${response.data.access_token}`
                }
        }            
    )
    //정상적으로 응답을 받았다면, 콘솔창에 runReport의 결과가 나타날 것이다.
    .then((response) => {
        console.log(response);  
    })
    //runReport가 정상적으로 호출되지 않았다면, [REPORT ERROR]라는 문구와 함께 콘솔창에 에러
    .catch((error) => {
        console.log('[REPORT ERROR] ', error);
    })
    })
    // 'access_token'을 호출하는 것에 실패했다면, [TOKEN ERROR]라는 문구와 함께 콘솔창에 에러가 보일 것이다.
    .catch((error) => {
        console.log('[TOKEN ERROR] ', error.response?.data);
        //console.log 결과 -->
        // error"unauthorized_client"
        //error_description: "Unauthorized"
        //지금은 Token has been expired or revoked라고 뜸
        })
    })
}

export default GoogleAnalytics;