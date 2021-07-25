import { secondsToMinutes } from 'date-fns'

export const formatTimeNumberToTimeString = (time: number) => (String(time).padStart(2, '0'))

/**
 * @param timeLeftInSecond Time left in seconds
 * @returns formatted time left in seconds, minutes, hours and days
 */
export const getFormattedTimeLeft = (timeLeftInSecond: number) => {
 let difference = timeLeftInSecond

 const secondsLeft = (difference) % 60
 difference = secondsToMinutes(difference - secondsLeft)

 const minutesLeft = difference


 return {
  secondsLeft: formatTimeNumberToTimeString(secondsLeft),
  minutesLeft: formatTimeNumberToTimeString(minutesLeft),
 }
}
