export type UserRole = 'admin' | 'writer' | 'designer' | 'client';

export type PostStatus = 
  | 'draft' 
  | 'copy_review' 
  | 'copy_rejected' 
  | 'design_draft' 
  | 'design_review' 
  | 'design_rejected' 
  | 'approved';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  client_id: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  created_at: string;
}

export interface Post {
  id: string;
  client_id: string;
  title: string;
  status: PostStatus;
  publish_date: string | null;
  copy_content: string | null;
  design_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostVersion {
  id: string;
  post_id: string;
  stage: 'copy' | 'design';
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  stage: 'copy' | 'design';
  text: string;
  created_at: string;
}
