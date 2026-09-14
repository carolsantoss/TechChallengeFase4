import { Alert, Platform } from 'react-native';

export const showFeedback = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(title ? `${title}: ${message}` : message);
    }
    if (onOk) {
      onOk();
    }
  } else {
    Alert.alert(
      title,
      message,
      onOk ? [{ text: 'OK', onPress: onOk }] : undefined
    );
  }
};
