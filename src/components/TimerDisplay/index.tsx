import React from 'react'
import { Text, View } from 'react-native'
import { styles } from './TimerDisplay.style'
import { getFormattedTimeLeft } from './helpers'

type DisplayTimerProps = { timeLeft: number }

const TimerDisplay: React.FC<DisplayTimerProps> = ({ timeLeft }: DisplayTimerProps) => {
 const { secondsLeft, minutesLeft } = getFormattedTimeLeft(timeLeft)

 return (
  <Text style={styles.timer}>
   <View style={styles.timeContainer}><Text style={styles.timeText}>{minutesLeft}</Text></View>
   <View><Text style={styles.timeColon}>:</Text></View>
   <View style={styles.timeContainer}><Text style={styles.timeText}>{secondsLeft}</Text></View>
  </Text >
 )
}

export default TimerDisplay