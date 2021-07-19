import * as Notifications from 'expo-notifications'
import React, { useState, useEffect } from 'react'
import { Text, View, Button, NativeEventSubscription } from 'react-native'

import Timer, { MINUTE_REF } from './src/components/timer'
import usePushNotification from './src/utils/notifications/usePushNotification'
import sendNotification from './src/utils/notifications/sendNotification'
import { focusFinalMessageNotification } from './src/utils/notifications/defaultNotifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
})

export default function App() {
  const minutesTime = 25
  const [__, setFocus] = useState<boolean>(false)
  const [_, setExpoPushToken] = useState<string>('')
  const [notificationId, setNotificationId] = useState<string>(null)

  let receivedNotificationListener: NativeEventSubscription = null
  let responseReceivedNotificationListener: NativeEventSubscription = null

  useEffect(() => {
    usePushNotification().then(token => setExpoPushToken(token))

    // registra listener para recebimento de notificacao
    receivedNotificationListener = Notifications.addNotificationReceivedListener(notification => {
      // callback de notificacao 
    })

    // registra listener para click em notificacao
    responseReceivedNotificationListener = Notifications.addNotificationResponseReceivedListener(response => {
      // callback de notificacao clicada
    })

    // callback do *useEffect* para quando o componente for desmontado
    // removendo listeners de notificacoes
    return () => {
      Notifications.removeNotificationSubscription(receivedNotificationListener)
      Notifications.removeNotificationSubscription(responseReceivedNotificationListener)
    }
  }, [])

  const showRegisteredNotifications = async () => {
    console.log((await Notifications.getAllScheduledNotificationsAsync()))
  }

  const onFinishTimer = () => {
    setFocus(false)
  }

  const onStartTimer = async () => {
    setNotificationId(await sendNotification(focusFinalMessageNotification({ seconds: MINUTE_REF * minutesTime / 1000 })))
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
        minutes={minutesTime}
        onStart={onStartTimer}
        onFinish={onFinishTimer}
        onInterrupt={onInterruptTimer}
      />
      <Button
        title='Mostrar registro'
        onPress={showRegisteredNotifications}
      />
    </View>
  )
}
