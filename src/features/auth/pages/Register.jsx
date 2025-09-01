import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { typographyVariants } from "../../../styles/typography.ts";
import { colorVariants } from "../../../styles/color.ts";
import { cn } from "../../../utils/cn";
import { Button } from "../../../components/Button.tsx";
import Loading from "../../../components/Loading";
import "../styles/Register.css";

const Register = () => {
  const BASE_URL =
    import.meta.env.PROD
      ? import.meta.env.VITE_WWWM_BE_ENDPOINT
      : import.meta.env.VITE_WWWM_BE_DEV_EP;

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [customDomain, setCustomDomain] = useState(false);
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(false);

  // 비밀번호 관련 상태 추가 (컴포넌트 최상단 state 선언부에 추가)
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);

  // 도메인 관련 상태 추가
  const [domainError, setDomainError] = useState("");

  const email = customDomain ? emailId : `${emailId}@${emailDomain}`;

  const domainOptions = [
    { value: "gmail.com", label: "gmail.com" },
    { value: "naver.com", label: "naver.com" },
    { value: "custom", label: "직접 입력" },
  ];

  const isFormValid =
    name.trim().length > 0 &&
    emailId.trim().length > 0 &&
    (customDomain
      ? emailDomain.includes("@")
      : emailDomain.trim().length > 0) &&
    password.trim().length > 0;

  // 비밀번호 유효성 검사 함수 추가 (handleSubmit 함수 위에 추가)
  const validatePassword = (value) => {
    if (value.length < 4) {
      setPasswordError("비밀번호는 최소 4자 이상이어야 합니다.");
      setIsPasswordValid(false);
    } else if (value.length > 12) {
      setPasswordError("비밀번호는 최대 12자까지 가능합니다.");
      setIsPasswordValid(false);
    } else {
      setPasswordError("");
      setIsPasswordValid(true);
    }
  };

  // password onChange 핸들러 수정
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  // 이메일 ID 핸들러
  const handleEmailIdChange = (e) => {
    const value = e.target.value;
    setEmailId(value);
    const isValid =
      value.trim().length > 0 &&
      (customDomain
        ? emailDomain.includes(".")
        : emailDomain.trim().length > 0);
    setIsEmailValid(isValid);
  };

  // 이메일 도메인 핸들러
  const handleEmailDomainChange = (e) => {
    const value = e.target.value;
    setEmailDomain(value);
    
    // 커스텀 도메인인 경우 유효성 검사
    if (customDomain) {
      validateDomain(value);
    }
    
    const isValid =
      emailId.trim().length > 0 &&
      (customDomain ? value.includes(".") && !domainError : value.trim().length > 0);
    setIsEmailValid(isValid);
  };

  // 도메인 유효성 검사 함수
  const validateDomain = (domain) => {
    // 도메인 형식 검증 (최소한 점이 포함되고 올바른 형식)
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    
    if (!domain.trim()) {
      setDomainError("도메인을 입력해주세요.");
    } else if (!domainPattern.test(domain.trim())) {
      setDomainError("올바른 도메인 형식을 입력해주세요. (예: example.com)");
    } else {
      setDomainError("");
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setIsNameValid(value.trim().length > 0);
  };

  const handleDomainSelect = (domain) => {
    if (domain === "custom") {
      setCustomDomain(true);
      setEmailDomain("");
      setDomainError("");
      setIsEmailValid(false);
    } else {
      setCustomDomain(false);
      setEmailDomain(domain);
      setDomainError("");
      setIsEmailValid(emailId.trim().length > 0);
    }
    setShowDomainDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(true);
      setResponseMessage("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(false);
    setResponseMessage("");

    try {
      const requestData = {
        email: email,
        password: password,
        name: name,
      };

      const endpoint = `/users/auth/signup`;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });


      // 응답 본문 확인 (성공/실패 모두)
      let responseBody = null;
      const responseText = await response.text();

      try {
        responseBody = JSON.parse(responseText);
      } catch (e) {
      }

      if (response.status === 201 || response.status === 200) {
        setError(false);
        setResponseMessage("회원가입 성공!");

        setTimeout(() => {
          const redirectUrl = searchParams.get("redirect");
          const loginPath = redirectUrl 
            ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
            : "/login";
          
          navigate(loginPath, {
            state: {
              registeredName: name,
              registeredEmail: email,
              message: `회원가입한 이메일(${email})로 로그인하세요.`,
            },
          });
        }, 1500);
      } else if (response.status === 409) {
        // 이미 등록된 이메일
        let errorMessage = "이미 등록된 이메일입니다.";
        
        // 서버 응답에서 더 구체적인 메시지 확인
        if (responseBody && responseBody.error) {
          errorMessage = responseBody.error;
        } else if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        }
        
        setError(true);
        setResponseMessage(errorMessage);
      } else if (response.status === 400) {
        // 잘못된 요청 형식 - 이메일 중복도 400으로 올 수 있음
        
        let errorMessage = "이미 등록된 이메일입니다."; // 기본값을 이메일 중복으로 변경
        
        // 서버 응답에서 더 구체적인 메시지 확인
        if (responseBody) {
          if (responseBody.error) {
            errorMessage = responseBody.error;
          } else if (responseBody.message) {
            errorMessage = responseBody.message;
          }
          
          // 만약 이메일 중복이 아닌 다른 400 에러라면 구분
          if (errorMessage.toLowerCase().includes("password") || 
              errorMessage.toLowerCase().includes("비밀번호") ||
              errorMessage.toLowerCase().includes("name") ||
              errorMessage.toLowerCase().includes("이름")) {
            errorMessage = "입력 정보가 올바르지 않습니다.";
          }
        }
        
        setError(true);
        setResponseMessage(errorMessage);
      } else if (response.status === 422) {
        // 유효성 검사 실패 (이메일 중복 등)
        let errorMessage = "이미 등록된 이메일입니다.";
        
        if (responseBody && responseBody.error) {
          errorMessage = responseBody.error;
        } else if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        }
        
        setError(true);
        setResponseMessage(errorMessage);
      } else {
        setError(true);
        let errorMessage;
        
        if (response.status === 500) {
          errorMessage = "서버에서 회원가입 처리 중 오류가 발생했습니다. 관리자에게 문의하거나 나중에 다시 시도해주세요.";
        } else if (response.status === 404) {
          errorMessage = "회원가입 기능이 현재 사용할 수 없습니다. 기존 계정으로 로그인해주세요.";
        } else if (response.status === 503) {
          errorMessage = "서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = "회원가입에 실패했습니다.";
        }
        
        // 서버 응답에서 오류 메시지 확인
        if (responseBody && responseBody.error) {
          errorMessage = responseBody.error;
        } else if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        }
        
        setResponseMessage(errorMessage);
      }
    } catch (error) {
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
        <title>회원가입 - 언제볼까?</title>
        <meta name="description" content="언제볼까? 서비스에 회원가입하세요." />
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
            새로운 계정 만들기
          </h1>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="w-auto " noValidate>
            {/* email / PW /name */}
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
                <div className="flex w-[32rem] items-center justify-center">
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
                  <div className="relative w-[14.4rem] z-30">
                    {customDomain ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={emailDomain}
                          onChange={handleEmailDomainChange}
                          className={cn(
                            inputClasses(
                              emailDomain.length === 0,
                              error && emailDomain.length === 0
                            ),
                            "w-full pr-[2.5rem] border-0 border-b-[0.1rem] border-b-[var(--gray-300)] outline-none"
                          )}
                          placeholder="도메인 입력"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDomainDropdown(!showDomainDropdown)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                        >
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
                                  :  <div className="notranslate">{option.label}</div>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
                          <div className="notranslate"> {emailDomain} </div>
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
                                  :  <div className="notranslate">{option.label}</div>}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {/* 도메인 에러 메시지 */}
                <div className="w-[32rem] relative min-h-[1.5rem]">
                  {customDomain && domainError && (
                  <div
                    className={cn(
                      typographyVariants({ variant: "d3-rg" }),
                      colorVariants({ color: "red-300" }),
                      "mt-2  w-full text-left text-[1.3rem]"
                    )}
                  >
                    {domainError}
                  </div>
                  )}
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
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
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
                      placeholder="비밀번호 (4~12자)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-10 right-2 top-1/2 -translate-y-1/2  flex items-center justify-center"
                    >
                      <img
                        src={
                          showPassword
                            ? "/icon-view-open.svg"
                            : "/icon-view.svg"
                        }
                        alt={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                        className="w-[2.4rem] h-[2.4rem]"
                      />
                    </button>
                  </div>
                </div>
                <div
                  className="w-[32rem]  relative"
                  // style={{ minHeight: "2rem" }}
                >
                  {passwordError && (
                    <div
                      className={cn(
                        typographyVariants({ variant: "d3-rg" }),
                        colorVariants({ color: "red-300" }),
                        "absolute left-0 top-3 w-full text-left whitespace-nowrap z-[999]"
                      )}
                    >
                      {passwordError}
                    </div>
                  )}
                </div>
              </div>
              {/* 이름 */}
              <div className="flex flex-col items-end w-full">
                <label
                  htmlFor="name"
                  className={cn(
                    typographyVariants({ variant: "b2-md" }),
                    colorVariants({ color: "gray-700" }),
                    "block mb-2"
                  )}
                ></label>
                <div className="flex gap-2 items-center !w-full justify-center">
                  <div className="relative">
                    <span className=" absolute top-1/2 -translate-y-1/2 left-[0.8rem] z-10 text-[var(--red-300)] text-[1.6rem]">
                      *
                    </span>
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className={cn(
                      inputClasses(
                        name.length === 0,
                        error && name.length === 0
                      ),
                      " !w-[32rem] pl-[1.6rem] pr-[0.5rem] py-[1.2rem] border-0 outline-none border-b-[0.1rem] border-b-[var(--gray-300)] rounded-none",
                      typographyVariants({ variant: "h3-md" }),
                      colorVariants({ color: "gray-700" }),
                      "placeholder:text-[var(--gray-500)]"
                    )}
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
              </div>

              {/* 에러 메시지 */}
              {responseMessage && (
                <div
                  className={cn(
                    "text-center  whitespace-nowrap  overflow-x-auto",
                    error 
                      ? colorVariants({ color: "red-300" }) 
                      : colorVariants({ color: "green-600" })
                  )}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <span className={typographyVariants({ variant: "b2-md" })}>
                    {responseMessage}
                  </span>
                </div>
              )}
            </div>
            {/* 카카오톡으로 연결 */}
            <Button
              type="submit"
              size="L"
              disabled={
                !(isPasswordValid && isEmailValid && isNameValid) || loading
              }
              additionalClass={cn(
                "mt-[6.4rem] flex items-center justify-center gap-2",
                colorVariants({ bg: "kakao-yellow", color: "kakao-black" }),
                "!text-[var(--kakao-black)]"
              )}
            >
              <img
                src="/arcticons_kakaotalk.svg"
                alt="카카오톡 아이콘"
                className="w-[1.6rem] h-[1.6rem]"
              />
              {loading ? "카카오톡으로 연결중..." : "카카오톡으로 연결"}
            </Button>

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              size="L"
              disabled={
                !(isPasswordValid && isEmailValid && isNameValid) || loading
              }
              additionalClass={cn(
                "rounded-[0.8rem] mt-[1.2rem]",
                isPasswordValid && isEmailValid && isNameValid
                  ? "border border-[var(--blue-500)] bg-[var(--white)] text-[var(--blue-500)] shadow-[1px_1px_0_0_var(--blue-500)]"
                  : "bg-[var(--gray-100)] border border-[var(--gray-500)] text-[var(--gray-900)]"
              )}
            >
              {loading ? "회원가입 중..." : "계정 만들기"}
            </Button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-[3rem] text-center">
            <p className={typographyVariants({ variant: "b2-md" })}>
              <button
                onClick={() => navigate("/login")}
                className={cn(
                  colorVariants({ color: "gray-700" }),
                  "hover:no-underline  !text-[1.2rem]"
                )}
              >
                기존 계정으로 로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
