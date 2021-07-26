import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import CustomButton from '../CustomButton'

import { styles } from './TimerInterruptModal.style'

type InterruptModalProps = {
  onDecline: () => void
  onAccept: () => void
  isActive: boolean
}
const TimerInterruptModal: React.FC<InterruptModalProps> = ({ onDecline, onAccept, isActive = false }: InterruptModalProps) => {
  const iconSize = 35
  return isActive
    ? (
      <View style={styles.container}>
        <Text style={styles.questionText}>Deseja interromper</Text>
        <View style={styles.buttonsWrapper}>
          <CustomButton style={styles.buttonContainer} onPress={onDecline} >
            <Ionicons name="md-checkmark-sharp" size={iconSize} color="white" />
          </CustomButton>
          <CustomButton style={{ ...styles.buttonContainer, backgroundColor: 'white' }} onPress={onAccept} >
            <Ionicons name="md-close-sharp" size={iconSize} color="#bd3838" />
          </CustomButton>
        </View>
      </View>
    )
    : <></>
}

export default TimerInterruptModal
