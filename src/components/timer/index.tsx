import React, { useState, useEffect, useRef } from 'react'
import { Text, View, Button, AsyncStorage, AppState, AppStateStatus } from 'react-native'
import { addSeconds, differenceInSeconds, minutesToSeconds, hoursToSeconds, secondsToMinutes, minutesToHours } from 'date-fns'

const START_TIME_KEY = '@start_time'
const PAUSED_TIME_KEY = '@pause_time'
const END_TIME_KEY = '@end_time'

const TimerStatus = {
  STARTED: 'started',
  NOT_STARTED: 'not started',
  FINISHED: 'finished',
  PAUSED: 'paused',
  TRYING_TO_INTERRUPT: 'trying to interrupt',
}

type TimerProps = {
  minutes?: number
  days?: number
  seconds?: number
  hours?: number
  onStart?: () => any
  onFinish?: () => any
  onInterrupt?: () => any
  onPause?: () => any
  pausable?: boolean
}

const Timer: React.FC<TimerProps> = ({ seconds = 0, minutes = 0, hours = 0, days = 0, onStart, onFinish, onInterrupt, onPause, pausable = false }: TimerProps) => {
  const appState = useRef(AppState.currentState)

  const scheduledTime = generateScheduledTime({ seconds, minutes, hours, days })
  const [timeLeft, setTimeLeft] = useState(scheduledTime)
  const [timerStatus, setStatus] = useState<string>(TimerStatus.NOT_STARTED)
  let lastTimeout: any = null

  const onStartTimer = async () => {
    try {
      await recordScheduledTime(scheduledTime)
      setStatus(TimerStatus.STARTED)
      !!onStart && onStart()
    } catch (error) {
      console.warn(error)
    }
  }

  const onPauseTimer = async () => {
    if (pausable) {
      await recordPauseTime()
      clearTimeout(lastTimeout)
      setStatus(TimerStatus.PAUSED)
      !!onPause && onPause()
    }
  }

  const onContinueTimer = async () => {
    if (pausable) {
      await refrashRecordScheduledTime()
      setStatus(TimerStatus.STARTED)
    }
  }

  const onTryInterruptTimer = () => {
    setStatus(TimerStatus.TRYING_TO_INTERRUPT)
  }

  const onInterruptTimer = async () => {
    await cleanScheduledTime()
    clearTimeout(lastTimeout)
    setStatus(TimerStatus.FINISHED)
    !!onInterrupt && onInterrupt()
  }

  const onFinishTimer = async () => {
    await cleanScheduledTime()
    setStatus(TimerStatus.FINISHED)
    !!onFinish && onFinish()
  }

  const onRestartTimer = () => {
    setTimeLeft(scheduledTime)
    setStatus(TimerStatus.NOT_STARTED)
  }

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)

    lastTimeout = setTimeout(() => {
      if (timerStatus === TimerStatus.STARTED && timeLeft > 0) {
        setTimeLeft(timeLeft - 1)
      }
    }, 1000)

    if (timeLeft === 0) {
      onFinishTimer()
    }

    return () => AppState.removeEventListener('change', handleAppStateChange)
  })

  useEffect(() => {
    AsyncStorage.getItem(END_TIME_KEY).then(oldEndTime => {

      if (!!oldEndTime) {
        const now = new Date()
        const oldTimeLeft = differenceInSeconds(Date.parse(oldEndTime), now)
        if (oldTimeLeft > 0) {
          setTimeLeft(oldTimeLeft)
          setStatus(TimerStatus.STARTED)
        }
      }
    })
  }, [])

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active' && timerStatus === TimerStatus.STARTED) {
      // We just became STARTED again: recalculate elapsed time based 
      // on what we stored in AsyncStorage when we started.
      const elapsed = await getElapsedTime()
      // Update the elapsed seconds state
      setTimeLeft(elapsed)
    } else if (nextAppState !== 'active') {
      clearTimeout(lastTimeout)
    }
    appState.current = nextAppState
  }

  const getElapsedTime = async () => {
    try {
      const endTime = await AsyncStorage.getItem(END_TIME_KEY)
      const now = new Date()
      return differenceInSeconds(Date.parse(endTime), now)
    } catch (err) {
      // TODO: handle errors from setItem properly
      console.warn(err)
    }
  }

  const { secondsLeft, minutesLeft, hoursLeft, daysLeft } = getFormattedTimeLeft(timeLeft)

  return (
    <View>
      <Text>
        Timer {timerStatus === TimerStatus.STARTED && ' - Focado'}
      </Text>
      <Text>{daysLeft}:{hoursLeft}:{minutesLeft}:{secondsLeft}</Text>

      {timerStatus === TimerStatus.NOT_STARTED ? <Button title='Iniciar' onPress={onStartTimer} /> : <></>}
      {timerStatus === TimerStatus.STARTED && pausable ? <Button title='Pausar' onPress={onPauseTimer} /> : <></>}
      {timerStatus === TimerStatus.STARTED ? <Button title='Parar' onPress={pausable ? onInterruptTimer : onTryInterruptTimer} /> : <></>}
      {timerStatus === TimerStatus.PAUSED ? <Button title='Continuar' onPress={onContinueTimer} /> : <></>}
      {timerStatus === TimerStatus.FINISHED ? <Button title='Recomeçar' onPress={onRestartTimer} /> : <></>}
      {timerStatus === TimerStatus.TRYING_TO_INTERRUPT
        ?
        <>
          <Button title='Sim, quero parar' onPress={onInterruptTimer} />
          <Button title='Não, vou continuar' onPress={() => setStatus(TimerStatus.STARTED)} />
        </>
        :
        <></>}
    </View>
  )
}

export default Timer

type GenerateScheduledTime = {
  minutes?: number
  days?: number
  seconds?: number
  hours?: number
}

/**
 * @returns scheduled time in seconds
 */
const generateScheduledTime = ({ seconds = 0, minutes = 0, hours = 0, days = 0 }: GenerateScheduledTime) => {
  return seconds + minutesToSeconds(minutes) + hoursToSeconds(hours) + hoursToSeconds(days * 24)
}

/**
 * @param timeLeftInSecond Time left in seconds
 * @returns formatted time left in seconds, minutes, hours and days
 */
const getFormattedTimeLeft = (timeLeftInSecond: number) => {
  let difference = timeLeftInSecond

  const secondsLeft = (difference) % 60
  difference = secondsToMinutes(difference - secondsLeft)

  const minutesLeft = (difference) % 60
  difference = minutesToHours(difference - minutesLeft)

  const hoursLeft = (difference) % 24
  difference = (difference - hoursLeft) / 24

  const daysLeft = difference

  return {
    secondsLeft: formatTimeNumberToTimeString(secondsLeft),
    minutesLeft: formatTimeNumberToTimeString(minutesLeft),
    hoursLeft: formatTimeNumberToTimeString(hoursLeft),
    daysLeft: formatTimeNumberToTimeString(daysLeft)
  }
}

const formatTimeNumberToTimeString = (time: number) => (String(time).padStart(2, '0'))


const recordScheduledTime = async (scheduledTime: number) => {
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

const recordPauseTime = async () => {
  try {
    const now = new Date()
    await AsyncStorage.setItem(PAUSED_TIME_KEY, now.toISOString())
  } catch (err) {
    console.warn(err)
  }
}

const refrashRecordScheduledTime = async () => {
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

const cleanScheduledTime = async () => {
  try {
    await AsyncStorage.multiRemove([START_TIME_KEY, PAUSED_TIME_KEY, END_TIME_KEY])
  } catch (err) {
    console.warn(err)
  }
}