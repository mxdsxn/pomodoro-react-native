import * as Notifications from 'expo-notifications'
import React, { useState, useEffect } from 'react'
import { Text, View, Button, NativeEventSubscription } from 'react-native'

import Timer from './src/components/timer'
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
  const [time, setTime] = useState<number>(0.05)
  const [isFocused, setFocus] = useState<boolean>(false)
  const [_, setExpoPushToken] = useState<string>('')
  const [notification, setNotification] = useState<Notifications.Notification>(null)

  let receivedNotificationListener: NativeEventSubscription = null
  let responseReceivedNotificationListener: NativeEventSubscription = null

  useEffect(() => {
    usePushNotification().then(token => setExpoPushToken(token))

    // registra listener para recebimento de notificacao
    receivedNotificationListener = Notifications.addNotificationReceivedListener(notification => {
      // callback de notificacao recebida
      setNotification(notification)
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

  const toggleFocus = async () => {
    if (!isFocused) {
      setFocus(true)
    } else {
      setFocus(false)
      notification && await Notifications.cancelScheduledNotificationAsync(notification.request.identifier)
      console.log(notification)
    }
  }

  const showRegisteredNotifications = async () => {
    console.log((await Notifications.getAllScheduledNotificationsAsync()).map(notification => notification.identifier))
  }

  const onFinishTimer = () => {
    setFocus(false)
  }

  const onStartTimer = () => {
    sendNotification(focusFinalMessageNotification(3))
    console.log('teste')
    setFocus(true)
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
      <Timer onStart={onStartTimer} minutes={time} onFinish={onFinishTimer} interruptible />
      <Button
        title='Mostrar registro'
        onPress={showRegisteredNotifications}
      />
    </View>
  )
}
