import React, { ReactNode } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'

type CustomButtonProps = {
 onPress: () => void,
 style: StyleProp<ViewStyle>
 children: ReactNode
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, onPress, style }: CustomButtonProps) => {
 return (
  <Pressable style={style} onPress={onPress}>
   {children}
  </Pressable>
 )
}

export default CustomButton