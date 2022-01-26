export type Answer = 'E' | 'G' | 'Y';

export type CheckFn = (attempt: string) => Promise<Answer[]>;
