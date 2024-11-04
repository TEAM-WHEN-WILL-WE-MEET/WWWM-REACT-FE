import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ko';
import './individualCalendar.css';

const IndividualCalendar = () => {
  const location = useLocation();
  const { responseData, appointmentId, userName } = location.state;

  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [eventName, setEventName] = useState("");
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    if (responseData) {
      setEventName(responseData.object.name);
      moment.locale('ko');

      const schedules = responseData.object.schedules;

      const datesArray = schedules.map((schedule, index) => {
        const dateString = schedule.date;
        const date = moment.utc(dateString).format('YYYY-MM-DD');
        return { date, key: index, id: schedule.id };
      });

      const startTimeString = responseData.object.startTime;
      const endTimeString = responseData.object.endTime;
      const startTimeH = moment.utc(startTimeString).format('HH');
      const endTimeHM = moment.utc(endTimeString).format('HH:mm');

      const scheduleTimes = schedules[0]?.times;
      if (!scheduleTimes) {
        console.error('스케줄에 times가 없습니다.');
        return;
      }

      const timeSet = new Set();
      scheduleTimes.forEach(timeSlot => {
        const timeString = timeSlot.time;
        const timeHM = moment.utc(timeString).format('HH');
        if (timeHM >= startTimeH && timeHM <= endTimeHM) {
          timeSet.add(timeHM);
        }
      });

      const timesArray = Array.from(timeSet).sort((a, b) => {
        return moment(a, 'HH').diff(moment(b, 'HH'));
      });

      const timesFormatted = timesArray.map(timeHM => moment(timeHM, 'HH:mm').format('HH:mm'));

      setDates(datesArray);
      setTimes(timesFormatted);

      if (responseData.firstLogin === false && responseData.object.times) {
        const savedTimes = {};
        responseData.object.times.forEach(timeSlot => {
          const dateIndex = datesArray.findIndex(dateObj => dateObj.date === moment.utc(timeSlot.date).format('YYYY-MM-DD'));
          if (dateIndex !== -1) {
            savedTimes[dateIndex] = savedTimes[dateIndex] || {};
            timeSlot.times.forEach((time, index) => {
              const timeIndex = timesFormatted.indexOf(moment(time.time).format('HH시'));
              if (timeIndex !== -1) {
                savedTimes[dateIndex][timeIndex] = {
                  ...savedTimes[dateIndex][timeIndex],
                  [index]: true,
                };
              }
            });
          }
        });
        setSelectedTimes(savedTimes);
      }
    }
  }, [responseData]);

  const toggleTimeSelection = (timeIndex, buttonIndex) => {
    const newSelectedTimes = { ...selectedTimes };
    if (!newSelectedTimes[selectedDate]) {
      newSelectedTimes[selectedDate] = {};
    }

    const isSelected = newSelectedTimes[selectedDate][timeIndex]?.[buttonIndex];
    newSelectedTimes[selectedDate][timeIndex] = {
      ...newSelectedTimes[selectedDate][timeIndex],
      [buttonIndex]: !isSelected,
    };
    setSelectedTimes(newSelectedTimes);
  };

  const handleMouseDown = (timeIndex, buttonIndex) => {
    setIsDragging(true);
    setDragStart({ timeIndex, buttonIndex });
  };

  const handleMouseEnter = (timeIndex, buttonIndex) => {
    if (isDragging && dragStart) {
      const start = Math.min(dragStart.timeIndex, timeIndex);
      const end = Math.max(dragStart.timeIndex, timeIndex);

      for (let i = start; i <= end; i++) {
        toggleTimeSelection(i, buttonIndex);
      }
    }
  };

  const handleMouseUp = (timeIndex, buttonIndex) => {
    setIsDragging(false);

    if (dragStart) {
      const isClick =
        dragStart.timeIndex === timeIndex && dragStart.buttonIndex === buttonIndex;
      if (isClick) {
        toggleTimeSelection(timeIndex, buttonIndex);
      }
    }

    setDragStart(null);
  };

  // 터치 이벤트 핸들러 추가
  const handleTouchStart = (e, timeIndex, buttonIndex) => {
    e.preventDefault(); // 기본 터치 동작 방지
    setIsDragging(true);
    setDragStart({ timeIndex, buttonIndex });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.dataset.timeIndex && target.dataset.buttonIndex) {
      const timeIndex = parseInt(target.dataset.timeIndex, 10);
      const buttonIndex = parseInt(target.dataset.buttonIndex, 10);
      handleMouseEnter(timeIndex, buttonIndex);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  return (
    <div
      className="individual-calendar"
      onMouseLeave={() => {
        setIsDragging(false);
        setDragStart(null);
      }}
    >
      <div className="individual-calendar-header">
        <h2>{eventName}</h2>
      </div>
      <div className="event-date-tabs">
        {dates.map(({ date, key }) => (
          <div
            key={key}
            className={`event-date-tab ${selectedDate === key ? 'active' : ''}`}
            onClick={() => setSelectedDate(key)}
          >
            {moment(date, 'YYYY-MM-DD').format('M/D(ddd)')}
          </div>
        ))}
      </div>
      <div className="time-selection">
        {times.map((time, timeIndex) => (
          <div key={timeIndex} className="time-row">
            <div className="time">{moment(time, 'HH:mm').format('HH시')}</div>
            <div className="eventCalendar-time-buttons">
              {[...Array(6)].map((_, buttonIndex) => (
                <button
                  key={buttonIndex}
                  data-time-index={timeIndex}
                  data-button-index={buttonIndex}
                  className={`eventCalendar-time-button ${
                    selectedTimes[selectedDate]?.[timeIndex]?.[buttonIndex]
                      ? "selected"
                      : ""
                  }`}
                  onMouseDown={() => handleMouseDown(timeIndex, buttonIndex)}
                  onMouseEnter={() => handleMouseEnter(timeIndex, buttonIndex)}
                  onMouseUp={() => handleMouseUp(timeIndex, buttonIndex)}
                  onTouchStart={(e) => handleTouchStart(e, timeIndex, buttonIndex)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndividualCalendar;
