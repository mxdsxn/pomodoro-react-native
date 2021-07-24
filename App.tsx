import * as Notifications from 'expo-notifications'
import React, { useState, useEffect } from 'react'
import { Text, View, Button, NativeEventSubscription, AsyncStorage } from 'react-native'

import Timer from './src/components/timer'
import usePushNotification from './src/utils/notifications/usePushNotification'
import sendNotification from './src/utils/notifications/sendNotification'
import { focusFinalMessageNotification } from './src/utils/notifications/defaultNotifications'
import { minutesToSeconds } from 'date-fns'

const NOTIFICATION_ID_KEY = '@notification_id'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
})

export default function App() {
  const scheduledTimeInSeconds = minutesToSeconds(25)
  const [__, setFocus] = useState<boolean>(false)
  const [_, setExpoPushToken] = useState<string>('')
  const [notificationId, setNotificationId] = useState<string>(null)

  let receivedNotificationListener: NativeEventSubscription = null
  let responseReceivedNotificationListener: NativeEventSubscription = null

  useEffect(() => {
    showRegisteredNotifications()
    AsyncStorage.getItem(NOTIFICATION_ID_KEY).then((oldNotificationId) => {
      if (!!oldNotificationId)
        setNotificationId(oldNotificationId)
    })

    usePushNotification().then(token => setExpoPushToken(token))

    // registra listener para recebimento de notificacao
    receivedNotificationListener = Notifications.addNotificationReceivedListener(async () => { /* callback de notificacao */
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY)
      setNotificationId(null)
    })

    // registra listener para click em notificacao
    responseReceivedNotificationListener = Notifications.addNotificationResponseReceivedListener(() => { /* callback de notificacao clicada*/ })

    // callback do *useEffect* para quando o componente for desmontado
    // removendo listeners de notificacoes
    return () => {
      Notifications.removeNotificationSubscription(receivedNotificationListener)
      Notifications.removeNotificationSubscription(responseReceivedNotificationListener)
    }
  }, [])

  const showRegisteredNotifications = async () => {
    const allNotification = await Notifications.getAllScheduledNotificationsAsync() || []
    console.log(allNotification, { length: allNotification.length })
  }

  const onFinishTimer = () => {
    setFocus(false)
  }

  const onStartTimer = async () => {
    const notificationId = await sendNotification(focusFinalMessageNotification({ seconds: scheduledTimeInSeconds }))
    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId)
    setNotificationId(notificationId)

    setFocus(true)
  }

  const onInterruptTimer = async () => {
    notificationId && await Notifications.cancelScheduledNotificationAsync(notificationId)
    setFocus(false)
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#999',
      }}>
      <Text style={{ color: 'white' }}>Pomodoro do madim</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      </View>
      <Timer
        seconds={scheduledTimeInSeconds}
        onStart={onStartTimer}
        onFinish={onFinishTimer}
        onInterrupt={onInterruptTimer}
      />
      {process.env.NODE_ENV === 'development' &&
        <Button
          title='Mostrar registro de notifição'
          onPress={showRegisteredNotifications}
        />}
    </View>
  )
}
