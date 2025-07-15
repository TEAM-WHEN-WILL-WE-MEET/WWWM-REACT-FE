import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Button } from "../../../../components/Button.tsx";
import { fetchApi } from "../../../../utils/api.ts";
import { API_ENDPOINTS } from "../../../../config/environment.ts";

import { colors, colorVariants } from "../../../../styles/color.ts";
import { typographyVariants } from "../../../../styles/typography.ts";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(true);

  const closeSidebar = () => setIsOpen(false);
  const navigate = useNavigate();
  // 2) 체크박스에서 선택된 아이템의 id들을 별도로 저장
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelected, setisSelected] = useState(false);

  // 모달 열림/닫힘 상태
  const [showModal, setShowModal] = useState(false);
  const [showModalLogOut, setShowModalLogOut] = useState(false);

  // API에서 받아온 약속 데이터
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 API에서 약속 데이터 가져오기
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchApi(API_ENDPOINTS.GET_USER_APPOINTMENTS);

        if (response.success && response.object) {
          // API 응답 데이터를 기존 UI 구조에 맞게 변환
          const transformedItems = response.object.map((appointment) => ({
            id: appointment.id,
            title: appointment.name,
            // 만료일까지 남은 일수 계산
            daysLeft: Math.ceil(
              (new Date(appointment.expireAt) - new Date()) /
                (1000 * 60 * 60 * 24)
            ),
          }));
          setItems(transformedItems);
        }
      } catch (err) {
        console.error("약속 데이터 가져오기 실패:", err);
        setError(err.message);
        // 에러 시 빈 배열로 설정
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const [isChecked, setIsChecked] = useState(false);
  const [isVisuallyChecked, setIsVisuallyChecked] = useState(false);
  // 체크박스(선택) 모드 활성화 여부: 하나의 항목 클릭 시 true로 변경
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  // 전체(또는 제목) 클릭 시, selectedIds 토글
  const handleToggleSelect = (id) => {
    if (!isSelectionMode) setIsSelectionMode(true);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 캘린더 제목 클릭 시 이벤트 캘린더로 이동
  const handleTitleClick = (appointmentId) => {
    if (isSelectionMode) {
      // 선택 모드일 때는 선택/해제 기능
      handleToggleSelect(appointmentId);
    } else {
      // 선택 모드가 아닐 때는 EventCalendar로 이동
      navigate("/eventCalendar", {
        state: {
          appointmentId: appointmentId,
          userName: "사용자", // 실제 사용자 이름으로 대체 필요
        },
      });
    }
  };

  // 제목 길게 누르기로 선택 모드 활성화
  const handleTitleLongPress = (appointmentId) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([appointmentId]);
    }
  };

  // 터치 이벤트 상태 관리
  const [touchTimer, setTouchTimer] = useState(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);

  const handleTouchStart = (appointmentId) => {
    setLongPressTriggered(false);
    const timer = setTimeout(() => {
      setLongPressTriggered(true);
      handleTitleLongPress(appointmentId);
    }, 500); // 0.5초 길게 누르기
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const handleClickWithLongPress = (appointmentId) => {
    if (!longPressTriggered) {
      handleTitleClick(appointmentId);
    }
    setLongPressTriggered(false);
  };

  // 3) 리스트 아이템을 클릭(혹은 체크박스 클릭)할 때, 해당 id를 추가/제거
  const handleItemClick = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 삭제하기 버튼을 누르면 모달 띄움
  const handleDeleteButtonClick = () => {
    setShowModal(true);
  };
  // 로그아웃 버튼 누르면 모달 띄움
  const handleLogOutButtonClick = () => {
    setShowModalLogOut(true);
  };

  const handleProfileClick = () => {
    console.log("개인정보 수정 버튼 클릭됨 - 프로필 페이지로 이동");
    navigate("/profile");
  };

  const handleLogOut = () => {
    setShowModalLogOut(false);
  };

  // 모달에서 '삭제' 버튼 클릭 → 선택된 아이템들을 삭제 처리
  const handleConfirmDelete = () => {
    setItems(items.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]); // 선택 상태 초기화
    setShowModal(false);
    setIsSelectionMode(false); // 선택 모드 해제
  };

  // 모달에서 '취소' 버튼 클릭
  const handleCancelDelete = () => {
    setShowModal(false);
  };

  return isOpen ? (
    <>
      <Helmet>
        <title>언제볼까?</title>
        <meta
          name="description"
          content="언제볼까?와 함께 약속방을 링크 공유로 초대하세요. 공유만 하면 끝, 간편한 친구 초대!"
        />
      </Helmet>

      <div className="flex  w-full justify-between  items  bg-[var(--white)] flex-col ">
        <div className="justify-end flex p-[0.8rem] pb-0 pt-[1.2rem]">
          <button onClick={closeSidebar} className={`items-end p-[1.2rem]`}>
            <img
              src="/icon_X_noBg.svg"
              alt="달력 페이지로 돌아가기"
              onClick={() => navigate("/MonthView")}
            />
          </button>
        </div>
        <div className="flex flex-col px-[2.4rem]  ">
          <div className="  h-full w-auto pt-0">
            {/* 닫기 버튼 */}
            {/* 제목 */}
            <h1
              className={`             
        ${colorVariants({ color: "gray-900" })} 
        ${typographyVariants({ variant: "h1-sb" })}
        !text-[var(--font-size-20)]
        text-[2rem]
        mb-[1.2rem]
         `}
            >
              모든 공유 캘린더
            </h1>
            {/* 공유 캘린더 리스트 */}
            <ul className="mb-[4.8rem] ">
              {loading ? (
                <li className="flex justify-center items-center py-[2rem]">
                  <span
                    className={`${typographyVariants({
                      variant: "b2-md",
                    })} ${colorVariants({ color: "gray-600" })} text-[1.4rem]`}
                  >
                    로딩 중...
                  </span>
                </li>
              ) : error ? (
                <li className="flex justify-center items-center py-[2rem]">
                  <span
                    className={`${typographyVariants({
                      variant: "b2-md",
                    })} ${colorVariants({ color: "red-300" })} text-[1.4rem]`}
                  >
                    데이터를 불러오는데 실패했습니다.
                  </span>
                </li>
              ) : items.length === 0 ? (
                <li className="flex justify-center items-center py-[2rem]">
                  <span
                    className={`${typographyVariants({
                      variant: "b2-md",
                    })} ${colorVariants({ color: "gray-600" })} text-[1.4rem]`}
                  >
                    공유 캘린더가 없습니다.
                  </span>
                </li>
              ) : (
                items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center  pb-[0.8rem] pt-[1.2rem] border-b border-[var(--gray-100)] "
                  >
                    {/* 왼쪽 체크박스 + 타이틀 */}
                    <div className="flex items-center">
                      {isSelectionMode && (
                        <div className=" flex flex-col !items-end !justify-end  ">
                          <input
                            type="checkbox"
                            id={`Keep-logged-in-${item.id}`}
                            className="invite-screen-reader"
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) => {
                              setIsChecked(e.target.checked);
                              setIsVisuallyChecked(e.target.checked);
                              e.stopPropagation();
                              handleToggleSelect(item.id);
                            }}
                          />
                          <div className="invite-label-box">
                            <label
                              htmlFor={`Keep-logged-in-${item.id}`}
                              className={`${typographyVariants({
                                variant: "b2-md",
                              })} 
                        !text-[1.4rem]
                        ${
                          isVisuallyChecked || isChecked
                            ? colorVariants({ color: "gray-900" })
                            : colorVariants({ color: "gray-700" })
                        }`}
                            >
                              <span
                                className="invite-check-icon"
                                aria-hidden="true"
                              ></span>
                            </label>
                          </div>
                        </div>
                      )}

                      <span
                        className={`
                    ml-2
                    ${typographyVariants({ variant: "b2-md" })}
                    !text-[1.4rem]
                    ${colorVariants({ color: "gray-800" })}
                    hover:bg-gray-100
                    cursor-pointer
                    select-none
                  `}
                        onClick={() => handleClickWithLongPress(item.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleTitleLongPress(item.id);
                        }}
                        onTouchStart={() => handleTouchStart(item.id)}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={() => handleTouchStart(item.id)}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                      >
                        {item.title}
                      </span>
                    </div>
                    <div
                      className={` ${typographyVariants({
                        variant: "d3-rg",
                      })} ${colorVariants({ color: "gray-600" })}
                               !text-[1.2rem] `}
                    >
                      <span
                        className={` ${colorVariants({ color: "red-300" })} `}
                      >
                        {item.daysLeft}
                      </span>
                      일 후 삭제
                    </div>
                  </li>
                ))
              )}
              {isSelectionMode && selectedIds.length > 0 && (
                <>
                  <div
                    className={`flex flex-row mt-[2rem] ${typographyVariants({
                      variant: "b2-md",
                    })} gap-[0.8rem] text-[1.4rem]`}
                  >
                    <Button
                      label="취소하기"
                      size={"S"}
                      additionalClass={`
                  ${colorVariants({ color: "gray-800" })}
                  border-[var(--gray-500)]
                `}
                      onClick={() => {
                        setSelectedIds([]);
                        setIsSelectionMode(false);
                      }} // 취소: 선택 해제
                    />
                    <Button
                      label="삭제하기"
                      size="S"
                      additionalClass={`
            ${colorVariants({ color: "red-300" })}
            border-[var(--red-300)]
            bg-[var(--red-50)]
          `}
                      onClick={handleDeleteButtonClick}
                    />
                  </div>
                </>
              )}
            </ul>
            {/* 모달 */}
            {showModal && (
              <div
                className={` fixed inset-0 flex items-center justify-center z-50 bg-black/25
           ${typographyVariants({ variant: "h2-sb" })}, 
          ${colorVariants({ color: "gray-800" })}, 
          p-[2.4rem]  content-center gap-x-[0.8rem] gap-y-[2.4rem] flex-wrap rounded-[1.2rem]
        `}
              >
                <div className="bg-white   w-[28rem] h-[12.8rem] p-[2.4rem] rounded-[1.2rem] ">
                  <p className="mb-[2.4rem] flex justify-center ">
                    캘린더를 삭제하시겠습니까?
                  </p>
                  <div
                    className={`flex justify-center gap-[1.2rem]  ${typographyVariants(
                      { variant: "b1-sb" }
                    )}`}
                  >
                    <button
                      onClick={handleCancelDelete}
                      className={`  ${colorVariants({
                        bg: "gray-100",
                        color: "gray-900",
                      })} text-[1.4rem] rounded-[0.6rem] !w-[11rem] !h-[4rem] py-[1.2rem]  rounded mr-2`}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className={`  ${colorVariants({
                        bg: "red-300",
                        color: "white",
                      })} text-[1.4rem] rounded-[0.6rem] w-[11rem] h-[4rem]  \py-[1.2rem]  text-[var(--white)] `}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* 계정 관리 */}
            <h2
              className={`${typographyVariants({
                variant: "h1-sb",
              })} text-[2rem] mb-[2.4rem]`}
            >
              계정 관리
            </h2>
            <ul
              className={`${typographyVariants({
                variant: "b2-md",
              })} text-[1.4rem] flex  flex-col gap-[1.2rem]`}
            >
              <li
                onClick={handleProfileClick}
                className="flex items-center gap-x-[0.4rem] border-b border-[var(--gray-100)] pb-[0.8rem] cursor-pointer"
              >
                <img
                  src="/User.svg"
                  alt="개인정보 수정"
                  size={20}
                  className="text-gray-700"
                />
                <span className={``}>개인정보 수정</span>
              </li>
              <li
                onClick={handleLogOutButtonClick}
                className="flex items-center gap-x-[0.4rem] border-b border-[var(--gray-100)] pb-[0.8rem] cursor-pointer"
              >
                <img
                  src="/Logout.svg"
                  size={20}
                  alt=""
                  className="text-gray-700"
                />
                <span className={``}>로그아웃</span>
              </li>
            </ul>
            {showModalLogOut && (
              <div
                className={` fixed inset-0 flex items-center justify-center z-50 bg-black/25
           ${typographyVariants({ variant: "h2-sb" })}, 
          ${colorVariants({ color: "gray-800" })}, 
          p-[2.4rem]  content-center gap-x-[0.8rem] gap-y-[2.4rem] flex-wrap rounded-[1.2rem]
        `}
              >
                <div className="bg-white   w-[28rem] h-[12.8rem] p-[2.4rem] rounded-[1.2rem] ">
                  <p className="mb-[2.4rem] flex justify-center ">
                    로그아웃하시겠습니까?
                  </p>
                  <div
                    className={`flex justify-center gap-[1.2rem]  ${typographyVariants(
                      { variant: "b1-sb" }
                    )}`}
                  >
                    <button
                      onClick={handleLogOut}
                      className={`  ${colorVariants({
                        bg: "gray-100",
                        color: "gray-900",
                      })} text-[1.4rem] rounded-[0.6rem] !w-[11rem] !h-[4rem] py-[1.2rem]  rounded mr-2`}
                    >
                      아니오
                    </button>
                    <button
                      onClick={handleLogOut}
                      className={`  ${colorVariants({
                        bg: "gray-900",
                        color: "white",
                      })} text-[1.4rem] rounded-[0.6rem] w-[11rem] h-[4rem]  \py-[1.2rem]  text-[var(--white)] `}
                    >
                      예
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  ) : null;
}
