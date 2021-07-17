import Constants from 'expo-constants'
import { NotificationRequestInput, scheduleNotificationAsync } from 'expo-notifications'

const sendNotification = async (newNotification: NotificationRequestInput) => {
 if (!Constants.platform.web) {
  console.log(Constants.isDevice)
  return await scheduleNotificationAsync(newNotification)
 }
 return null
}

export default sendNotification