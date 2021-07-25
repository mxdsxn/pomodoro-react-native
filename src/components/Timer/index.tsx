import React, { useState, useEffect, useRef } from 'react'
import { Text, View, AsyncStorage, AppState, AppStateStatus } from 'react-native'
import { differenceInSeconds } from 'date-fns'

import { styles, styleCicleButton } from './Timer.style'
import CustomButton from '../CustomButton'
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
      await recordPauseTime()
      clearTimeout(lastTimeout)
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
    await cleanScheduledTime()
    clearTimeout(lastTimeout)
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

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)

    lastTimeout = setTimeout(() => {
      if (timerStatus === TIMER_STATUS.STARTED && timeLeft > 0) {
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
    let styleButton
    let titleButton
    let onPressButton

    if (timerStatus === TIMER_STATUS.NOT_STARTED) {
      styleButton = styleCicleButton
      titleButton = '▶'
      onPressButton = onStartTimer
    }
    if (timerStatus === TIMER_STATUS.STARTED && pausable) {
      styleButton = styleCicleButton
      titleButton = '▐ ▌'
      onPressButton = onPauseTimer
    }
    if (timerStatus === TIMER_STATUS.STARTED) {
      styleButton = styleCicleButton
      titleButton = '■'
      onPressButton = pausable ? onInterruptTimer : onTryInterruptTimer
    }
    if (timerStatus === TIMER_STATUS.FINISHED) {
      styleButton = styleCicleButton
      titleButton = '↻'
      onPressButton = onRestartTimer
    }

    if (timerStatus === TIMER_STATUS.PAUSED) {
      styleButton = styleCicleButton
      titleButton = 'C'
      onPressButton = onContinueTimer
    }

    return <CustomButton style={styleButton} title={titleButton} onPress={onPressButton} />
  }

  const InterruptModal = () => {
    return timerStatus === TIMER_STATUS.TRYING_TO_INTERRUPT
      ? <TimerInterruptModal onDecline={onInterruptTimer} onAccept={() => setStatus(TIMER_STATUS.STARTED)} />
      : <></>
  }

  return (
    <View style={styles.container}>
      <TimerDisplay timeLeft={timeLeft} />
      <ButtonComponent />
      <InterruptModal />
    </View>
  )
}

export default Timer
