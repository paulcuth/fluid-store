import Node, { INVALID } from "./Node";
import Store from "./Store";
import { NodeInitialisation, DumpOutput } from "./types";

/*******************************************************************************
  Component
 ******************************************************************************/

export default class StoreNode extends Node<Store> {
  private store: Store;

  static isStoreNode = (node: NodeInitialisation<any>): boolean => {
    return node.store != null;
  };

  constructor(nodeDef: NodeInitialisation<Store>) {
    super(nodeDef);

    if (nodeDef.store == null) {
      throw new Error("Store nodes must have a store definition");
    }

    this.store = new Store(nodeDef.store);
  }

  public get = async (path?: Array<string>): Promise<Store | null> => {
    if (path == null || path.length === 0) {
      return this.store;
    }
    return this.store.get(path.join("."));
  };

  public set = (value: Store | null): void => {
    throw new ReferenceError("Cannot call set on a store node");
  };

  public getRawValue = (): DumpOutput => this.store.dump();
}
