
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
  type: 'local' | 'simulated';
}
