import Node, { INVALID } from "./Node";
import {
  Resolver,
  NodeDefinition,
  ComputedNodeDefinition,
  NodePathTuple,
  NodeAPI,
  Path,
} from "./types";
import { resolvePathInObject } from "./utils";

/*******************************************************************************
  Component
 ******************************************************************************/

export default class ComputedNode<T> extends Node<T> {
  private paramNodePaths: Array<NodePathTuple<T>>;
  private resolver: Resolver<T | null>;

  /**
    Evaluate is the node definition looks like a computed node
   */
  static isComputedNode = (
    nodeDef: NodeDefinition<any>
  ): nodeDef is ComputedNodeDefinition<any> => {
    return "resolver" in nodeDef;
  };

  /**
    Initialise the node
   */
  constructor(nodeDef: ComputedNodeDefinition<T>, api: NodeAPI) {
    super(nodeDef, api);

    if (nodeDef.resolver == null) {
      throw new Error("Computed nodes must have a resolver");
    }

    const { params, resolver } = nodeDef;
    this.paramNodePaths = (params ?? []).map(api.resolveNodePath);
    this.resolver = resolver;
    this.value = INVALID;

    this.paramNodePaths.forEach(([node]) => node.addDependency(this));
  }

  /**
    Return the value of the node, evaluating dependencies if necessary.
   */
  public get = async (path: Path = []): Promise<T | null> => {
    if (!this.isValidValue(this.value)) {
      const args = await Promise.all(
        this.paramNodePaths.map(async ([node, path]) => await node.get(path))
      );

      const value = await this.resolver(...args);
      this._set([], value);
    }

    return resolvePathInObject(path, this.value);
  };

  /**
    Throw an error if consumer attempts to update a computed node.
   */
  public set = (): never => {
    throw new ReferenceError(`Cannot set computed node: ${this.name}`);
  };
}
