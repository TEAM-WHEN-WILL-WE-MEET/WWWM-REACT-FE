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

  const handleBackToProfile = () => {
    navigate("/profile");
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

    // 이메일 변경 확인
    if (formData.email !== originalData.email) {
      changedFields.email = formData.email;
    }

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
        // 성공 시 사용자 정보 새로고침 후 프로필 페이지로 이동
        await fetchMyInfo();
        navigate("/profile");
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>내 정보 수정 - 언제볼까?</title>
        <meta
          name="description"
          content="언제볼까? 서비스의 내 정보 수정 페이지입니다."
        />
      </Helmet>

      <div className="flex px-[2rem] justify-between items-center min-h-[100vh] bg-[var(--white)] flex-col">
        <div className="flex flex-col justify-center w-full max-w-[40rem]">
          {/* 헤더 */}
          <div className="flex items-center justify-between mt-[2rem] mb-[3rem]">
            <img
              src="/btn_Back.svg"
              className="hover:cursor-pointer w-[2.4rem] h-[2.4rem]"
              alt="뒤로가기"
              onClick={handleBackToProfile}
            />
            <h1
              className={cn(
                typographyVariants({ variant: "h2-sb" }),
                colorVariants({ color: "gray-900" }),
                "text-center"
              )}
            >
              내 정보 수정
            </h1>
            <div className="w-[2.4rem]"></div> {/* 중앙 정렬을 위한 빈 공간 */}
          </div>

          {/* 에러 상태 */}
          {error && (
            <div className="mb-[2rem] p-[1.6rem] bg-red-50 border border-red-200 rounded-lg">
              <p
                className={cn(
                  typographyVariants({ variant: "b2-md" }),
                  colorVariants({ color: "red-500" })
                )}
              >
                {error}
              </p>
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-[2rem]">
            {/* 이름 필드 */}
            <div>
              <label
                className={cn(
                  typographyVariants({ variant: "d1-sb" }),
                  colorVariants({ color: "gray-600" }),
                  "block mb-[0.8rem]"
                )}
              >
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={cn(
                  "w-full px-[1.2rem] py-[1.6rem] bg-[var(--white)] border rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)]",
                  errors.name ? "border-red-500" : "border-[var(--gray-300)]",
                  typographyVariants({ variant: "b2-md" }),
                  colorVariants({ color: "gray-900" })
                )}
                placeholder="이름을 입력하세요"
              />
              {errors.name && (
                <p
                  className={cn(
                    typographyVariants({ variant: "d2-md" }),
                    colorVariants({ color: "red-500" }),
                    "mt-[0.4rem]"
                  )}
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* 이메일 필드 */}
            <div>
              <label
                className={cn(
                  typographyVariants({ variant: "d1-sb" }),
                  colorVariants({ color: "gray-600" }),
                  "block mb-[0.8rem]"
                )}
              >
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={cn(
                  "w-full px-[1.2rem] py-[1.6rem] bg-[var(--white)] border rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)]",
                  errors.email ? "border-red-500" : "border-[var(--gray-300)]",
                  typographyVariants({ variant: "b2-md" }),
                  colorVariants({ color: "gray-900" })
                )}
                placeholder="이메일을 입력하세요"
              />
              {errors.email && (
                <p
                  className={cn(
                    typographyVariants({ variant: "d2-md" }),
                    colorVariants({ color: "red-500" }),
                    "mt-[0.4rem]"
                  )}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* 비밀번호 필드 */}
            <div>
              <label
                className={cn(
                  typographyVariants({ variant: "d1-sb" }),
                  colorVariants({ color: "gray-600" }),
                  "block mb-[0.8rem]"
                )}
              >
                비밀번호
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={cn(
                  "w-full px-[1.2rem] py-[1.6rem] bg-[var(--white)] border rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)]",
                  errors.password
                    ? "border-red-500"
                    : "border-[var(--gray-300)]",
                  typographyVariants({ variant: "b2-md" }),
                  colorVariants({ color: "gray-900" })
                )}
                placeholder="새 비밀번호를 입력하세요 (변경하지 않으려면 비워두세요)"
              />
              {errors.password && (
                <p
                  className={cn(
                    typographyVariants({ variant: "d2-md" }),
                    colorVariants({ color: "red-500" }),
                    "mt-[0.4rem]"
                  )}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* 버튼들 */}
            <div className="pt-[1rem]">
              <Button
                label={isSubmitting ? "저장 중..." : "저장"}
                size="XL"
                type="submit"
                disabled={isSubmitting}
                additionalClass={cn(
                  "w-full mb-[1.2rem]",
                  colorVariants({ bg: "blue-500" }),
                  "!text-[var(--white)]",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              />

              {/* 변경사항 없음 경고 메시지 */}
              {noChangesError && (
                <div className="mb-[1.2rem] p-[1.2rem] bg-orange-50 border border-orange-200 rounded-lg">
                  <p
                    className={cn(
                      typographyVariants({ variant: "b2-md" }),
                      colorVariants({ color: "orange-600" })
                    )}
                  >
                    {noChangesError}
                  </p>
                </div>
              )}

              {/* 제출 에러 메시지 */}
              {errors.submit && (
                <div className="mb-[1.2rem] p-[1.6rem] bg-red-50 border border-red-200 rounded-lg">
                  <p
                    className={cn(
                      typographyVariants({ variant: "b2-md" }),
                      colorVariants({ color: "red-500" })
                    )}
                  >
                    {errors.submit}
                  </p>
                </div>
              )}

              <Button
                label="취소"
                size="XL"
                onClick={handleBackToProfile}
                additionalClass={cn(
                  "w-full",
                  "bg-[var(--gray-100)] !text-[var(--gray-700)] border border-[var(--gray-300)]"
                )}
              />
            </div>
          </form>
        </div>

        {/* 하단 여백 */}
        <div className="mb-[2rem]"></div>
      </div>
    </>
  );
};

export default EditProfile;
