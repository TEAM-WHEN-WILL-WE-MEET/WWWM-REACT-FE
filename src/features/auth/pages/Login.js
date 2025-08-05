import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { typographyVariants } from "../../../styles/typography.ts";
import { colorVariants } from "../../../styles/color.ts";
import { cn } from "../../../utils/cn";
import { Button } from "../../../components/Button.tsx";
import Loading from "../../../components/Loading";
import "../styles/Register.css";

const Login = () => {
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_WWWM_BE_ENDPOINT
      : process.env.REACT_APP_WWWM_BE_DEV_EP;

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [customDomain, setCustomDomain] = useState(false);
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState(null);

  const email = customDomain ? emailId : `${emailId}@${emailDomain}`;

  const domainOptions = [
    { value: "gmail.com", label: "gmail.com" },
    { value: "naver.com", label: "naver.com" },
    { value: "custom", label: "직접 입력" },
  ];

  // 회원가입에서 넘어온 정보 처리
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setRegistrationInfo({
        email: location.state.registeredEmail,
        message: location.state.message,
      });
      // 회원가입한 이메일을 파싱해서 설정
      const registeredEmail = location.state.registeredEmail;
      if (registeredEmail.includes("@")) {
        const [id, domain] = registeredEmail.split("@");
        setEmailId(id);
        if (domain === "gmail.com" || domain === "naver.com") {
          setEmailDomain(domain);
          setCustomDomain(false);
        } else {
          setEmailDomain(`@${domain}`);
          setCustomDomain(true);
        }
      }
    }
  }, [location.state]);

  const isFormValid =
    emailId.trim().length > 0 &&
    (customDomain
      ? emailDomain.includes("@")
      : emailDomain.trim().length > 0) &&
    password.trim().length > 0;

  // 이메일 ID 핸들러
  const handleEmailIdChange = (e) => {
    const value = e.target.value;
    setEmailId(value);
  };

  // 이메일 도메인 핸들러
  const handleEmailDomainChange = (e) => {
    const value = e.target.value;
    setEmailDomain(value);
  };

  const handleDomainSelect = (domain) => {
    if (domain === "custom") {
      setCustomDomain(true);
      setEmailDomain("");
    } else {
      setCustomDomain(false);
      setEmailDomain(domain);
    }
    setShowDomainDropdown(false);
  };

  const handleKakaoLogin = async () => {
    // 1차 요청
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/oauth2/authorization/google`, {
        method: "GET",
      });
      
      //서버가 OAuth 제공자(카카오)로 리다이렉트하라는 응답을 보냈는지 확인.
      //맞다면 해당 소셜 로그인 페이지로 강제 이동
      if (response.redirected) { 
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Kakao login error:", error);
      setError(true);
      setResponseMessage("카카오 로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(true);
      setResponseMessage("이메일, 비밀번호를 모두 입력해주세요.");
      return;
    }

    // 추가 검증
    if (emailId.trim() === "" || password.trim() === "") {
      setError(true);
      setResponseMessage("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(false);
    setResponseMessage("");

    try {
      // 로그인 요청 데이터 구성 (name 제거)
      const data = {
        email: email,
        password: password,
        name: "dd",
      };

      console.log("==== 로그인 요청 정보 ====");
      console.log("BASE_URL:", BASE_URL);
      console.log("Request data:", data);
      console.log("Email value:", email);
      console.log("Password value:", password);

      const endpoint = `/users/auth/login`;

      console.log(`로그인 API 호출: ${BASE_URL}${endpoint}`);
      console.log(`사용하는 데이터:`, data);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("==== 서버 응답 정보 ====");
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // 응답 본문 확인 (성공/실패 모두)
      let responseBody = null;
      const responseText = await response.text();
      console.log("Response body (text):", responseText);

      try {
        responseBody = JSON.parse(responseText);
        console.log("Response body (parsed):", responseBody);
      } catch (e) {
        console.log("Response body를 JSON으로 파싱할 수 없음:", e.message);
      }

      if (response.status === 200) {
        if (responseBody && responseBody.object) {
          const token = responseBody.object;

          // 토큰 저장
          localStorage.setItem("authToken", token);

          setResponseMessage("로그인 성공!");

          // 리다이렉트 URL이 있고 getAppointment 페이지면 그대로 리다이렉트, 아니면 원래 URL 또는 MonthView로 이동
          const redirectUrl = searchParams.get("redirect");
          setTimeout(() => {
            if (redirectUrl) {
              const decodedUrl = decodeURIComponent(redirectUrl);
              // getAppointment 페이지에서 온 경우 그대로 리다이렉트
              if (decodedUrl.includes("/getAppointment?appointmentId=")) {
                navigate(decodedUrl);
              } else {
                navigate(decodedUrl);
              }
            } else {
              navigate("/MonthView");
            }
          }, 1000);
        } else {
          console.error("응답 데이터 형식이 예상과 다릅니다:", responseBody);
          setError(true);
          setResponseMessage("로그인 응답 처리 중 오류가 발생했습니다.");
        }
      } else if (response.status === 401) {
        let errorMessage =
          "등록되지 않은 정보이거나 이메일, 비밀번호가 일치하지 않습니다.";

        // 서버 응답에서 더 구체적인 오류 메시지 확인
        if (responseBody && responseBody.error) {
          errorMessage = responseBody.error;
        } else if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        }

        setError(true);
        setResponseMessage(errorMessage);
      } else if (response.status === 400) {
        // 400 오류에 대한 더 구체적인 처리
        let errorMessage = "요청 정보가 올바르지 않습니다.";

        // 서버 응답에서 오류 메시지 확인
        if (responseBody && responseBody.error) {
          errorMessage = responseBody.error;
        } else if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        } else {
          // 입력 값 검증
          if (email.trim().length < 5 || !email.includes("@")) {
            errorMessage = "올바른 이메일 주소를 입력해주세요.";
          } else if (password.length < 2) {
            errorMessage = "비밀번호는 2글자 이상 입력해주세요.";
          } else {
            errorMessage = "입력한 정보를 다시 확인해주세요. (서버 검증 실패)";
          }
        }

        setError(true);
        setResponseMessage(errorMessage);
      } else {
        let errorMessage = `로그인에 실패했습니다. (오류 코드: ${response.status})`;

        // 서버 응답에서 오류 메시지 확인
        if (responseBody && responseBody.error) {
          errorMessage = responseBody.error;
        } else if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        }

        setError(true);
        setResponseMessage(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(true);
      setResponseMessage("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (isEmpty, hasError) =>
    cn(
      "flex h-16 px-5 py-4",
      "items-center flex-shrink-0 rounded-lg",
      "border border-gray-300",
      typographyVariants({ variant: "b2-md" }),
      {
        "outline outline-1 outline-red-500 outline-offset-0": hasError,
      }
    );

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>로그인 - 언제볼까?</title>
        <meta name="description" content="언제볼까? 서비스에 로그인하세요." />
      </Helmet>

      <div className="flex items-center justify-center min-h-screen bg-[var(--white)] ">
        <div className="flex flex-col items-center w-full  h-full ">
          {/* 로고 */}
          <div className="mb-8">
            <img
              src="/wwmtLogo.svg"
              alt="언제볼까? 로고"
              className="w-[2.2rem] h-[2.4rem] cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* 제목 */}
          <h1
            className={cn(
              typographyVariants({ variant: "h1-sb" }),
              colorVariants({ color: "gray-900" }),
              "text-[2rem] mb-[4rem] text-center"
            )}
          >
            로그인
          </h1>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="w-auto " noValidate>
            {/* email / PW */}
            <div className="w-full flex flex-col items-end justify-center !space-y-[2rem]  ">
              {/* 이메일 */}
              <div className="flex flex-col items-end w-full">
                <label
                  htmlFor="email"
                  className={cn(
                    typographyVariants({ variant: "b2-md" }),
                    colorVariants({ color: "gray-700" }),
                    "block mb-2"
                  )}
                ></label>
                <div className="flex w-full  items-center justify-center">
                  <div className="relative flex-shrink-0">
                    <span className="absolute top-1/2 -translate-y-1/2 left-[0.8rem] z-10 text-[var(--red-300)] text-[1.6rem]">
                      *
                    </span>
                  </div>
                  <div className="flex flex-2 items-center">
                    <input
                      id="emailId"
                      type="text"
                      value={emailId}
                      onChange={handleEmailIdChange}
                      className={cn(
                        inputClasses(
                          emailId.length === 0,
                          error && emailId.length === 0
                        ),
                        "w-full max-w-[14.4rem] pl-[1.6rem] pr-[0.5rem] py-[1.2rem] border-0 outline-none border-b-[0.1rem] border-b-[var(--gray-300)] rounded-none",
                        typographyVariants({ variant: "h3-md" }),
                        colorVariants({ color: "gray-700" }),
                        "placeholder:text-[var(--gray-500)]"
                      )}
                      placeholder="이메일"
                      required
                    />
                  </div>
                  <span className="mx-4 text-[2rem] text-gray-500 flex-shrink-0">
                    @
                  </span>
                  <div className="relative flex-1 max-w-[14.4rem] z-30">
                    {customDomain ? (
                      <input
                        type="text"
                        value={emailDomain}
                        onChange={handleEmailDomainChange}
                        className={cn(
                          inputClasses(
                            emailDomain.length === 0,
                            error && emailDomain.length === 0
                          ),
                          "w-full border-0 border-b-[0.1rem] border-b-[var(--gray-300)] outline-none"
                        )}
                        placeholder="도메인 입력"
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setShowDomainDropdown(!showDomainDropdown)
                          }
                          className={cn(
                            "w-full h-16 px-5 py-4 flex items-center justify-between",
                            "bg-white border-b border-gray-300 ",
                            typographyVariants({ variant: "b2-md" })
                          )}
                        >
                          {emailDomain}
                          <img
                            src="/dropdwonarrow.svg"
                            alt="도메인 선택"
                            className={cn(
                              "w-[1.2rem] h-[0.6rem] transition-transform",
                              showDomainDropdown && "transform rotate-180"
                            )}
                          />
                        </button>
                        {showDomainDropdown && (
                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            {domainOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleDomainSelect(option.value)}
                                className={cn(
                                  "w-full px-5 py-3 text-left hover:bg-gray-50",
                                  typographyVariants({ variant: "b2-md" })
                                )}
                              >
                                {option.value === "custom"
                                  ? option.label
                                  : `${option.label}`}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="flex flex-col items-end w-full">
                <label
                  htmlFor="password"
                  className={cn(
                    typographyVariants({ variant: "b2-md" }),
                    colorVariants({ color: "gray-700" }),
                    "block mb-2"
                  )}
                ></label>
                <div className="flex w-full  items-center justify-center">
                  <div className="relative">
                    <span className=" absolute top-1/2 -translate-y-1/2 left-[0.8rem] z-10 text-[var(--red-300)] text-[1.6rem]">
                      *
                    </span>
                  </div>
                  <div className="relative flex-2 !w-[32rem]">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        inputClasses(
                          password.length === 0,
                          error && password.length === 0
                        ),
                        "flex-1 w-[32rem] pl-[1.6rem] pr-[3rem] py-[1.2rem] border-0 outline-none border-b-[0.1rem] border-b-[var(--gray-300)] rounded-none",
                        typographyVariants({ variant: "h3-md" }),
                        colorVariants({ color: "gray-700" }),
                        "placeholder:text-[var(--gray-500)]"
                      )}
                      placeholder="비밀번호를 입력하세요"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 에러 메시지 */}
              {responseMessage && (
                <div
                  className={cn(
                    "text-center  whitespace-nowrap  overflow-x-auto",
                    error ? colorVariants({ color: "red-300" }) : " "
                  )}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <span className={typographyVariants({ variant: "b2-md" })}>
                    {responseMessage}
                  </span>
                </div>
              )}
            </div>
            {/* 로그인 유지하기 체크박스 */}
            <div className="flex items-center justify-end w-full mt[1.2rem] mb-[6.4rem]">
              <label className="register-checkbox-container">
                <input type="checkbox" className="register-checkbox" />
                <span className="register-checkmark"></span>
                <span
                  className={cn(
                    typographyVariants({ variant: "b2-md" }),
                    colorVariants({ color: "gray-700" })
                  )}
                >
                  로그인 유지하기
                </span>
              </label>
            </div>
            {/* 카카오톡으로 연결 */}
            <Button
              type="button"
              size="L"
              onClick={handleKakaoLogin}
              disabled={loading}
              additionalClass={cn(
                "mt-6 flex items-center justify-center gap-2",
                colorVariants({ bg: "kakao-yellow", color: "kakao-black" }),
                "!text-[var(--kakao-black)]"
              )}
            >
              <img
                src="/arcticons_kakaotalk.svg"
                alt="카카오톡 아이콘"
                className="w-[1.6rem] h-[1.6rem]"
              />
              {loading ? "연결 중..." : "카카오톡으로 연결"}
            </Button>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              size="L"
              disabled={!isFormValid || loading}
              additionalClass={cn(
                "rounded-[0.8rem] mt-[1.2rem]",
                isFormValid
                  ? "border border-[var(--blue-500)] bg-[var(--white)] text-[var(--blue-500)] shadow-[1px_1px_0_0_var(--blue-500)]"
                  : "bg-[var(--gray-100)] border border-[var(--gray-500)] text-[var(--gray-900)]"
              )}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          {/* 하단 링크 */}
            <div
              className={cn(
                typographyVariants({ variant: "b2-md" }),
                "mt-[3rem] flex !flex-col !gap-[2rem] w-full h-full !text-[1.2rem]"
              )}
            >
              <button
                onClick={() => navigate("/register")}
                className={cn(
                  colorVariants({ color: "gray-700" }),
                  "hover:no-underline"
                )}
              >
                새 계정 만들기
              </button>
              <button
                onClick={() => navigate("/")}
                className={cn(
                  colorVariants({ color: "gray-700" }),
                  "hover:no-underline"
                )}
              >
                비밀번호 찾기
              </button>
            </div>
          </div>
      </div>
    </>
  );
};

export default Login;
