export interface SectionInfo {
  section: string;
  subsection?: string;
  start: number;
}

export interface PaperTopicMap {
  [topicName: string]: string;
}

export interface TextChunk {
  content: string;
  index: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
