export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
}

export interface NoteCreate {
  title: string;
  content: string;
}
