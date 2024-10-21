export interface Reminder {
  id: number;
  text: string;
  date: string;
}

export interface ReminderCreate {
  text: string;
  date: string;
}
