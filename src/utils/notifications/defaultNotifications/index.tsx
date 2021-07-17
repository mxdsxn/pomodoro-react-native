import { NotificationRequestInput } from 'expo-notifications'

export const focusFinalMessageNotification: (timer: number) => NotificationRequestInput = (timer: number) => ({
 content: {
  title: "Parabens pelo foco! 🤘 ",
  body: 'Você ficou focado por 25 minutos.',
  data: { data: 'goes here' },
  color: '#ffb923',
 },
 trigger: { seconds: timer },
})
