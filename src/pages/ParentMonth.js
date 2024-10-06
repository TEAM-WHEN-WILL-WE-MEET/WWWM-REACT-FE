import React, { useState } from 'react';
import MonthView from './MonthView';
import TimePicker from '../components/TimePicker';

const ParentMonth = () => {
  
  const [jsonData, setJsonData] = useState(null);
  const [startTime, setStartTime] = useState('09:00'); 
  const [endTime, setEndTime] = useState('20:00');

  return (
    <>
      <MonthView 
      setJsonData={setJsonData}
      startTime={startTime}
      endTime={endTime}
       />
      <TimePicker
       jsonData={jsonData}
      //  startTime={startTime}
      //  endTime={endTime}
      startTime={startTime}
      endTime={endTime}
      setStartTime={setStartTime}
      setEndTime={setEndTime}
        />
    </>
  );
};

export default ParentMonth;
