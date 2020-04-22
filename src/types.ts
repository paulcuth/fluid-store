import Node from "./Node";

export type Resolver<T> = (...args: any[]) => Promise<T | null>;
export type OnNodeValueChangeCallback<T> = (value: T | null | Symbol) => void;

export type NodeDefinition<T> = {
  name: string;
  params: Array<string> | null;
  resolver: Resolver<T> | null;
  value: T | null | Symbol;
  store: Array<NodeDefinition<any>> | null;
  metadata: {};
};

export type NodeInitialisation<T> = {
  name: string;
  paramNodes: Array<Node<any>>;
  resolver: Resolver<T | null> | null;
  value: T | null | Symbol;
  store: Array<NodeDefinition<any>> | null;
  metadata: {};
  onChange: OnNodeValueChangeCallback<T>;
};

export type StoreDefinition = Array<NodeDefinition<any>>;

export type EventListener = (data: any) => void;

export type DumpOutput = { [key: string]: any };
