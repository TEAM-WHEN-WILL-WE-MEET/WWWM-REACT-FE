import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Loading from "../../../components/Loading";

const KakaoCallback = () => {
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_WWWM_BE_ENDPOINT
      : process.env.REACT_APP_WWWM_BE_DEV_EP;

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //소셜 로그인 페이지로 리다이렉션 되어, 2차 API 호출 
  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        // 리다이렉션된 URL에서 state와 code 파라미터 추출
        const searchParams = new URLSearchParams(location.search);
        const state = searchParams.get("state");
        const code = searchParams.get("code");

        console.log("==== 카카오 콜백 처리 ====");
        console.log("State:", state);
        console.log("Code:", code);

        if (!code) {
          setError("인증 코드가 없습니다.");
          setLoading(false);
          return;
        }

        // 2차 API 호출
        const apiUrl = `${BASE_URL}/login/oauth2/code/auth`;
        const requestUrl = `${apiUrl}?state=${encodeURIComponent(state || "")}&code=${encodeURIComponent(code)}`;

        console.log("2차 API 호출 url:", requestUrl);

        const response = await fetch(requestUrl, {
          method: "GET",
          credentials: "include"
        });

        console.log("2차 API 응답 상태:", response.status);

        if (response.ok) {
          const responseData = await response.json();
          console.log("2차 API 응답 데이터 원본:", responseData);

          const { access_token, is_agreed_required_term } = responseData;

          if (access_token) {
            // 토큰 저장
            localStorage.setItem("authToken", access_token);
            
            console.log("토큰 저장 완료");
            console.log("필수 약관 동의 여부:", is_agreed_required_term);

            // 성공적으로 로그인 완료 - 메인 페이지로 리다이렉트
            setTimeout(() => {
              navigate("/MonthView");
            }, 1000);
          } else {
            setError("토큰을 받지 못했습니다.");
            setLoading(false);
          }
        } else {
          const errorData = await response.text();
          console.error("2차 API 오류:", errorData);
          setError(`로그인 처리 중 오류가 발생했습니다. 상태: ${response.status}`);
          setLoading(false);
        }
      } catch (error) {
        console.error("카카오 콜백 처리 오류:", error);
        setError("네트워크 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    handleKakaoCallback();
  }, [location.search, navigate, BASE_URL]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>로그인 오류 - 언제볼까?</title>
        </Helmet>
        <div className="flex items-center justify-center min-h-screen bg-[var(--white)]">
          <div className="flex flex-col items-center">
            <img
              src="/wwmtLogo.svg"
              alt="언제볼까? 로고"
              className="w-[2.2rem] h-[2.4rem] mb-8"
            />
            <h1 className="text-2xl font-bold mb-4 text-red-500">로그인 오류</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default KakaoCallback;