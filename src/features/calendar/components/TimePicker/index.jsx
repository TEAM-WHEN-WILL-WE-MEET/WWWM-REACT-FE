import React, { useState, useRef, useEffect } from "react";
import { typographyVariants } from "../../../../styles/typography.ts";
import { colorVariants, colors } from "../../../../styles/color.ts";
import { Button } from "../../../../components/Button.tsx";
import { cn } from "../../../../utils/cn";
import { useCalendarStore } from "../../../../store/index.ts";

const TimePicker = ({ onCreateCalendar }) => {
  const {
    startTime,
    endTime,
    eventName,
    isFormReady,
    setStartTime,
    setEndTime,
    updateJsonData,
  } = useCalendarStore();

  const endMeridiemDialRef = useRef(null);
  const endHourDialRef = useRef(null);

  // Store의 기본값과 동기화
  const startHour24Initial = parseInt(startTime.split(":")[0], 10);
  const endHour24Initial = parseInt(endTime.split(":")[0], 10);

  const [startHour24, setStartHour24] = useState(startHour24Initial);
  const [endHour24, setEndHour24] = useState(endHour24Initial);
  const startMeridiem = getMeridiem(startHour24);
  const startHour12 = to12Hour(startHour24);
  const endMeridiem = getMeridiem(endHour24);
  const endHour12 = to12Hour(endHour24);

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [startClicked, setStartClicked] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [endClicked, setEndClicked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const startDialRef = useRef(null);
  const endDialRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isStartOpen &&
        startDialRef.current &&
        !startDialRef.current.contains(e.target)
      ) {
        setIsStartOpen(false);
        setStartClicked(false);
      }
      if (
        isEndOpen &&
        endDialRef.current &&
        !endDialRef.current.contains(e.target)
      ) {
        setIsEndOpen(false);
        setEndClicked(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStartOpen, isEndOpen]);

  const handleCreateButtonClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = () => {
    setShowConfirmModal(false);
    onCreateCalendar();
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  const handleStartClick = () => {
    setIsStartOpen((prev) => !prev);
    setStartClicked((prev) => !prev);
  };

  const handleEndClick = () => {
    setIsEndOpen((prev) => !prev);
    setEndClicked((prev) => !prev);
  };

  const handleHourChange = (newHour24, isStart) => {
    let nextH = newHour24;
    if (nextH < 0) nextH = 23;
    if (nextH > 23) nextH = 0;

    if (isStart) {
      setStartHour24(nextH);
      const hh = String(nextH).padStart(2, "0");
      setStartTime(`${hh}:00`);
    } else {
      setEndHour24(nextH);
      const hh = String(nextH).padStart(2, "0");
      setEndTime(`${hh}:00`);
    }
    
    // 시간 변경 시 즉시 JSON 데이터 업데이트
    setTimeout(() => updateJsonData(), 0);
  };

  const meridiemDialRef = useRef(null);
  const hourDialRef = useRef(null);

  const morningHours = Array.from({ length: 12 }, (_, i) => i);
  const afternoonHours = Array.from({ length: 12 }, (_, i) => i + 12);

  function getMeridiem(hour24) {
    return hour24 < 12 ? "오전" : "오후";
  }

  function to12Hour(hour24) {
    if (hour24 === 0) return 12;
    if (hour24 === 12) return 12;
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  }

  const handleMeridiemChange = (meridiem, isStart) => {
    if (isStart) {
      const currentHour24 = startHour24;
      const currentIsMorning = currentHour24 < 12;
      const wantMorning = meridiem === "오전";

      if (currentIsMorning && !wantMorning) {
        handleHourChange(currentHour24 + 12, true);
      } else if (!currentIsMorning && wantMorning) {
        handleHourChange(currentHour24 - 12, true);
      }
    } else {
      const currentHour24 = endHour24;
      const currentIsMorning = currentHour24 < 12;
      const wantMorning = meridiem === "오전";

      if (currentIsMorning && !wantMorning) {
        handleHourChange(currentHour24 + 12, false);
      } else if (!currentIsMorning && wantMorning) {
        handleHourChange(currentHour24 - 12, false);
      }
    }
  };

  const handleMeridiemScroll = (e) => {
    const container = e.currentTarget;
    const center = container.scrollTop + container.clientHeight / 2;
    let closestDistance = Infinity;
    let selectedMeridiem = null;
    Array.from(container.children).forEach((child) => {
      const childCenter = child.offsetTop + child.offsetHeight / 2;
      const distance = Math.abs(center - childCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        selectedMeridiem = child.getAttribute("data-meridiem");
      }
    });
    if (selectedMeridiem && selectedMeridiem !== startMeridiem) {
      handleMeridiemChange(selectedMeridiem, true);
    }
  };

  const handleHourScroll = (e) => {
    const container = e.currentTarget;
    const containerCenter = container.scrollTop + container.clientHeight / 2;
    let closestDistance = Infinity;
    let selectedHour = null;

    Array.from(container.children).forEach((child) => {
      const childCenter = child.offsetTop + child.offsetHeight / 2;
      const distance = Math.abs(childCenter - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        selectedHour = child.getAttribute("data-hour");
      }
    });

    if (selectedHour !== null) {
      const newHour24 = parseInt(selectedHour, 10);
      if (newHour24 !== startHour24) {
        handleHourChange(newHour24, true);
      }
    }
  };

  const handleEndHourScroll = (e) => {
    const container = e.currentTarget;
    const containerCenter = container.scrollTop + container.clientHeight / 2;
    let closestDistance = Infinity;
    let selectedHour = null;

    Array.from(container.children).forEach((child) => {
      const childCenter = child.offsetTop + child.offsetHeight / 2;
      const distance = Math.abs(childCenter - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        selectedHour = child.getAttribute("data-hour");
      }
    });

    if (selectedHour !== null) {
      const newHour24 = parseInt(selectedHour, 10);
      if (newHour24 !== endHour24) {
        handleHourChange(newHour24, false);
      }
    }
  };

  const onWheelHour = (e, isStart) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      if (isStart) handleHourChange(startHour24 + 1, true);
      else handleHourChange(endHour24 + 1, false);
    } else {
      if (isStart) handleHourChange(startHour24 - 1, true);
      else handleHourChange(endHour24 - 1, false);
    }
  };

  const onWheelMeridiem = (e, isStart) => {
    e.preventDefault();
    if (isStart) {
      const newVal = startHour24 < 12 ? "오후" : "오전";
      handleMeridiemChange(newVal, true);
    } else {
      const newVal = endHour24 < 12 ? "오후" : "오전";
      handleMeridiemChange(newVal, false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-5 p-5">
      <div className="flex flex-col items-start space-y-4 p-0 w-full max-w-[32rem] h-[22.4rem]">
        <div
          className={cn(
            "flex justify-between w-full cursor-pointer ",
            "border-b-[0.2rem]",
            "pb-[1.2rem]",
            `border-b-[${colors.gray[300]}]`
          )}
          onClick={handleStartClick}
        >
          <div
            className={`${typographyVariants({ variant: "b2-md" })}
            ${
              startClicked
                ? colorVariants({ color: "gray-700" })
                : colorVariants({ color: "gray-900" })
            }
            `}
          >
            시작 시간
          </div>
          <div
            className={`${typographyVariants({ variant: "b2-md" })}
            ${
              startClicked
                ? colorVariants({ color: "gray-700" })
                : colorVariants({ color: "gray-900" })
            }`}
          >
            {startMeridiem} {startHour12}:00
          </div>
        </div>

        {isStartOpen && (
          <div
            ref={startDialRef}
            className={`${colorVariants({
              bg: "gray-50",
            })} flex w-full space-x-2 !h-[11.2rem]`}
          >
            <div
              className="relative w-1/2 h-[11.2rem] overflow-y-auto border border-none rounded-md scroll-snap-y scroll-snap-mandatory h-auto"
              onWheel={(e) => onWheelMeridiem(e, true)}
              onScroll={handleMeridiemScroll}
              ref={meridiemDialRef}
            >
              {["오전", "오후"].map((m) => {
                return (
                  <div
                    key={m}
                    className={` h-[3.73rem] flex items-center justify-center cursor-pointer scroll-snap-align-center
                      ${
                        m === startMeridiem
                          ? ` ${typographyVariants({
                              variant: "h3-md",
                            })} ${colorVariants({
                              color: "blue-400",
                              bg: "white",
                            })} !text-[var(--blue-400)]`
                          : ` ${typographyVariants({
                              variant: "h4-md",
                            })} ${colorVariants({
                              color: "gray-600",
                              bg: "gray-50",
                            })} !text-[var(--gray-600)]`
                      }`}
                    onClick={() => {
                      handleMeridiemChange(m, true);
                      if (meridiemDialRef.current) {
                        const targetTop =
                          m === "오전"
                            ? 0
                            : meridiemDialRef.current.children[1].offsetTop;
                        meridiemDialRef.current.scrollTo({
                          top: targetTop,
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    {m}
                  </div>
                );
              })}
            </div>

            <div
              className="relative w-1/2 h-[11.2rem]overflow-y-auto border border-none overflow-scroll [&::-webkit-scrollbar]:hidden scroll-snap-y scroll-snap-mandatory h-[112px]"
              onWheel={(e) => onWheelHour(e, true)}
              onScroll={handleHourScroll}
              ref={hourDialRef}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {(startHour24 < 12 ? morningHours : afternoonHours).map(
                (h24, index) => {
                  const displayH = to12Hour(h24);
                  const isActive = startHour24 === h24;
                  const isDisabled = endHour24 != null && h24 >= endHour24;

                  return (
                    <div
                      data-hour={h24}
                      key={h24}
                      className="flex justify-between items-center h-[3.73rem] croll-snap-align-center"
                    >
                      <div
                        onClick={() => {
                          if (!isDisabled && hourDialRef.current) {
                            handleHourChange(h24, true);
                            const targetTop =
                              hourDialRef.current.children[index].offsetTop;
                            hourDialRef.current.scrollTo({
                              top: targetTop,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className={` h-[3.73rem] w-1/2 flex items-center justify-center cursor-pointer scroll-snap-align-start 
                        ${
                          isDisabled
                            ? ` ${colorVariants({
                                bg: "gray-100",
                              })} !text-[var(--gray-400)] cursor-not-allowed`
                            : isActive
                            ? ` ${typographyVariants({
                                variant: "h3-md",
                              })} ${colorVariants({
                                color: "blue-400",
                                bg: "white",
                              })} !text-[var(--blue-400)]`
                            : ` ${typographyVariants({
                                variant: "h4-md",
                              })} ${colorVariants({
                                color: "gray-600",
                                bg: "gray-50",
                              })} !text-[var(--gray-600)]`
                        }`}
                      >
                        {displayH}
                      </div>
                      <div
                        onClick={() => {
                          if (!isDisabled && hourDialRef.current) {
                            const targetTop =
                              hourDialRef.current.children[index].offsetTop;
                            hourDialRef.current.scrollTo({
                              top: targetTop,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className={` h-[3.73rem] w-1/2 flex items-center justify-center cursor-pointer scroll-snap-align-start 
                        ${
                          isDisabled
                            ? `${colorVariants({
                                bg: "gray-100",
                              })}  !text-[var(--gray-400)] cursor-not-allowed`
                            : isActive
                            ? ` ${typographyVariants({
                                variant: "h3-md",
                              })} ${colorVariants({
                                color: "blue-400",
                                bg: "white",
                              })} !text-[var(--blue-400)]`
                            : ` ${typographyVariants({
                                variant: "h4-md",
                              })} ${colorVariants({
                                color: "gray-600",
                                bg: "gray-50",
                              })} !text-[var(--gray-600)]`
                        }`}
                      >
                        00
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex justify-between w-full cursor-pointer",
            "border-b-[0.2rem]",
            "pb-[1.2rem]",
            `border-b-[${colors.gray[300]}]`
          )}
          onClick={handleEndClick}
        >
          <div
            className={`${typographyVariants({ variant: "b2-md" })}
            ${
              endClicked
                ? colorVariants({ color: "gray-700" })
                : colorVariants({ color: "gray-900" })
            }
            `}
          >
            {" "}
            종료 시간
          </div>
          <div
            className={`${typographyVariants({ variant: "b2-md" })}
            ${
              endClicked
                ? colorVariants({ color: "gray-700" })
                : colorVariants({ color: "gray-900" })
            }`}
          >
            {endMeridiem} {endHour12}:00
          </div>
        </div>

        {isEndOpen && (
          <div
            ref={endDialRef}
            className={`${colorVariants({
              bg: "gray-50",
            })} flex w-full space-x-2 !h-[11.2rem]  `}
          >
            <div
              className="relative w-1/2 overflow-y-auto border border-none rounded-md scroll-snap-y scroll-snap-mandatory"
              onWheel={(e) => onWheelMeridiem(e, false)}
              ref={endMeridiemDialRef}
              style={{ scrollBehavior: "smooth" }}
            >
              {["오전", "오후"].map((m) => {
                const isActive = endMeridiem === m;
                return (
                  <div
                    key={m}
                    onClick={() => handleMeridiemChange(m, false)}
                    className={` h-[3.73rem] flex items-center justify-center cursor-pointer scroll-snap-align-center 
                      ${
                        isActive
                          ? ` ${typographyVariants({
                              variant: "h3-md",
                            })} ${colorVariants({
                              color: "blue-400",
                              bg: "white",
                            })} !text-[var(--blue-400)]`
                          : ` ${typographyVariants({
                              variant: "h4-md",
                            })} ${colorVariants({
                              color: "gray-600",
                              bg: "gray-50",
                            })} !text-[var(--gray-600)]`
                      }`}
                  >
                    {m}
                  </div>
                );
              })}
            </div>

            <div
              className="relative w-1/2 h-40 overflow-y-auto border-none scroll-snap-y overflow-scroll [&::-webkit-scrollbar]:hidden h-[11.2rem]"
              onWheel={(e) => onWheelHour(e, false)}
              onScroll={handleEndHourScroll}
              ref={endHourDialRef}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                scrollBehavior: "smooth",
              }}
            >
              {(endHour24 < 12 ? morningHours : afternoonHours).map((h24) => {
                const displayH = to12Hour(h24);
                const isActive = endHour24 === h24;
                const isDisabled = startHour24 != null && h24 <= startHour24;

                return (
                  <div
                    data-hour={h24}
                    key={h24}
                    className="flex items-center scroll-snap-align-center justify-between h-[3.73rem]"
                  >
                    <div
                      onClick={() => {
                        if (!isDisabled) {
                          handleHourChange(h24, false);
                        }
                      }}
                      className={` h-[3.73rem] w-1/2 flex items-center justify-center cursor-pointer scroll-snap-align-start  
                        ${
                          isDisabled
                            ? ` ${colorVariants({
                                bg: "gray-100",
                              })} !text-[var(--gray-400)] cursor-not-allowed`
                            : isActive
                            ? ` ${typographyVariants({
                                variant: "h3-md",
                              })} ${colorVariants({
                                color: "blue-400",
                                bg: "white",
                              })} !text-[var(--blue-400)]`
                            : ` ${typographyVariants({
                                variant: "h4-md",
                              })} ${colorVariants({
                                color: "gray-600",
                                bg: "gray-50",
                              })} !text-[var(--gray-600)] ${colorVariants({
                                bg: "gray-50",
                              })}`
                        }`}
                    >
                      {displayH}
                    </div>
                    <div
                      onClick={() => {
                        if (!isDisabled) {
                          handleHourChange(h24, true);
                        }
                      }}
                      className={` h-[3.73rem] w-1/2 flex items-center justify-center cursor-pointer scroll-snap-align-start 
                        ${
                          isDisabled
                            ? `${colorVariants({
                                bg: "gray-100",
                              })}  !text-[var(--gray-400)] cursor-not-allowed`
                            : isActive
                            ? ` ${typographyVariants({
                                variant: "h3-md",
                              })} ${colorVariants({
                                color: "blue-400",
                                bg: "white",
                              })} !text-[var(--blue-400)]`
                            : ` ${typographyVariants({
                                variant: "h4-md",
                              })} ${colorVariants({
                                color: "gray-600",
                                bg: "gray-50",
                              })} !text-[var(--gray-600)]`
                        }`}
                    >
                      00
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <Button
          label="캘린더 만들기"
          disabled={!isFormReady}
          size={"XL"}
          onClick={handleCreateButtonClick}
          additionalClass="!mt-[44px]"
        />
        {showConfirmModal && (
          <div className="modal-backdrop fixed !m-0 inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="modal flex flex-col gap-[2rem] p-[2.4rem] bg-white text-center w-full max-w-[28rem] h-[16rem] rounded-[1.2rem] shadow-md mx-4">
              <div className="flex flex-col gap-[1.2rem]">
                <p
                  className={`
                  ${typographyVariants({ variant: "h1-sb" })}
                  !text-[[var(--font-size-20)]]
                  !text-[2rem]
                  w-auto
                `}
                >
                  '{eventName}'
                </p>
                <p
                  className={`
                  ${typographyVariants({ variant: "b2-md" })}
                  !text-[1.4rem]]
                  w-auto
                `}
                >
                  캘린더를 만드시겠습니까?
                </p>
              </div>
              <div className="button-group flex justify-center gap-[1.2rem]">
                <button
                  onClick={handleCancel}
                  className={`
                    ${typographyVariants({ variant: "h3-md" })}
                    flex !w-[11rem] h-[4rem] py-3 justify-center items-center rounded-[0.6rem] ${colorVariants(
                      { bg: "gray-100" }
                    )}
                  `}
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmCreate}
                  className={`
                    !${colorVariants({ color: "blue-400" })}
                    ${typographyVariants({ variant: "h3-md" })}
                    flex !w-[11rem] h-[4rem] px-3 py-3 justify-center items-center rounded-[0.6rem] border border-[var(--blue-400)] bg-white
                  `}
                >
                  만들기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimePicker;
