import React, { useState, useEffect } from 'react'
import { Text, View, Button } from 'react-native'

const SECOND_REF = 1000
const MINUTE_REF = SECOND_REF * 60
const HOURS_REF = MINUTE_REF * 60
const DAY_REF = HOURS_REF * 24

const TimerStatus = {
 RUNNING: 'running',
 NOT_STARTED: 'not started',
 FINISHED: 'finished',
 PAUSED: 'paused'
}

type TimerProps = {
 minutes: number
 onFinish?: () => any
 onStart?: () => any
 onInterrupt?: () => any
 interruptible?: boolean
}

const Timer: React.FC<TimerProps> = ({ minutes, onFinish, onStart, onInterrupt, interruptible = false }: TimerProps) => {
 const [timeLeft, setTimeLeft] = useState(1000 * 60 * minutes)
 const [isActive, setActive] = useState<boolean>(false)
 const [tryInterrupt, setTryInterrupt] = useState<boolean>(false)
 const [status, setStatus] = useState<string>(TimerStatus.NOT_STARTED)

 const onFinishTimer = () => {
  setActive(false)
  setStatus(TimerStatus.FINISHED)
  !!onFinish && onFinish()
 }

 const onStartTimer = () => {
  setActive(true)
  setStatus(TimerStatus.RUNNING)
  console.log(!!onStart)
  !!onStart && onStart()
 }

 const onInterruptTimer = () => {
  if (interruptible) {
   setActive(false)
   setStatus(TimerStatus.PAUSED)
   !!onInterrupt && onInterrupt()
  } else {
   setTryInterrupt(true)
  }
 }

 const onContinueTimer = () => {
  if (interruptible) {
   setActive(true)
   setStatus(TimerStatus.RUNNING)
  }
 }

 const onRestartTimer = () => {
  setActive(false)
  setTimeLeft(1000 * 60 * minutes)
  setStatus(TimerStatus.NOT_STARTED)
 }

 let difference = timeLeft

 let secondsLeft = (difference / SECOND_REF) % 60
 difference = difference - secondsLeft * SECOND_REF

 let minutesLeft = (difference / MINUTE_REF) % 60
 difference = difference - minutesLeft * MINUTE_REF

 let hoursLeft = (difference / HOURS_REF) % 24
 difference = difference - hoursLeft * HOURS_REF

 let daysLeft = (difference / DAY_REF)
 difference = difference - daysLeft * DAY_REF

 useEffect(() => {
  setTimeout(() => {
   if (isActive && timeLeft > 0) {
    setTimeLeft(timeLeft - 1000)
   }
  }, 1000)

  if (timeLeft === 0) {
   onFinishTimer()
  }
 })

 return (
  <View>
   {tryInterrupt ? <View ><Text></Text></View> : <></>}
   <Text>
    Timer {isActive && ' - Focado'}
   </Text>
   <Text>{daysLeft} dia</Text>
   <Text>{hoursLeft} hora</Text>
   <Text>{minutesLeft} minuto</Text>
   <Text>{secondsLeft} segundo</Text>
   {status === TimerStatus.NOT_STARTED ? <Button title='Iniciar' onPress={onStartTimer} /> : <></>}
   {status === TimerStatus.RUNNING ? <Button title='Parar' onPress={onInterruptTimer} /> : <></>}
   {status === TimerStatus.PAUSED ? <Button title='Continuar' onPress={onContinueTimer} /> : <></>}
   {status === TimerStatus.FINISHED ? <Button title='Recomeçar' onPress={onRestartTimer} /> : <></>}
  </View>
 )
}

export default Timer