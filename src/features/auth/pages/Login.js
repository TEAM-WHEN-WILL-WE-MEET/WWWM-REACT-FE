import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { typographyVariants } from "../../../styles/typography.ts";
import { colorVariants } from "../../../styles/color.ts";
import { cn } from "../../../utils/cn";
import { Button } from "../../../components/Button.tsx";
import Loading from "../../../components/Loading";

const Login = () => {
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_WWWM_BE_ENDPOINT
      : process.env.REACT_APP_WWWM_BE_DEV_EP;

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState(null);

  // 회원가입에서 넘어온 정보 처리
  useEffect(() => {
    if (location.state?.registeredName && location.state?.registeredEmail) {
      setRegistrationInfo({
        name: location.state.registeredName,
        email: location.state.registeredEmail,
        message: location.state.message,
      });
      // 회원가입한 정보를 기본값으로 설정
      setName(location.state.registeredName);
      setEmail(location.state.registeredEmail);
    }
  }, [location.state]);

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(true);
      setResponseMessage("이름, 이메일, 비밀번호를 모두 입력해주세요.");
      return;
    }

    // 추가 검증
    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      setError(true);
      setResponseMessage("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(false);
    setResponseMessage("");

    try {
      // 로그인 요청 데이터 구성
      const data = {
        name: name,
        email: email,
        password: password,
      };

      console.log("==== 로그인 요청 정보 ====");
      console.log("BASE_URL:", BASE_URL);
      console.log("Request data:", data);
      console.log("Name value:", name);
      console.log("Email value:", email);
      console.log("Password value:", password);

      const response = await fetch(`${BASE_URL}/users/auth/login`, {
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

          setResponseMessage("로그인이 정상적으로 완료되었습니다!");

          // 프로필 페이지로 리다이렉트
          setTimeout(() => {
            navigate("/profile");
          }, 1000);
        } else {
          console.error("응답 데이터 형식이 예상과 다릅니다:", responseBody);
          setError(true);
          setResponseMessage("로그인 응답 처리 중 오류가 발생했습니다.");
        }
      } else if (response.status === 401) {
        let errorMessage =
          "등록되지 않은 정보이거나 이름, 이메일, 비밀번호가 일치하지 않습니다.";

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
          if (name.trim().length < 2) {
            errorMessage = "이름은 2글자 이상 입력해주세요.";
          } else if (email.trim().length < 5 || !email.includes("@")) {
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
      "flex w-96 h-16 px-5 py-4",
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

      <div className="flex items-center justify-center min-h-screen bg-[var(--white)] px-4">
        <div className="flex flex-col items-center w-full max-w-md">
          {/* 로고 */}
          <div className="mb-8">
            <img
              src="/wwmtLogo.svg"
              alt="언제볼까? 로고"
              className="w-16 h-16 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* 제목 */}
          <h1
            className={cn(
              typographyVariants({ variant: "h1-sb" }),
              colorVariants({ color: "gray-900" }),
              "text-[2.4rem] mb-4 text-center"
            )}
          >
            로그인
          </h1>

          {/* 회원가입 완료 안내 */}
          {registrationInfo && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p
                className={cn(
                  typographyVariants({ variant: "b2-md" }),
                  "text-green-700 text-center"
                )}
              >
                🎉 회원가입이 완료되었습니다!
              </p>
              <p
                className={cn(
                  typographyVariants({ variant: "d1-md" }),
                  "text-green-600 text-center mt-1"
                )}
              >
                이름: <strong>{registrationInfo.name}</strong> | 이메일:{" "}
                <strong>{registrationInfo.email}</strong>
              </p>
              <p
                className={cn(
                  typographyVariants({ variant: "d2-md" }),
                  "text-green-600 text-center mt-1"
                )}
              >
                ↓ 회원가입한 이름으로 로그인하세요 ↓
              </p>
            </div>
          )}

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label
                htmlFor="name"
                className={cn(
                  typographyVariants({ variant: "b2-md" }),
                  colorVariants({ color: "gray-700" }),
                  "block mb-2"
                )}
              >
                이름{" "}
                {registrationInfo && (
                  <span className="text-gray-500">(회원가입한 이름)</span>
                )}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses(
                  name.length === 0,
                  error && name.length === 0
                )}
                placeholder={
                  registrationInfo
                    ? `회원가입한 이름: ${registrationInfo.name}`
                    : "회원가입한 이름을 입력하세요"
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className={cn(
                  typographyVariants({ variant: "b2-md" }),
                  colorVariants({ color: "gray-700" }),
                  "block mb-2"
                )}
              >
                이메일{" "}
                {registrationInfo && (
                  <span className="text-gray-500">(회원가입한 이메일)</span>
                )}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses(
                  email.length === 0,
                  error && email.length === 0
                )}
                placeholder={
                  registrationInfo
                    ? `회원가입한 이메일: ${registrationInfo.email}`
                    : "회원가입한 이메일을 입력하세요"
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={cn(
                  typographyVariants({ variant: "b2-md" }),
                  colorVariants({ color: "gray-700" }),
                  "block mb-2"
                )}
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses(
                  password.length === 0,
                  error && password.length === 0
                )}
                placeholder="비밀번호를 입력하세요"
                required
              />
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

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              size="XL"
              disabled={!isFormValid || loading}
              additionalClass={cn(
                "w-full mt-6",
                colorVariants({ bg: "blue-400" }),
                "!text-[var(--white)]"
              )}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-6 text-center">
            <p className={typographyVariants({ variant: "b2-md" })}>
              <span className={colorVariants({ color: "gray-600" })}>
                계정이 없으신가요?{" "}
              </span>
              <button
                onClick={() => navigate("/register")}
                className={cn(
                  colorVariants({ color: "blue-400" }),
                  "underline hover:no-underline"
                )}
              >
                회원가입
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
