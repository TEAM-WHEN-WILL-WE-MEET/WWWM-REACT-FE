import { useState } from "react";
import { useCalendarStore } from "../../../../../store/index.ts";

export const useTitleField = () => {
  const [isFocused, setIsFocused] = useState(false);
  const { eventName, setEventName } = useCalendarStore();

  const handleInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClear = () => {
    setEventName("");
  };

  return {
    eventName,
    isFocused,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleClear,
  };
};