import moment from "moment-timezone";

export const formatMonthYear = (date) => {
  return moment(date).format("YYYY년 MM월");
};

export const formatDay = (locale, date) => {
  return moment(date).format("DD");
};