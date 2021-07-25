import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
 timer: {
  display: 'flex',
  textAlign: 'center',
  fontFamily: 'OpenSans_300Light',
  fontSize: 25,
  position: 'absolute',
  alignSelf: 'center',
  textAlignVertical: 'center',
  bottom: 100,
 },
 timeContainer: {
  backgroundColor: '#ffffffcc',
  borderTopStartRadius: 10,
  borderBottomEndRadius: 10,
  paddingHorizontal: 5,
 },
 timeColon: {
  color: '#fff0f07b',
  paddingRight: 3,
  paddingLeft: 2,
  fontSize: 68,
  paddingBottom: 10
 },
 timeText: {
  color: '#cc130cdd',
  fontSize: 68,
 },
})
