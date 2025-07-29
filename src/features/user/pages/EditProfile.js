import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useUserStore } from "../../../store/userStore";
import { typographyVariants } from "../../../styles/typography.ts";
import { colorVariants } from "../../../styles/color.ts";
import { Button } from "../../../components/Button.tsx";
import Loading from "../../../components/Loading";
import { cn } from "../../../utils/cn";

const EditProfile = () => {
  const navigate = useNavigate();
  const { name, email, userId, isLoading, error, fetchMyInfo } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noChangesError, setNoChangesError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // 토큰이 있는지 확인
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    // 사용자 정보가 없으면 조회
    if (!userId) {
      fetchMyInfo();
    }
  }, [userId, fetchMyInfo, navigate]);

  // 사용자 정보가 로드되면 폼 데이터에 설정
  useEffect(() => {
    if (name && email) {
      const userData = { name: name, email: email };
      setFormData((prev) => ({
        ...prev,
        name: name,
        email: email,
      }));
      setOriginalData(userData);
    }
  }, [name, email]);

  const handleBackToMenu = () => {
    navigate("/menu");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // 변경사항 없음 에러 메시지 초기화
    if (noChangesError) {
      setNoChangesError("");
    }
  };

  const validateForm = (changedFields) => {
    const newErrors = {};

    // 변경된 필드만 검증
    if (changedFields.name !== undefined) {
      if (!changedFields.name.trim()) {
        newErrors.name = "이름을 입력해주세요.";
      }
    }

    if (changedFields.email !== undefined) {
      if (!changedFields.email.trim()) {
        newErrors.email = "이메일을 입력해주세요.";
      } else if (!/\S+@\S+\.\S+/.test(changedFields.email)) {
        newErrors.email = "유효한 이메일 형식이 아닙니다.";
      }
    }

    if (changedFields.password !== undefined) {
      if (!changedFields.password.trim()) {
        newErrors.password = "비밀번호를 입력해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getChangedFields = () => {
    const changedFields = {};

    // 이름 변경 확인
    if (formData.name !== originalData.name) {
      changedFields.name = formData.name;
    }

    // 이메일 변경 확인 (이메일은 더 이상 수정하지 않으므로 제거)
    // if (formData.email !== originalData.email) {
    //   changedFields.email = formData.email;
    // }

    // 비밀번호 변경 확인 (빈 문자열이 아닌 경우)
    if (formData.password.trim()) {
      changedFields.password = formData.password;
    }

    return changedFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const changedFields = getChangedFields();

    // 변경된 필드가 없으면 경고 메시지 표시
    if (Object.keys(changedFields).length === 0) {
      setNoChangesError(
        "변경된 정보가 없습니다. 최소 1개 이상의 정보를 수정해주세요."
      );
      return;
    }

    // 변경된 필드만 검증
    if (!validateForm(changedFields)) {
      return;
    }

    setIsSubmitting(true);
    setNoChangesError("");

    try {
      const BASE_URL =
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_WWWM_BE_ENDPOINT
          : process.env.REACT_APP_WWWM_BE_DEV_EP;

      const token = localStorage.getItem("authToken");

      // 토큰 형식 확인 및 처리
      let authToken;
      if (token?.startsWith("Bearer ")) {
        authToken = token;
      } else if (token?.startsWith("Bearer")) {
        authToken = token.replace("Bearer", "Bearer ");
      } else {
        authToken = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(changedFields),
      });

      const responseData = await response.json();

      if (response.status === 200 && responseData.success) {
        // 성공 시 사용자 정보 새로고침 후 메뉴 페이지로 이동
        await fetchMyInfo();
        navigate("/menu");
      } else {
        // 실패 시 에러 메시지 표시
        setErrors({
          submit:
            responseData.msg ||
            "정보 업데이트에 실패했습니다. 다시 시도해주세요.",
        });
      }
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
      setErrors({ submit: "네트워크 오류가 발생했습니다. 다시 시도해주세요." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 UI와 동일한 inputClasses 함수
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>개인정보 수정 - 언제볼까?</title>
        <meta
          name="description"
          content="언제볼까? 서비스의 개인정보 수정 페이지입니다."
        />
      </Helmet>

      <div className="flex justify-center min-h-screen bg-[var(--white)]">
        <div className="flex flex-col items-center w-full h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between mt-[1.8rem] mb-[3.6rem] w-full max-w-[40rem] px-[2rem]">
            <img
              src="/btn_Back.svg"
              className="hover:cursor-pointer w-[2.4rem] h-[2.4rem]"
              alt="뒤로가기"
              onClick={handleBackToMenu}
            />
            <h1
              className={cn(
                typographyVariants({ variant: "h1-sb" }),
                colorVariants({ color: "gray-900" }),
                "text-[2rem] text-center"
              )}
            >
              개인정보 수정
            </h1>
            <div className="w-[2.4rem]"></div>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="w-auto" noValidate>
            <div className="w-full  flex flex-col items-end justify-center !space-y-[2rem]">
              {/* 이메일 필드 (수정 불가) */}
              <div className="flex flex-col items-start w-full pl-0">
                <label
                  htmlFor="email"
                  className={cn(
                    typographyVariants({ variant: "d2-md" }),
                    colorVariants({ color: "gray-600" }),
                    "block mb-[0.6rem] pl-0"
                  )}
                >
                  연결된 계정
                </label>
                <div className="flex w-full items-center justify-center">
                  <div className="relative flex-2 !w-[32rem]">
                    <div
                      className={cn(
                        "flex-1 w-[32rem] pl-[0.8rem] pr-[3rem] py-[1.2rem] !bg-[var(--gray-100)] rounded-[0.4rem] !text-[1.4rem]",
                        typographyVariants({ variant: "b3-rg" }),
                        colorVariants({ color: "gray-600" })
                      )}
                    >
                      {formData.email}
                    </div>
                  </div>
                </div>
              </div>
              {/* 이름 필드 */}
              <div className="flex flex-col items-end w-full">
                <label
                  htmlFor="name"
                  className={cn(
                    typographyVariants({ variant: "b2-md" }),
                    colorVariants({ color: "gray-700" }),
                    "block mb-2"
                  )}
                ></label>
                <div className="flex w-full items-center justify-center">
                  <div className="relative">
                    <span className="absolute top-1/2 -translate-y-1/2 left-[0.8rem] z-10 text-[var(--red-300)] text-[1.6rem]">
                      *
                    </span>
                  </div>
                  <div className="relative flex-2 !w-[32rem]">
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={cn(
                        inputClasses(
                          formData.name.length === 0,
                          errors.name && formData.name.length === 0
                        ),
                        "flex-1 w-[32rem] pl-[1.6rem] pr-[3rem] py-[1.2rem] border-0 outline-none border-b-[0.1rem] border-b-[var(--gray-300)] rounded-none",
                        typographyVariants({ variant: "h3-md" }),
                        colorVariants({ color: "gray-700" }),
                        "placeholder:text-[var(--gray-500)]"
                      )}
                      placeholder="새 이름을 입력하세요 (선택사항)"
                      
                    />
                  </div>
                </div>
                {errors.name && (
                  <div className="text-center whitespace-nowrap overflow-x-auto mt-2">
                    <span
                      className={cn(
                        typographyVariants({ variant: "b2-md" }),
                        colorVariants({ color: "red-300" })
                      )}
                    >
                      {errors.name}
                    </span>
                  </div>
                )}
              </div>

           

              {/* 비밀번호 필드 */}
              <div className="flex flex-col items-end w-full">
                <label
                  htmlFor="password"
                  className={cn(
                    typographyVariants({ variant: "b2-md" }),
                    colorVariants({ color: "gray-700" }),
                    "block mb-2"
                  )}
                ></label>
                <div className="flex w-full items-center justify-center">
                  <div className="relative">
                    <span className="absolute top-1/2 -translate-y-1/2 left-[0.8rem] z-10 text-[var(--red-300)] text-[1.6rem]">
                      *
                    </span>
                  </div>
                  <div className="relative flex-2 !w-[32rem]">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={cn(
                        inputClasses(
                          formData.password.length === 0,
                          errors.password && formData.password.length === 0
                        ),
                        "flex-1 w-[32rem] pl-[1.6rem] pr-[5rem] py-[1.2rem] border-0 outline-none border-b-[0.1rem] border-b-[var(--gray-300)] rounded-none",
                        typographyVariants({ variant: "h3-md" }),
                        colorVariants({ color: "gray-700" }),
                        "placeholder:text-[var(--gray-500)]"
                      )}
                      placeholder="새 비밀번호를 입력하세요 (선택사항)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-10 right-2 top-1/2 -translate-y-1/2 flex items-center justify-center"
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
                {errors.password && (
                  <div className="text-center whitespace-nowrap overflow-x-auto mt-2">
                    <span
                      className={cn(
                        typographyVariants({ variant: "b2-md" }),
                        colorVariants({ color: "red-300" })
                      )}
                    >
                      {errors.password}
                    </span>
                  </div>
                )}
              </div>

              
            </div>
            {/* 일반 에러 메시지 */}
            {(noChangesError || errors.submit) && (
                <div className="text-center  absolute z-[9999] whitespace-nowrap overflow-x-auto">
                  <span
                    className={cn(
                      typographyVariants({ variant: "b2-md" }),
                      colorVariants({ color: "red-300" }),
                      "!text-[1.2rem]   justify-start flex z-[9999]"
                    )}
                  >
                    {noChangesError || errors.submit}
                  </span>
                </div>
              )}
            {/* 저장 버튼 */}
            <Button
              type="submit"
              size="L"
              disabled={isSubmitting}
              additionalClass={cn(
                "rounded-[0.8rem] mt-[6.4rem]",
                "border border-[var(--blue-500)] bg-[var(--white)] text-[var(--blue-500)] shadow-[1px_1px_0_0_var(--blue-500)]",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "저장 중..." : "저장하기"}
            </Button>
          </form>
          
        </div>
      </div>
    </>
  );
};

export default EditProfile;
