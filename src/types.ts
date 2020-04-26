import Store from "./Store";
import Node from "./Node";

export type StoreDefinition = Array<NodeDefinition<any>>;
export type Resolver<T> = (...args: any[]) => Promise<T | null>;
export type OnNodeValueChangeCallback<T> = (value: T | null | Symbol) => void;

export type NodeMetadata = {};

export type VariableNodeDefinition<T> = {
  name: string;
  metadata?: NodeMetadata;
  value?: T | null | Symbol;
};

export type ComputedNodeDefinition<T> = {
  name: string;
  metadata?: NodeMetadata;
  params?: Array<string>;
  resolver: Resolver<T>;
};

export type StoreNodeDefinition<T> = {
  name: string;
  metadata?: NodeMetadata;
  store: StoreDefinition;
  map: { [key: string]: string };
};

export type NodeDefinition<T> =
  | VariableNodeDefinition<T>
  | ComputedNodeDefinition<T>
  | StoreNodeDefinition<T>;

export type EventListener = (data: any) => void;

export type DumpOutput = { [key: string]: any };

export type Path = string | Array<string>;

export type NodePathTuple<T> = [Node<T>, Path];

export type NodeAPI = {
  resolveNodePath: (path: Path) => NodePathTuple<any>;
  store: Store;
};
