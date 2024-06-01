import * as coreDayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

coreDayjs.extend(utc);
coreDayjs.extend(timezone);
export const dayjs = coreDayjs;

export const getSecondFromDay = (days: number): number => {
  return days * 24 * 60 * 60;
};
