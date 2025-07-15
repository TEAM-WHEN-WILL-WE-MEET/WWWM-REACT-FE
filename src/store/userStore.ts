import { create } from "zustand";
import { Schedule } from "./types";

interface UserState {
  name: string;
  id: string | null;
  email: string;
  userId: string | null;
  firstLogin: boolean;
  userSchedule: Schedule[];
  isLoading: boolean;
  error: string | null;

  // actions
  setUser: (name: string, id: string | null) => void;
  setUserInfo: (userName: string, isFirstLogin: boolean) => void;
  setMyInfo: (userId: string, name: string, email: string) => void;
  setFirstLogin: (value: boolean) => void;
  setUserSchedule: (schedule: Schedule[]) => void;
  clearUser: () => void;
  fetchMyInfo: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  name: "",
  id: null,
  email: "",
  userId: null,
  firstLogin: false,
  userSchedule: [],
  isLoading: false,
  error: null,

  setUser: (name: string, id: string | null) => set({ name, id }),

  setUserInfo: (userName: string, isFirstLogin: boolean) =>
    set({ name: userName, firstLogin: isFirstLogin }),

  setMyInfo: (userId: string, name: string, email: string) =>
    set({ userId, name, email, error: null }),

  setFirstLogin: (value: boolean) => set({ firstLogin: value }),

  setUserSchedule: (schedule: Schedule[]) => set({ userSchedule: schedule }),

  clearUser: () =>
    set({
      name: "",
      id: null,
      email: "",
      userId: null,
      firstLogin: false,
      userSchedule: [],
      error: null,
    }),

  fetchMyInfo: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      set({ error: "인증 토큰이 없습니다." });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const BASE_URL =
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_WWWM_BE_ENDPOINT
          : process.env.REACT_APP_WWWM_BE_DEV_EP;

      // console.log("=== 내 정보 조회 API 호출 ===");
      // console.log("BASE_URL:", BASE_URL);
      // console.log("토큰 존재:", token ? "있음" : "없음");
      // console.log("토큰 길이:", token ? token.length : 0);
      // console.log("토큰 원본:", JSON.stringify(token));
      // console.log(
      //   "토큰 시작 부분:",
      //   token ? token.substring(0, 20) + "..." : "없음"
      // );

      // 토큰 trim 처리 후 확인
      const trimmedToken = token?.trim();
      // console.log("토큰 trim 후:", JSON.stringify(trimmedToken));

      // 토큰 형식 확인 및 처리
      const startsWithBearer = trimmedToken?.startsWith("Bearer");
      // console.log("토큰에 Bearer 포함 여부:", startsWithBearer);
      // console.log("Bearer 체크:", {
      //   hasBearer: trimmedToken?.includes("Bearer"),
      //   startsWithBearer: trimmedToken?.startsWith("Bearer"),
      //   startsWithBearerSpace: trimmedToken?.startsWith("Bearer "),
      // });

      // Bearer로 시작하면 그대로 사용, 아니면 Bearer 추가
      let authToken;
      if (startsWithBearer) {
        // Bearer로 시작하지만 공백이 없으면 공백 추가
        if (trimmedToken?.startsWith("Bearer ")) {
          authToken = trimmedToken; // 이미 정상 형태
        } else {
          // "BearereyJhbGciOiJIUzI1UiJ9..." -> "Bearer eyJhbGciOiJIUzI1UiJ9..."
          authToken = trimmedToken?.replace("Bearer", "Bearer ");
        }
      } else {
        authToken = `Bearer ${trimmedToken}`;
      }
      // console.log("최종 인증 토큰:", authToken.substring(0, 20) + "...");

      const url = `${BASE_URL}/users/me`;
      // console.log("API 요청 URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: authToken,
          "Cache-Control": "no-cache",
        },
      });

      // console.log("응답 상태:", response.status);

      const responseData = await response.json();
      // console.log("응답 데이터:", responseData);

      if (response.status === 200) {
        // API 명세서에 따른 응답 구조 확인
        if (responseData.status === "OK" && responseData.success) {
          const { userId, name, email } = responseData.object;

          set({
            userId,
            name,
            email,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            error: responseData.msg || "사용자 정보를 가져올 수 없습니다.",
            isLoading: false,
          });
        }
      } else if (response.status === 500) {
        // 500 에러 시 서버 응답 메시지 표시
        const errorMsg =
          responseData.error ||
          responseData.message ||
          "서버 오류가 발생했습니다.";
        set({
          error: `서버 오류: ${errorMsg}`,
          isLoading: false,
        });
      } else {
        const errorMsg =
          responseData.msg ||
          responseData.error ||
          "사용자 정보를 가져올 수 없습니다.";
        set({
          error: `오류 (${response.status}): ${errorMsg}`,
          isLoading: false,
        });
      }
    } catch (error) {
      // console.error("내 정보 조회 실패:", error);
      set({
        error: "네트워크 오류가 발생했습니다.",
        isLoading: false,
      });
    }
  },
}));
