import Node, { INVALID } from "./Node";
import Store from "./Store";
import {
  NodeDefinition,
  StoreNodeDefinition,
  DumpOutput,
  NodeAPI,
  Path,
} from "./types";

/*******************************************************************************
  Component
 ******************************************************************************/

export default class StoreNode extends Node<Store> {
  public store: Store;

  static isStoreNode = (
    nodeDef: NodeDefinition<any>
  ): nodeDef is StoreNodeDefinition<any> => {
    return "store" in nodeDef;
  };

  constructor(nodeDef: StoreNodeDefinition<Store>, api: NodeAPI) {
    super(nodeDef, api);

    if (nodeDef.store == null) {
      throw new Error("Store nodes must have a store definition");
    }

    this.store = new Store(nodeDef.store);
    if (nodeDef.map != null) {
      Object.keys(nodeDef.map).map((destinationPath) => {
        const sourcePath = nodeDef.map[destinationPath];
        api.store.addListener(sourcePath, (value: any) =>
          this.store.set(destinationPath, value)
        );
      });
    }
  }

  public get = async (path: Array<string>): Promise<Store | null> => {
    if (path == null || path.length === 0) {
      return this.store;
    }
    const r = this.store.get(path.join("."));
    return r;
  };

  public set = (path: Path, value: any): void => {
    const pathStr = Array.isArray(path) ? path.join(".") : path;
    this.store.set(pathStr, value);
  };

  public getRawValue = (): DumpOutput => this.store.dump();
}
