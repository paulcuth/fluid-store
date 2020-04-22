import Node, { INVALID } from "./Node";
import { Resolver, NodeInitialisation } from "./types";

/*******************************************************************************
  Component
 ******************************************************************************/

export default class ComputedNode<T> extends Node<T> {
  private paramNodes: Array<Node<T>>;
  private resolver: Resolver<T | null>;

  static isComputedNode = (node: NodeInitialisation<any>): boolean => {
    return node.resolver != null;
  };

  constructor(nodeDef: NodeInitialisation<T>) {
    super(nodeDef);

    if (nodeDef.resolver == null) {
      throw new Error("Computed nodes must have a resolver");
    }

    const { paramNodes, resolver } = nodeDef;
    this.paramNodes = paramNodes || [];
    this.resolver = resolver;
    this.value = INVALID;
  }

  public get = async (path?: Array<string>): Promise<T | null> => {
    if (!this.isValidValue(this.value)) {
      const args = await Promise.all(
        this.paramNodes.map(async (p) => await p.get())
      );

      const value = await this.resolver(...args);
      this._set(value);
    }

    return this._getValueUsingPath(this.value, path);
  };

  public set = (value: T | null): void => {
    throw new ReferenceError(`Cannot set computed node: ${this.name}`);
  };
}
