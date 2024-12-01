export enum Token {
  AUTH = 'auth',
  PROJECT = 'project',
}

export type TokenType = {
  projectId?: string;
  userId?: string;
  token: string;
  type: Token;
  isValid: boolean;
  duration: number;
};
