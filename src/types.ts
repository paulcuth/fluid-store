export type Resolver<T> = (...args: any[]) => Promise<T | null>;

export type NodeDefinition<T> = {
  name: string;
  params: Array<string> | null;
  resolver: Resolver<T> | null;
  value: T | null | Symbol;
  metadata: {};
};

export type StoreDefinition = Array<NodeDefinition<any>>;

export type EventListener = (data: any) => void;
