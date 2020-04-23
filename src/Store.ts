import Node from "./Node";
import {
  StoreDefinition,
  NodeDefinition,
  EventListener,
  DumpOutput,
} from "./types";
import createNode from "./createNode";

/*******************************************************************************
  Component
 ******************************************************************************/

export default class FluidStore {
  private nodes: { [key: string]: Node<any> } = {};
  private dependencies: { [key: string]: Set<string> } = {};
  private listeners: {
    [key: string]: Array<EventListener>;
  } = {};
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

  private getDependenciesOrError = (name: string): Set<string> => {
    const deps = this.dependencies[name];
    if (!deps) {
      throw new ReferenceError(`Node '${name}' not found`);
    }
    return deps;
  };

  private initNode = (nodeDef: NodeDefinition<any>) => {
    const existingNode = this.nodes[nodeDef.name];
    if (existingNode != null) {
      throw new ReferenceError(`Duplicate node name: ${nodeDef.name}`);
    }

    const { name, params, resolver, value, store, metadata } = nodeDef;
    if (resolver != null && params != null) {
      params.forEach((param) => {
        this.getDependenciesOrError(param).add(name);
      });
    }

    const paramNodes =
      params != null ? params.map((p) => this.getNodeOrError(p)) : [];

    const node = createNode({
      name,
      paramNodes,
      resolver,
      value,
      store,
      metadata,
    });
    this.nodes[name] = node;
    this.dependencies[name] = new Set();
  };

  // ----------------------------
  // PUBLIC METHODS:

  public set = (nodeName: string, value: any): void => {
    const node = this.getNodeOrError(nodeName);
    this.invalidate(nodeName);
    node.set(value);
  };

  async get(path: string) {
    const identifiers = path.split(".");
    const properties: Array<string> = [];
    let node;

    do {
      const nodeName = identifiers.join(".");
      node = this.nodes[nodeName];
      if (node == null) {
        const next = identifiers.pop();
        if (next != null) {
          properties.unshift(next);
        }
      }
    } while (node == null && identifiers.length > 0);

    if (node == null) {
      throw new ReferenceError(`Property path '${path}' not found`);
    }

    return await node.get(properties);
  }

  invalidate(nodeName: string) {
    const node = this.getNodeOrError(nodeName);
    if (node.isValid()) {
      node.invalidate();
      this.dependencies[nodeName].forEach((dep) => this.invalidate(dep));
    }
  }

  addListener(nodeName: string, listener: EventListener) {
    const node = this.getNodeOrError(nodeName);
    node.addListener(listener);
  }

  removeListener(nodeName: string, listener: EventListener) {
    const node = this.getNodeOrError(nodeName);
    node.removeListener(listener);
  }

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
    return JSON.stringify(dump, null, 2);
  };
}
