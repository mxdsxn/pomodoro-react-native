import React, { useState, useEffect, useRef } from 'react'
import { View, AsyncStorage, AppState, AppStateStatus } from 'react-native'
import { differenceInSeconds } from 'date-fns'

import { styles } from './Timer.style'
import ActionButton, { ActionButtonTypeProps } from '../ActionButton'
import TimerDisplay from '../TimerDisplay'
import {
  recordScheduledTime,
  recordPauseTime,
  refrashRecordScheduledTime,
  cleanScheduledTime,
  generateScheduledTime,
  getElapsedTime,
  TIMER_STATUS,
  END_TIME_KEY
} from './helpers'
import TimerInterruptModal from '../TimerInterruptModal'

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

const Timer: React.FC<TimerProps> = ({ seconds = 0, minutes = 0, hours = 0, days = 0, onStart, onFinish, onInterrupt, onPause, pausable = false, }: TimerProps) => {
  const appState = useRef(AppState.currentState)

  const scheduledTime = generateScheduledTime({ seconds, minutes, hours, days })
  const [timeLeft, setTimeLeft] = useState<number>(scheduledTime)
  const [timerStatus, setStatus] = useState<string>(TIMER_STATUS.NOT_STARTED)
  let lastTimeout: any = null

  const onStartTimer = async () => {
    try {
      await recordScheduledTime(scheduledTime)
      setStatus(TIMER_STATUS.STARTED)
      !!onStart && onStart()
    } catch (error) {
      console.warn(error)
    }
  }

  const onPauseTimer = async () => {
    if (pausable) {
      clearTimeout(lastTimeout)
      await recordPauseTime()
      setStatus(TIMER_STATUS.PAUSED)
      !!onPause && onPause()
    }
  }

  const onContinueTimer = async () => {
    if (pausable) {
      await refrashRecordScheduledTime()
      setStatus(TIMER_STATUS.STARTED)
    }
  }

  const onTryInterruptTimer = () => {
    setStatus(TIMER_STATUS.TRYING_TO_INTERRUPT)
  }

  const onInterruptTimer = async () => {
    clearTimeout(lastTimeout)
    await cleanScheduledTime()
    setStatus(TIMER_STATUS.FINISHED)
    !!onInterrupt && onInterrupt()
  }

  const onFinishTimer = async () => {
    await cleanScheduledTime()
    setStatus(TIMER_STATUS.FINISHED)
    !!onFinish && onFinish()
  }

  const onRestartTimer = () => {
    setTimeLeft(scheduledTime)
    setStatus(TIMER_STATUS.NOT_STARTED)
  }

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active' && timerStatus === TIMER_STATUS.STARTED) {
      const elapsed = await getElapsedTime()
      setTimeLeft(elapsed)
    } else if (nextAppState !== 'active') {
      clearTimeout(lastTimeout)
    }
    appState.current = nextAppState
  }

  const onFineshedAndRestart = async () => {
    await cleanScheduledTime()
    setTimeLeft(scheduledTime)
    setStatus(TIMER_STATUS.NOT_STARTED)
    !!onFinish && onFinish()
  }

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)

    lastTimeout = setTimeout(() => {
      const isActive = timerStatus === TIMER_STATUS.STARTED || timerStatus === TIMER_STATUS.TRYING_TO_INTERRUPT
      if (isActive && timeLeft > 0) {
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
          setStatus(TIMER_STATUS.STARTED)
        }
      }
    })
  }, [])

  const ButtonComponent = () => {
    let onPressActionButton = undefined
    let type: ActionButtonTypeProps

    if (timerStatus === TIMER_STATUS.NOT_STARTED) {
      onPressActionButton = onStartTimer
      type = 'play'
    } else if (timerStatus === TIMER_STATUS.STARTED && pausable) {
      onPressActionButton = onPauseTimer
      type = 'pause'
    } else if (timerStatus === TIMER_STATUS.STARTED) {
      onPressActionButton = pausable ? onInterruptTimer : onTryInterruptTimer
      type = 'stop'
    } else if (timerStatus === TIMER_STATUS.FINISHED) {
      onPressActionButton = onRestartTimer
      type = 'restart'
    } else if (timerStatus === TIMER_STATUS.PAUSED) {
      onPressActionButton = onContinueTimer
      type = 'continue'
    }

    const available = !!type && !!onPressActionButton

    return available
      ? (
        <View style={{ marginTop: 100, display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <ActionButton onPress={onPressActionButton} type={type} />
          {timerStatus === TIMER_STATUS.PAUSED && <ActionButton onPress={onFineshedAndRestart} type="restart" />}
        </View>
      )
      : <></>
  }

  return (
    <View style={styles.container}>
      <TimerDisplay timeLeft={timeLeft} />
      <ButtonComponent />
      <TimerInterruptModal
        onAccept={() => setStatus(TIMER_STATUS.STARTED)}
        onDecline={onInterruptTimer}
        isActive={timerStatus === TIMER_STATUS.TRYING_TO_INTERRUPT}
      />
    </View>
  )
}

export default Timer
