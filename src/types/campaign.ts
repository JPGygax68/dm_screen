export interface Campaign {
  id: string;
  name: string;
  description?: string;
  party?: unknown[];
  encounters?: unknown[];
}
