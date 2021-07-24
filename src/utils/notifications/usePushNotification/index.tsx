import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const usePushNotification = async () => {
 let token

 if (Constants.isDevice && !Constants.platform.web) {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
   const { status } = await Notifications.requestPermissionsAsync()
   finalStatus = status
  }

  if (finalStatus !== 'granted') {
   alert('Falha ao obter permissão para envio de notificações.')
   return null
  }

  token = (await Notifications.getExpoPushTokenAsync()).data
 } else {
  if (!Constants.platform.web) {
   alert('Utilize o app em um dispositivo real.')
  }
 }

 if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
   name: 'default',
   importance: Notifications.AndroidImportance.HIGH,
   vibrationPattern: [0, 250, 250, 250],
   lightColor: '#FFB9237C',
   lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
   enableVibrate: true
  })
 }

 return token
}

export default usePushNotification