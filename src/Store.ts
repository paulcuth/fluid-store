import Node, { INVALID } from "./Node";
import {
  StoreDefinition,
  NodeDefinition,
  EventListener,
  DumpOutput,
  Path,
  NodePathTuple,
} from "./types";
import { resolveNodePath, createNode } from "./utils";

/*******************************************************************************
  Component
 ******************************************************************************/

export default class FluidStore {
  private nodes: { [key: string]: Node<any> } = {};

  constructor(storeDef: StoreDefinition) {
    storeDef.forEach((nodeDef) => this.initNode(nodeDef));
  }

  // ----------------------------
  // PRIVATE METHODS:

  private getNodeOrError = (name: string): Node<any> => {
    const node = this.nodes[name];
    if (!node) {
      throw new ReferenceError(`Property '${name}' not found`);
    }
    return node;
  };

  private initNode = (nodeDef: NodeDefinition<any>) => {
    const existingNode = this.nodes[nodeDef.name];
    if (existingNode != null) {
      throw new ReferenceError(`Duplicate node name: ${nodeDef.name}`);
    }
    const resolveNodePath = this.resolveNodePath;
    const store = this;
    this.nodes[nodeDef.name] = createNode(nodeDef, { resolveNodePath, store });
  };

  // ----------------------------
  // PUBLIC METHODS:

  public set = (path: string, value: any): void => {
    const [node, property] = resolveNodePath(this.nodes, path);
    node.invalidate();
    node.set(property, value);
  };

  async get(path: string) {
    const [node, property] = resolveNodePath(this.nodes, path);
    return await node.get(property);
  }

  invalidate(nodeName: string) {
    const node = this.getNodeOrError(nodeName);
    node.invalidate();
  }

  addListener(nodeName: string, listener: EventListener) {
    const node = this.getNodeOrError(nodeName);
    node.addListener(listener);
  }

  removeListener(nodeName: string, listener: EventListener) {
    const node = this.getNodeOrError(nodeName);
    node.removeListener(listener);
  }

  resolveNodePath = (path: Path): NodePathTuple<any> => {
    return resolveNodePath(this.nodes, path);
  };

  dump(): DumpOutput {
    const keys = Object.keys(this.nodes);
    return keys.reduce(
      (result, key) => ({
        ...result,
        [key]: this.nodes[key].getRawValue(),
      }),
      {}
    );
  }

  toString = (): string => {
    const dump = this.dump();
    return JSON.stringify(
      dump,
      (key, value) => (value === INVALID ? null : value),
      2
    );
  };
}
