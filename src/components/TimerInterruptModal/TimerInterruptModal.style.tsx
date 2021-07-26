import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
 container: {
  paddingTop: 20,
  display: 'flex',
 },
 questionText: {
  display: 'flex',
  flexDirection: 'row',
  alignSelf: 'center',
  fontSize: 17,
  paddingTop: 30,
  paddingBottom: 15,
  color: '#fff',
  textTransform: 'uppercase'
 },
 buttonsWrapper: {
  display: 'flex',
  justifyContent: 'space-evenly',
  flexDirection: 'row',
  paddingVertical: 15,
 },
 buttonContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 1,
  backgroundColor: '#bd3838',
  width: 85,
  height: 60,
  borderRadius: 100,
 },
 text: {
  fontSize: 20,
  color: '#fff',
 }
})
