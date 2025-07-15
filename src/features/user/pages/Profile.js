import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useUserStore } from "../../../store/userStore";
import { typographyVariants } from "../../../styles/typography.ts";
import { colorVariants } from "../../../styles/color.ts";
import { Button } from "../../../components/Button.tsx";
import Loading from "../../../components/Loading";
import { cn } from "../../../utils/cn";

const Profile = () => {
  const navigate = useNavigate();
  const { name, email, userId, isLoading, error, fetchMyInfo } = useUserStore();

  useEffect(() => {
    // 토큰이 있는지 확인
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.log("토큰이 없음 - 로그인 페이지로 리다이렉트");
      navigate("/login");
      return;
    }

    // 사용자 정보가 없으면 조회
    if (!userId) {
      fetchMyInfo();
    }
  }, [userId, fetchMyInfo, navigate]);

  const handleBackToMenu = () => {
    navigate("/menu");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    useUserStore.getState().clearUser();
    navigate("/");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>내 정보 - 언제볼까?</title>
        <meta
          name="description"
          content="언제볼까? 서비스의 내 정보 페이지입니다."
        />
      </Helmet>

      <div className="flex px-[2rem] justify-between items-center h-[100vh] bg-[var(--white)] flex-col">
        <div className="flex flex-col justify-center w-full max-w-[40rem]">
          {/* 헤더 */}
          <div className="flex items-center justify-between mt-[2rem] mb-[3rem]">
            <img
              src="/btn_Back.svg"
              className="hover:cursor-pointer w-[2.4rem] h-[2.4rem]"
              alt="뒤로가기"
              onClick={handleBackToMenu}
            />
            <h1
              className={cn(
                typographyVariants({ variant: "h2-sb" }),
                colorVariants({ color: "gray-900" }),
                "text-center"
              )}
            >
              내 정보
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
              <Button
                label="다시 시도"
                size="M"
                onClick={fetchMyInfo}
                additionalClass="mt-[1rem]"
              />
            </div>
          )}

          {/* 사용자 정보 카드 */}
          <div className="bg-white border border-[var(--gray-200)] rounded-[1.2rem] p-[2rem] mb-[3rem] shadow-sm">
            <div className="flex flex-col gap-[2rem]">
              {/* 프로필 아이콘 */}
              <div className="flex justify-center mb-[1rem]">
                <div className="w-[8rem] h-[8rem] bg-[var(--blue-100)] rounded-full flex items-center justify-center">
                  <img
                    src="/User.svg"
                    alt="프로필"
                    className="w-[4rem] h-[4rem]"
                  />
                </div>
              </div>

              {/* 사용자 정보 */}
              <div className="space-y-[1.6rem]">
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
                  <div
                    className={cn(
                      "w-full px-[1.2rem] py-[1.6rem] bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-[0.8rem]",
                      typographyVariants({ variant: "b2-md" }),
                      colorVariants({ color: "gray-900" })
                    )}
                  >
                    {name}
                  </div>
                </div>

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
                  <div
                    className={cn(
                      "w-full px-[1.2rem] py-[1.6rem] bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-[0.8rem]",
                      typographyVariants({ variant: "b2-md" }),
                      colorVariants({ color: "gray-900" })
                    )}
                  >
                    {email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <Button
            label="정보 새로고침"
            size="XL"
            onClick={fetchMyInfo}
            additionalClass={cn(
              "w-full",
              colorVariants({ bg: "blue-400" }),
              "!text-[var(--white)]"
            )}
          />

          <Button
            label="로그아웃"
            size="XL"
            onClick={handleLogout}
            additionalClass={cn(
              "w-full",
              "bg-[var(--gray-100)] !text-[var(--gray-700)] border border-[var(--gray-300)]"
            )}
          />
        </div>

        {/* 하단 여백 */}
        <div className="mb-[2rem]"></div>
      </div>
    </>
  );
};

export default Profile;
