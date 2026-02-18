
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export type PermissionStatus = 'default' | 'granted' | 'denied';

export interface HistoryItem {
  id: string;
  timestamp: Date;
  title: string;
  body: string;
  type: 'local' | 'remote';
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
