export interface Tag {
  id: string;
  name: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  url: string;
  salary?: string;
  level: 'ESTAGIO' | 'JUNIOR' | 'PLENO';
  type: 'FRONTEND' | 'BACKEND' | 'FULLSTACK' | 'MOBILE';
  remote: boolean;
  source: Source;
  sourceId: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
}

export interface JobsResponse {
  data: Job[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JobsQuery {
  search?: string;
  level?: string;
  type?: string;
  remote?: boolean;
  source?: string;
  tags?: string;
  ids?: string;
  techs?: string;
  period?: '24h' | '7d' | '30d';
  sort?: 'recent' | 'oldest' | 'match';
  page?: number;
  limit?: number;
}

export interface JobStats {
  total: number;
  bySource: { source: string; count: number }[];
  byLevel: { level: string; count: number }[];
  byType: { type: string; count: number }[];
  remote: number;
}
