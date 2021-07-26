import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
 container: {
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 100,
  elevation: 1,
  width: 90,
  height: 90,
 }
})

export const stylesRestart = StyleSheet.create({
 container: {
  ...styles.container,
  paddingLeft: 3,
 }
})