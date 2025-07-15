import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { typographyVariants } from "../../../styles/typography.ts";
import { colorVariants } from "../../../styles/color.ts";
import { cn } from "../../../utils/cn";
import { Button } from "../../../components/Button.tsx";
import Loading from "../../../components/Loading";

const Register = () => {
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_WWWM_BE_ENDPOINT
      : process.env.REACT_APP_WWWM_BE_DEV_EP;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(false);

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(true);
      if (password !== confirmPassword) {
        setResponseMessage("비밀번호가 일치하지 않습니다.");
      } else {
        setResponseMessage("모든 필드를 입력해주세요.");
      }
      return;
    }

    setLoading(true);
    setError(false);
    setResponseMessage("");

    try {
      // 기존 로그인 방식과 동일한 구조도 시도
      const requestData = {
        email: email,
        password: password,
        name: name,
      };

      console.log("회원가입 요청 정보:");
      console.log("BASE_URL:", BASE_URL);
      console.log("Full URL:", `${BASE_URL}/users/auth/register`);
      console.log("Request body:", requestData);

      // 회원가입 API 호출
      const endpoint = `/users/auth/signup`;

      console.log(`회원가입 API 호출: ${BASE_URL}${endpoint}`);
      console.log(`사용하는 데이터:`, requestData);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log(`API 응답 상태:`, response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response body:", errorText);
      }

      if (response.status === 201 || response.status === 200) {
        setResponseMessage(
          `회원가입이 완료되었습니다! 로그인 시 이름: "${name}", 이메일: "${email}"을 사용하세요.`
        );

        // 로그인 페이지로 이동할 때 회원가입 정보를 state로 전달
        setTimeout(() => {
          navigate("/login", {
            state: {
              registeredName: name,
              registeredEmail: email,
              message: `회원가입한 이름(${name}) 또는 이메일(${email})로 로그인하세요.`,
            },
          });
        }, 2000);
      } else if (response.status === 409) {
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
        <title>회원가입 - 언제볼까?</title>
        <meta name="description" content="언제볼까? 서비스에 회원가입하세요." />
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
              "text-[2.4rem] mb-8 text-center"
            )}
          >
            회원가입
          </h1>

          {/* 회원가입 폼 */}
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
                이름
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
                placeholder="이름을 입력하세요"
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
                이메일
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
                placeholder="이메일을 입력하세요"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className={cn(
                  typographyVariants({ variant: "b2-md" }),
                  colorVariants({ color: "gray-700" }),
                  "block mb-2"
                )}
              >
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses(
                  confirmPassword.length === 0,
                  error &&
                    (confirmPassword.length === 0 ||
                      password !== confirmPassword)
                )}
                placeholder="비밀번호를 다시 입력하세요"
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
                {error && (
                  <button
                    onClick={() => navigate("/login")}
                    className={cn(
                      "mt-2 text-sm underline hover:no-underline",
                      "text-blue-600 hover:text-blue-800"
                    )}
                  >
                    기존 계정으로 로그인하기
                  </button>
                )}
              </div>
            )}

            {/* 회원가입 버튼 */}
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
              {loading ? "회원가입 중..." : "회원가입"}
            </Button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-6 text-center">
            <p className={typographyVariants({ variant: "b2-md" })}>
              <span className={colorVariants({ color: "gray-600" })}>
                이미 계정이 있으신가요?{" "}
              </span>
              <button
                onClick={() => navigate("/login")}
                className={cn(
                  colorVariants({ color: "blue-400" }),
                  "underline hover:no-underline"
                )}
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
