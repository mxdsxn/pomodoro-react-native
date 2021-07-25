import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import CustomButton from '../CustomButton'


type InterruptModalProps = {
 onDecline: () => void
 onAccept: () => void
}
const TimerInterruptModal: React.FC<InterruptModalProps> = ({ onDecline, onAccept }: InterruptModalProps) => {
 return (
  <View>
   <Text>Deseja interromper</Text>
   <CustomButton style={styleCenterButton} title='Sim' onPress={onDecline} />
   <CustomButton style={styleCenterButton} title='Não' onPress={onAccept} />
  </View>
 )
}

export default TimerInterruptModal

const styleCicleButton = StyleSheet.create({
 container: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 23,
  borderRadius: 100,
  elevation: 3,
  backgroundColor: '#be4541',
  width: 82,
 },
 text: {
  fontSize: 24,
  fontWeight: 'bold',
  letterSpacing: 0.25,
  color: 'white',
 }
})

const styleCenterButton = StyleSheet.create({
 container: {
  ...styleCicleButton.container,
  alignSelf: 'center',
 },
 text: {
  ...styleCicleButton.text
 }
})