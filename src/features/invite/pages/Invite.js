// Invite.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { typographyVariants } from "../../../styles/typography.ts";
import { colorVariants, colors } from "../../../styles/color.ts";
import { cn } from "../../../utils/cn";
import { Button } from "../../../components/Button.tsx";
import { Helmet } from "react-helmet-async";
import "../styles/invite.css";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "../../../components/Loading";
import { useInviteStore } from "../../../store/index.ts";
// import { tryParse } from 'firebase-tools/lib/utils';

const Invite = () => {
  // NODE_ENV에 기반하여 BASE_URL에 환경변수 할당
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_WWWM_BE_ENDPOINT
      : process.env.REACT_APP_WWWM_BE_DEV_EP;
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const appointmentId = queryParams.get("appointmentId");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [buttonText, setButtonText] = useState("로그인");
  const [isChecked, setIsChecked] = useState(false);
  const [isVisuallyChecked, setIsVisuallyChecked] = useState(false);

  const {
    inviteCode,
    isLoading,
    setInviteCode,
    setLoading: setStoreLoading,
    setError: setStoreError,
  } = useInviteStore();

  //form 유효한지 검사
  const isFormValid =
    name.trim().length > 0 && password.trim().length > 0 && !responseMessage;

  // JWT 토큰 디코딩 함수
  const decodeJWT = (token) => {
    try {
      // JWT는 header.payload.signature 형태로 구성됨
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT token format");
      }

      // payload 부분 (두 번째 부분) 디코딩
      const payload = parts[1];

      // base64 URL 디코딩을 위해 패딩 추가
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

      // base64 디코딩 후 JSON 파싱
      const decoded = JSON.parse(atob(padded));
      return decoded;
    } catch (error) {
      console.error("JWT 디코딩 실패:", error);
      return null;
    }
  };

  // 토큰에서 사용자명 추출 함수
  const extractUsernameFromToken = (token) => {
    if (!token || typeof token !== "string") {
      console.warn("유효하지 않은 토큰입니다.");
      return null;
    }

    const payload = decodeJWT(token);
    if (!payload) {
      console.warn("토큰 페이로드 디코딩에 실패했습니다.");
      return null;
    }

    // 다양한 필드명으로 사용자명 시도 (우선순위 순)
    const username =
      payload.username ||
      payload.name ||
      payload.email?.split("@")[0] || // 이메일에서 @ 앞부분만 추출
      payload.sub ||
      null;

    if (!username) {
      console.warn("토큰에서 사용자명을 찾을 수 없습니다. 페이로드:", payload);
      return null;
    }

    return username;
  };

  // 토큰 유효성 검사 함수
  const validateToken = async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  // 토큰 기반 자동 로그인 확인
  useEffect(() => {
    const checkTokenAndAutoLogin = async () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        setStoreLoading(true);
        const isValidToken = await validateToken(token);

        if (isValidToken) {
          // 유효한 토큰이면 직접 약속 정보 가져오기
          try {
            const appointmentResponse = await fetch(
              `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Cache-Control": "no-cache",
                },
              }
            );

            if (appointmentResponse.ok) {
              const appointmentData = await appointmentResponse.json();

              // 토큰에서 사용자명 추출
              const userName = extractUsernameFromToken(token);

              if (!userName) {
                console.warn(
                  "토큰에서 사용자명 추출 실패, 토큰 삭제 후 로그인 폼으로 이동"
                );
                localStorage.removeItem("authToken");
                setStoreLoading(false);
                return;
              }

              console.log("자동 로그인 - 추출된 사용자명:", userName);

              const responseData = {
                ...appointmentData,
                firstLogin: false, // 토큰이 있으면 재로그인으로 간주
              };

              navigate("/eventCalendar", {
                state: { responseData, appointmentId, userName },
              });
            } else {
              // 약속 정보 가져오기 실패 시 토큰 삭제
              localStorage.removeItem("authToken");
            }
          } catch (error) {
            console.error("Auto login error:", error);
            localStorage.removeItem("authToken");
          }
        } else {
          // 유효하지 않은 토큰이면 삭제
          localStorage.removeItem("authToken");
        }
        setStoreLoading(false);
      }
      // 토큰이 없으면 로그인 폼 표시 (아무것도 하지 않음)
    };

    if (appointmentId) {
      checkTokenAndAutoLogin();
    }
  }, [appointmentId, BASE_URL, navigate, setStoreLoading]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");

    if (code) {
      setInviteCode(code);
      // 여기에 초대 코드 검증 로직 추가
    } else {
      setStoreError("유효하지 않은 초대 링크입니다.");
    }
  }, [location.search, setInviteCode, setStoreError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.trim() === "") {
      setError(true);
    } else {
      setError(false);

      const data = {
        email: name,
        password: password,
      };
      setStoreLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/users/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.status === 200) {
          const responseData = await response.json();
          setResponseMessage("로그인이 정상적으로 완료되었습니다!");
          setShowToast(true);
          // console.log("response: ", responseData);

          // Bearer 토큰 저장
          const token = responseData.object;
          localStorage.setItem("authToken", token);

          // 토큰에서 사용자명 추출하여 로깅 (디버깅 목적)
          const tokenUserName = extractUsernameFromToken(token);
          console.log(
            "로그인 성공 - 입력된 이름:",
            name,
            "토큰의 사용자명:",
            tokenUserName
          );

          const appointmentResponse = await fetch(
            `${BASE_URL}/appointment/getAppointment?appointmentId=${appointmentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
              },
            }
          );
          if (appointmentResponse.ok) {
            const appointmentData = await appointmentResponse.json();
            //  console.log("저쪽 invite.js 신사 분이 보내주신 전체 인원의 스케줄 정보: ", appointmentData);

            const userScheduleResponse = await fetch(
              `${BASE_URL}/schedule/getUserSchedule?appointmentId=${appointmentId}&userName=${name}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Cache-Control": "no-cache",
                },
              }
            );

            let responseData;
            // console.log("userScheduleResponse: ", userScheduleResponse);

            if (userScheduleResponse.ok) {
              const userScheduleData = await userScheduleResponse.json();
              // console.log('invite.js, 서버에서 받아온 유저 개인 스케줄정보:', userScheduleData);

              //재로그인 case
              if (
                userScheduleData.object &&
                userScheduleData.object.length > 0
              ) {
                // responseData = userScheduleData;
                // responseData.firstLogin = false;
                // console.log("[재로그인 사용자]");
                // console.log("응답데이터::: ", responseData);
                // console.log("약속id:", appointmentId);
                // console.log("재로그인한 사용자 이름", name);
                responseData = {
                  ...appointmentData,
                  userSchedule: userScheduleData.object,
                  firstLogin: false,
                };

                //   console.log("(((재로그인))))저쪽 invite.js 신사 분이 보내주신 재로그인시의 responseData 구조:", {
                //     ...appointmentData,
                //     userSchedule: userScheduleData.object,
                //     firstLogin: false
                // });
                // console.log("invite.js가 보낸 userSchedule: ", userScheduleData.object);
              } else {
                //첫로그인 case
                responseData = {
                  ...appointmentData,
                  firstLogin: true,
                };
              }
            } else {
              setResponseMessage("약속 정보를 가져오는데 실패했습니다.");
              return;
            }
            navigate("/eventCalendar", {
              state: { responseData, appointmentId, userName: name },
            });
          } else {
            setResponseMessage("사용자 스케줄을 가져오는데 실패했습니다.");
          }
        } else if (response.status === 404) {
          setResponseMessage("등록되지 않은 이름입니다.");
        } else if (response.status === 400) {
          setResponseMessage("비밀번호가 일치하지 않습니다.");
        } else if (response.status === 500) {
          setResponseMessage("서버 오류가 발생했습니다.");
        } else {
          setResponseMessage("알 수 없는 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("Error:", error);
        setResponseMessage("서버 오류가 발생했습니다.");
      } finally {
        setStoreLoading(false);
      }
    }
  };

  const inputClasses = (isEmpty, hasError) =>
    cn(
      "flex w-96 h-16 px-5 py-4",
      "items-center flex-shrink-0 rounded-lg",
      "border border-gray-300",
      typographyVariants({ variant: "b2-md" }),
      {
        "input-empty": isEmpty,
        "input-filled": !isEmpty,
        "outline outline-1 outline-red-500 outline-offset-0": hasError,
      }
    );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="invite-error-container">
        <p className={cn(typographyVariants.h3)}>{error}</p>
        <Button onClick={() => navigate("/")}>홈으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>언제볼까?</title>
        <meta
          name="description"
          content="언제볼까?와 함께 약속방을 링크 공유로 초대하세요. 공유만 하면 끝, 간편한 친구 초대!"
        />
      </Helmet>
      <div className="flex px-[2rem] justify-between  items- h-[80rem] bg-[var(--white)] flex-col ">
        <div className="flex flex-col justify-center ">
          <img
            src="/home_noPadding.svg"
            className="hover:cursor-pointer items-start mt-[1.6rem] w-[2.4rem] h-[2.4rem]"
            alt="홈으로 돌아가기"
            onClick={() => navigate("/MonthView")}
          />
          <div
            className={cn(
              typographyVariants({ variant: "h1-sb" }),
              colorVariants({ color: "gray-900" }),
              `!text-[2rem] !items-start !w-full mt-[2.3rem] `
            )}
          >
            <div
              className={`
      !text-left
      !self-start
      `}
            >
              이 캘린더에 참여하려면
            </div>
            <div
              className={`
      !text-left
      !self-start
      `}
            >
              아래 정보를 입력해주세요.
            </div>
          </div>

          <div
            className={`
      ${colorVariants({ bg: "white" })} 
      ${colorVariants({ color: "gray-800" })} 
      w-[32rem] 
      mt-[3.2rem]
      items-center
      
      flex
      flex-col
      !gap-y-[2rem]
    `}
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center justify-center w-full !h-auto flex gap-y-[2rem]"
            >
              <div className=" flex flex-col ">
                <label
                  htmlFor="name"
                  className={`
              ${typographyVariants({ variant: "d1-sb" })} 
              ${colorVariants({ color: "gray-800" })} 
              tracking-[-0.3px]
              p-0
              !text-[var(--font-size-12)]
            `}
                ></label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched(true)} // input을 떠날 때 touched 활성화
                  onFocus={() => setTouched(true)} // input을 클릭했을 때 touched 활성화
                  className={`
              border
              border-[var(--gray-300,#E0E0E0)] 
              ${
                !name
                  ? `
                placeholder-[var(--gray-700,#E0E0E0)] 
                `
                  : ` 
                placeholder-[var(--gray-900,#E0E0E0)] 
                `
              }
          ${typographyVariants({ variant: "b2-md" })} 
          flex 
          w-[32rem] 
          px-[0.4rem] 
          py-[1.2rem] 
          items-center 
          gap-[1rem] 
          flex-shrink-0
          border-[var(--white)] 
          border-b-[var(--gray-300,#E0E0E0)] 
            ${
              touched && (!name || name.trim().length === 0)
                ? "!border-b-[var(--red-300)]"
                : ""
            }
            `}
                  placeholder="참여자 이름"
                  aria-label="참여자 이름 작성란"
                />
                {touched && (!name || name.trim().length === 0) && (
                  <p
                    className={`
              ${colorVariants({ color: "red-300" })} 
              ${typographyVariants({ variant: "b2-md" })} 
              bg-transparent
              pt-[0.8rem]
              pl-[0.4rem]
            `}
                    aria-live="assertive" //에러 메시지가 발생하자마자 스크린 리더가 바로 내용을 읽음
                  >
                    이름을 1자 이상 입력해주세요.
                  </p>
                )}
              </div>

              <div className="">
                <label
                  htmlFor="password"
                  className={`
              ${typographyVariants({ variant: "d1-sb" })} 
              ${colorVariants({ color: "gray-800" })} 
              tracking-[-0.3px]
              p-0
            `}
                ></label>

                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="내 비밀번호 설정"
                  className={`
                  border
                  border-[var(--gray-300,#E0E0E0)] 
                  ${
                    !password
                      ? `
                    placeholder-[var(--gray-700,#E0E0E0)] 
                    `
                      : ` 
                    placeholder-[var(--gray-900,#E0E0E0)] 
                    `
                  }
              ${typographyVariants({ variant: "b2-md" })} 
              flex 
              w-[32rem] 
              h-[4rem] 
              px-[0.4rem] 
              py-[1.2rem] 
              items-center 
              gap-[1rem] 
              flex-shrink-0
              border-[var(--white)] 
              border-b-[var(--gray-300,#E0E0E0)] 
              ${responseMessage ? "!  !border-b-[var(--red-300)] " : ""}
            `}
                  aria-label="참여자 비밀번호 작성란"
                />
                {responseMessage && (
                  <p
                    className={`
              ${colorVariants({ color: "red-300" })} 
              ${typographyVariants({ variant: "b2-md" })} 
              bg-transparent
              pt-[0.8rem]
              pl-[0.4rem]
            `}
                    aria-live="assertive" //에러 메시지가 발생하자마자 스크린 리더가 바로 내용을 읽음
                  >
                    {responseMessage}
                  </p>
                )}
              </div>
            </form>
            <div className="w-full flex flex-col !items-end !justify-end  ">
              <input
                type="checkbox"
                id="Keep-logged-in"
                className="invite-screen-reader"
                checked={isVisuallyChecked || isChecked}
                onChange={(e) => {
                  setIsChecked(e.target.checked);
                  setIsVisuallyChecked(e.target.checked);
                }}
              />
              <div className="invite-label-box">
                <label
                  htmlFor="Keep-logged-in"
                  className={`${typographyVariants({ variant: "b2-md" })} 
            !text-[1.4rem]
            ${
              isVisuallyChecked || isChecked
                ? colorVariants({ color: "gray-900" })
                : colorVariants({ color: "gray-700" })
            }`}
                >
                  <span className="invite-check-icon" aria-hidden="true"></span>
                  로그인 유지하기
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="">
          <AnimatePresence>
            {showToast && (
              <motion.div
                className="  mb-[1.6rem] left-0 right-0 flex justify-center "
                initial={{ y: "800%" }}
                animate={{ y: 0 }}
                exit={{ y: "400%" }}
                transition={{ duration: 0.01, ease: "easeOut" }}
              >
                <Button
                  label="로그인 성공!"
                  size={"toast"}
                  // onClick={handleSaveClick}
                  additionalClass={`
                    z-50 pointer-events-none 
                    py-[0.8rem]
                    px-[1.2rem]
                    rounded-[0.8rem] border !bg-white,
                    !text-[var(--blue-400)]
                    border-[var(--blue-300)]
                    shadow-[0px_0px_8px_0px_var(--blue-100)]
                    ${typographyVariants({ variant: "d1-sb" })}, 
                    text-center tracking-[-0.3px]
                    !text-[1.2rem]
                    gap-[0.4rem]
                     !justify-end
                     !items-center
                    w-[10.1rem]
                    h-[3.2rem]
                    whitespace-nowrap
                    `}
                >
                  <img src="check_blue.svg" alt="체크모양 아이콘" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            label={buttonText}
            size={"XL"}
            disabled={!isFormValid} // 폼이 유효하지 않으면 버튼 비활성화
            onClick={handleSubmit}
            additionalClass={` 
            ${colorVariants({
              bg: "blue-400",
            })} !text-[var(--white)] !mb-[4rem]  items-center !transform-none`}
            a
            ria-label="새로 참여하기 버튼"
          />
        </div>
      </div>
    </>
  );
};

export default Invite;
