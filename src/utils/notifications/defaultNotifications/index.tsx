import { NotificationRequestInput } from 'expo-notifications'

interface NotificationInterface { seconds: number }

type CreateNotificationType = (props: NotificationInterface) => NotificationRequestInput

export const focusFinalMessageNotification: CreateNotificationType = ({ seconds }) => ({
 content: {
  title: "Parabens pelo foco! 🤘 ",
  body: 'Você ficou focado por 25 minutos.',
  data: { data: 'goes here' },
  color: '#ffb923',
 },
 trigger: { seconds },
})
