import React from 'react'
import { Ionicons, Entypo } from '@expo/vector-icons'

import CustomButton from '../CustomButton'
import { styles, stylesRestart } from './ActionButton.style'

export type ActionButtonTypeProps = 'play' | 'pause' | 'stop' | 'restart' | 'continue'

type ActionButtonProps = {
  onPress: () => void,
  type: ActionButtonTypeProps
}

const ActionButton = ({ type, onPress }: ActionButtonProps) => {
  const iconSize = 35
  const isRestart = type === 'restart'
  const iconColor = type !== 'play' ? '#cc130cdd' : 'white'
  const buttonColor = type !== 'play' ? 'white' : '#bd3838'

  const styleButton = (isRestart ? stylesRestart : styles).container

  return (
    <CustomButton style={{ ...styleButton, backgroundColor: buttonColor }} onPress={onPress} >
      {type !== 'restart'
        ? <Ionicons name={type === 'continue' ? 'play' : type} size={iconSize} color={iconColor} />
        : <Entypo name="cw" size={iconSize} color={iconColor} />
      }
    </CustomButton>
  )
}

export default ActionButton