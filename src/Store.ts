import Node from "./Node";
import { StoreDefinition, NodeDefinition, EventListener } from "./types";
import { OnChangeCallback } from "./Node";

/*******************************************************************************
  Types
 ******************************************************************************/

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

    const { name, params, resolver, value, metadata } = nodeDef;
    if (resolver != null && params != null) {
      params.forEach((param) => {
        this.getDependenciesOrError(param).add(name);
      });
    }

    const paramNodes =
      params != null ? params.map((p) => this.getNodeOrError(p)) : [];

    const node = new Node({
      name,
      paramNodes,
      resolver,
      value,
      metadata,
      onChange: (value) => this.onNodeValueChange(name, value),
    });
    this.nodes[name] = node;
    this.dependencies[name] = new Set();
  };

  private onNodeValueChange = (nodeName: string, value: any): void => {
    const listeners = this.listeners[nodeName] || [];
    listeners.forEach((listener) => listener(value));
  };

  // ----------------------------
  // PUBLIC METHODS:

  public set = (nodeName: string, value: any): void => {
    const node = this.getNodeOrError(nodeName);

    if (node.isComputed()) {
      throw new ReferenceError(`Cannot set computed node: ${nodeName}`);
    }

    this.invalidate(nodeName);
    node.set(value);
  };

  async get(nodeName: string) {
    return await this.getNodeOrError(nodeName).get();
  }

  invalidate(nodeName: string) {
    const node = this.getNodeOrError(nodeName);
    if (node.isValid()) {
      node.invalidate();
      this.dependencies[nodeName].forEach((dep) => this.invalidate(dep));
    }
  }

  addListener(nodeName: string, listener: EventListener) {
    const nodeListeners = this.listeners[nodeName] || [];
    this.listeners = {
      ...this.listeners,
      [nodeName]: [...nodeListeners, listener],
    };
  }

  removeListener(nodeName: string, listener: EventListener) {
    const nodeListeners = this.listeners[nodeName] || [];
    this.listeners = {
      ...this.listeners,
      [nodeName]: [...nodeListeners.filter((l) => l !== listener)],
    };
  }

  dump() {
    const init: { [key: string]: any } = {};
    return Object.keys(this.nodes).reduce((result, key) => {
      result[key] = this.nodes[key].getRawValue();
      return result;
    }, init);
  }
}
