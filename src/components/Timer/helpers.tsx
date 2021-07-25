import { AsyncStorage } from 'react-native'
import { addSeconds, differenceInSeconds, minutesToSeconds, hoursToSeconds } from 'date-fns'


export const START_TIME_KEY = '@start_time'
export const PAUSED_TIME_KEY = '@pause_time'
export const END_TIME_KEY = '@end_time'

export const TIMER_STATUS = {
 STARTED: 'started',
 NOT_STARTED: 'not started',
 FINISHED: 'finished',
 PAUSED: 'paused',
 TRYING_TO_INTERRUPT: 'trying to interrupt',
}

export const recordScheduledTime = async (scheduledTime: number) => {
 try {
  const now = new Date()
  await AsyncStorage.multiSet([
   [START_TIME_KEY, now.toISOString()],
   [END_TIME_KEY, addSeconds(now, scheduledTime).toISOString()]
  ])
 } catch (err) {
  // TODO: handle errors from setItem properly
  console.warn(err)
 }
}

export const recordPauseTime = async () => {
 try {
  const now = new Date()
  await AsyncStorage.setItem(PAUSED_TIME_KEY, now.toISOString())
 } catch (err) {
  console.warn(err)
 }
}

export const refrashRecordScheduledTime = async () => {
 try {
  const [endTime, pauseTime] = await AsyncStorage.multiGet([END_TIME_KEY, PAUSED_TIME_KEY])
  const differenceFromPauseToEndTime = differenceInSeconds(Date.parse(endTime[1]), Date.parse(pauseTime[1]))

  const newEndTime = addSeconds(new Date(), differenceFromPauseToEndTime)

  await AsyncStorage.setItem(END_TIME_KEY, newEndTime.toISOString())
  await AsyncStorage.removeItem(PAUSED_TIME_KEY)
  await AsyncStorage.removeItem(END_TIME_KEY)
 } catch (err) {
  console.warn(err)
 }
}

export const cleanScheduledTime = async () => {
 try {
  await AsyncStorage.multiRemove([START_TIME_KEY, PAUSED_TIME_KEY, END_TIME_KEY])
 } catch (err) {
  console.warn(err)
 }
}

export const getElapsedTime = async () => {
 try {
  const endTime = await AsyncStorage.getItem(END_TIME_KEY)
  const now = new Date()
  return differenceInSeconds(Date.parse(endTime), now)
 } catch (err) {
  // TODO: handle errors from setItem properly
  console.warn(err)
 }
}

type GenerateScheduledTime = {
 minutes?: number
 days?: number
 seconds?: number
 hours?: number
}

/**
 * @returns scheduled time in seconds
 */
export const generateScheduledTime = ({ seconds = 0, minutes = 0, hours = 0, days = 0 }: GenerateScheduledTime) => {
 return seconds + minutesToSeconds(minutes) + hoursToSeconds(hours) + hoursToSeconds(days * 24)
}
