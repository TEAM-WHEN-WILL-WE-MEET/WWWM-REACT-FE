import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { typographyVariants } from "../../../styles/typography.ts";
import { colorVariants } from "../../../styles/color.ts";
import { cn } from "../../../utils/cn";
import { Button } from "../../../components/Button.tsx";
import Loading from "../../../components/Loading";
import "../styles/Register.css";

const Register = () => {
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_WWWM_BE_ENDPOINT
      : process.env.REACT_APP_WWWM_BE_DEV_EP;

  const navigate = useNavigate();
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

      // console.log("회원가입 요청 정보:");
      // console.log("BASE_URL:", BASE_URL);
      // console.log("Full URL:", `${BASE_URL}/users/auth/register`);
      // console.log("Request body:", requestData);

      const endpoint = `/users/auth/signup`;

      // console.log(`회원가입 API 호출: ${BASE_URL}${endpoint}`);
      // console.log(`사용하는 데이터:`, requestData);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // console.log(`API 응답 상태:`, response.status);
      // console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response body:", errorText);
      }

      if (response.status === 201 || response.status === 200) {
        // setResponseMessage(
        //   `회원가입이 완료되었습니다! 로그인 시 이름: "${name}", 이메일: "${email}"을 사용하세요.`
        // );

        setTimeout(() => {
          navigate("/login", {
            state: {
              registeredName: name,
              registeredEmail: email,
              // message: `회원가입한 이름(${name}) 또는 이메일(${email})로 로그인하세요.`,
            },
          });
        }, 200);
      }else if (response.status === 409) {
        setError(true);
        setResponseMessage("이미 등록된 이메일입니다.");
      } else if (response.status === 400) {
        setError(true);
        setResponseMessage("입력 정보가 올바르지 않습니다.");
      } else {
        setError(true);
        if (response.status === 500) {
          setResponseMessage(
            "서버에서 회원가입 처리 중 오류가 발생했습니다. 관리자에게 문의하거나 나중에 다시 시도해주세요."
          );
        } else if (response.status === 404) {
          setResponseMessage(
            "회원가입 기능이 현재 사용할 수 없습니다. 기존 계정으로 로그인해주세요."
          );
        } else {
          setResponseMessage("회원가입에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("Register error:", error);
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
          <form onSubmit={handleSubmit} className="w-auto ">
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
                      onChange={(e) => setEmailId(e.target.value)}
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
                        onChange={(e) => setEmailDomain(e.target.value)}
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
                {passwordError && (
                  <div
                    className={cn(
                      typographyVariants({ variant: "d3-rg" }),
                      colorVariants({ color: "red-300" }),
                      " left-[30rem] absolute z-20 mt-[5rem]"
                    )}
                  >
                    {passwordError}
                  </div>
                )}
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
                    onChange={(e) => setName(e.target.value)}
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
                    "text-center p-3 rounded-md",
                    error
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  )}
                >
                  <p className={typographyVariants({ variant: "b2-md" })}>
                    {responseMessage}
                  </p>
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
                      colorVariants({ color: "gray-700" }), 
                    )
                  
                  }
                  >
                    로그인 유지하기
                  </span>
                </label>
              </div>
            {/* 카카오톡으로 연결 */}
            <Button
              type="submit"
              size="L"
              disabled={!isFormValid || loading}
              additionalClass={cn(
                "w-full mt-6",
                colorVariants({ bg: "blue-400" }),
                "!text-[var(--white)]"
              )}
            >
              {loading ? "카카오톡으로 연결중..." : "카카오톡으로 연결"}
            </Button>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={!isPasswordValid || loading}
              className={cn(
                "w-full py-[1.2rem] rounded-[0.8rem] mt-[1.2rem]",
                isPasswordValid
                  ? "bg-[var(--blue-500)] text-white"
                  : "bg-[var(--gray-300)] text-[var(--gray-500)]"
              )}
            >
              {loading ? "회원가입 중..." : "계정 만들기"}
            </button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-[3rem] text-center">
            <p className={typographyVariants({ variant: "b2-md" })}>
              <button
                onClick={() => navigate("/login")}
                className={cn(
                  colorVariants({ color: "gray-700" }),
                  "hover:no-underline"
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
