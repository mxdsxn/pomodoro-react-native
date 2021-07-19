import React, { useState, useEffect } from 'react'
import { Text, View, Button } from 'react-native'

export const SECOND_REF = 1000
export const MINUTE_REF = SECOND_REF * 60
export const HOURS_REF = MINUTE_REF * 60
export const DAYS_REF = HOURS_REF * 24

const TimerStatus = {
 RUNNING: 'running',
 NOT_STARTED: 'not started',
 FINISHED: 'finished',
 PAUSED: 'paused'
}

type TimerProps = {
 minutes?: number
 days?: number
 seconds?: number
 hours?: number
 onFinish?: () => any
 onStart?: () => any
 onInterrupt?: () => any
 interruptible?: boolean
}

const Timer: React.FC<TimerProps> = ({ seconds = 0, minutes = 0, hours = 0, days = 0, onFinish, onStart, onInterrupt, interruptible = false }: TimerProps) => {
 const initialTime = seconds * SECOND_REF + minutes * MINUTE_REF + hours * HOURS_REF + days * DAYS_REF
 const [timeLeft, setTimeLeft] = useState(initialTime)
 const [isActive, setActive] = useState<boolean>(false)
 const [tryInterrupt, setTryInterrupt] = useState<boolean>(false)
 const [status, setStatus] = useState<string>(TimerStatus.NOT_STARTED)
 let lastTimeout: any = null

 const onFinishTimer = () => {
  setActive(false)
  setTryInterrupt(false)
  setStatus(TimerStatus.FINISHED)
  !!onFinish && onFinish()
 }

 const onStartTimer = () => {
  setActive(true)
  setTryInterrupt(false)
  setStatus(TimerStatus.RUNNING)
  !!onStart && onStart()
 }

 const onTryInterruptTimer = () => {
  if (interruptible) {
   clearTimeout(lastTimeout)
   setActive(false)
   setStatus(TimerStatus.PAUSED)
   !!onInterrupt && onInterrupt()
  } else {
   setTryInterrupt(true)
  }
 }

 const onInterruptTimer = () => {
  clearTimeout(lastTimeout)
  setTryInterrupt(false)
  setActive(false)
  setStatus(TimerStatus.FINISHED)
  !!onInterrupt && onInterrupt()
 }

 const onContinueTimer = () => {
  setTryInterrupt(false)
  if (interruptible) {
   setActive(true)
   setStatus(TimerStatus.RUNNING)
  }
 }

 const onRestartTimer = () => {
  setActive(false)
  setTryInterrupt(false)
  setTimeLeft(initialTime)
  setStatus(TimerStatus.NOT_STARTED)
 }

 let difference = timeLeft

 let secondsLeft = (difference / SECOND_REF) % 60
 difference = difference - secondsLeft * SECOND_REF

 let minutesLeft = (difference / MINUTE_REF) % 60
 difference = difference - minutesLeft * MINUTE_REF

 let hoursLeft = (difference / HOURS_REF) % 24
 difference = difference - hoursLeft * HOURS_REF

 let daysLeft = (difference / DAYS_REF)
 difference = difference - daysLeft * DAYS_REF

 useEffect(() => {
  lastTimeout = setTimeout(() => {
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
   {daysLeft > 0 && <Text>{daysLeft} dia</Text>}
   {hoursLeft > 0 && <Text>{hoursLeft} hora</Text>}
   {minutesLeft > 0 && <Text>{minutesLeft} minuto</Text>}
   {secondsLeft > 0 && <Text>{secondsLeft} segundo</Text>}
   {status === TimerStatus.NOT_STARTED ? <Button title='Iniciar' onPress={onStartTimer} /> : <></>}
   {status === TimerStatus.RUNNING && !tryInterrupt ? <Button title='Parar' onPress={onTryInterruptTimer} /> : <></>}
   {status === TimerStatus.PAUSED && !tryInterrupt ? <Button title='Continuar' onPress={onContinueTimer} /> : <></>}
   {status === TimerStatus.FINISHED ? <Button title='Recomeçar' onPress={onRestartTimer} /> : <></>}
   {status === TimerStatus.RUNNING && tryInterrupt
    ?
    <>
     <Button title='Sim, quero parar' onPress={onInterruptTimer} />
     <Button title='Não, vou continuar' onPress={() => setTryInterrupt(false)} />
    </>
    :
    <></>}
  </View>
 )
}

export default Timer