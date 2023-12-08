import { notification, Typography } from 'antd';

const { Text } = Typography;

notification.config({
  placement: 'bottom',
});

const showNotification = (message, description) => {
  notification.success({
    message,
    description: <Text code id="notification-description">{description}</Text>,
    onClick: () => {
      navigator.clipboard.writeText(description);
      document.getElementById('notification-description').innerText = 'Link Copied!';
    },
  });
};

export default showNotification;