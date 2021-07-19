import Constants from 'expo-constants'
import { NotificationRequestInput, scheduleNotificationAsync } from 'expo-notifications'

const sendNotification = async (newNotification: NotificationRequestInput) => {
 if (!Constants.platform.web) {
  return await scheduleNotificationAsync(newNotification)
 }
 return null
}

export default sendNotification