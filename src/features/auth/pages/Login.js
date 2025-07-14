import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(false);

  const isFormValid = name.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(true);
      setResponseMessage("이름과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(false);
    setResponseMessage("");

    try {
      const response = await fetch(`${BASE_URL}/users/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: name,
          password: password,
        }),
      });

      if (response.status === 200) {
        const responseData = await response.json();
        const token = responseData.object;

        // 토큰 저장
        localStorage.setItem("authToken", token);

        setResponseMessage("로그인이 정상적으로 완료되었습니다!");

        // 프로필 페이지로 리다이렉트
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      } else if (response.status === 401) {
        setError(true);
        setResponseMessage("등록되지 않은 이름입니다.");
      } else if (response.status === 400) {
        setError(true);
        setResponseMessage("비밀번호가 일치하지 않습니다.");
      } else {
        setError(true);
        setResponseMessage("로그인에 실패했습니다.");
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
              "text-[2.4rem] mb-8 text-center"
            )}
          >
            로그인
          </h1>

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
