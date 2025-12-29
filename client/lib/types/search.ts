export type SearchTask = {
  id: string;
  title: string;
  status: string;
  sprintId: string | null;
  createdAt: string;
};

export type SearchDeliverable = {
  id: string;
  title: string;
  status: string;
  phaseId: string;
  createdAt: string;
};

export type SearchComment = {
  id: string;
  content: string;
  authorName: string;
  taskId: string | null;
  deliverableId: string | null;
  createdAt: string;
};

export type SearchMeetingLog = {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
};

export type SearchResults = {
  tasks: SearchTask[];
  deliverables: SearchDeliverable[];
  comments: SearchComment[];
  meetingLogs: SearchMeetingLog[];
};
