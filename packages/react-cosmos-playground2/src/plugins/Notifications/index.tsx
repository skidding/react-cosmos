import { createPlugin } from 'react-plugin';
import { createArrayPlug } from '../../shared/slot';
import { Notifications, NotificationsProps } from './Notifications';
import { NotificationsSpec } from './public';
import { pushNotification } from './pushNotification';

const { register, onLoad, plug } = createPlugin<NotificationsSpec>({
  name: 'notifications',
  initialState: {
    notifications: []
  },
  methods: {
    pushNotification
  }
});

onLoad(context => {
  return () => {
    const { notifications } = context.getState();
    notifications.forEach(({ timeoutId }) => clearTimeout(timeoutId));
  };
});

plug({
  slotName: 'global',
  render: createArrayPlug<NotificationsProps>('global', Notifications),
  getProps: ({ getState }) => {
    const { notifications } = getState();
    return { notifications };
  }
});

export { register };
