import React from 'react'
import { Text, Pressable } from 'react-native'

type CustomButtonProps = { title?: string, onPress: () => void, color?: string, style: { container: any, text: any } }

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, style }: CustomButtonProps) => {
 return (
  <Pressable style={style.container} onPress={onPress}>
   {title && <Text style={style.text}>{title}</Text>}
  </Pressable>
 )
}

export default CustomButton