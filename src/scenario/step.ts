export type Step = {
  name: string;
  operation: string; // query or mutation
  variables?: (ctx: any) => Record<string, any>;
  assert?: (result: any, ctx: any) => void;
  after?: (result: any, ctx: any) => void;
  score?: number; // optional points for this step
};