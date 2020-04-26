import Node, { INVALID } from "./Node";
import { resolvePathInObject } from "./utils";
import { VariableNodeDefinition, NodeAPI, Path } from "./types";

/*******************************************************************************
  Component
 ******************************************************************************/

export default class VariableNode<T> extends Node<T> {
  constructor(nodeDef: VariableNodeDefinition<T>, api: NodeAPI) {
    super(nodeDef, api);
    this.value = nodeDef.value == null ? null : nodeDef.value;
  }

  public get = async (path: Path = []): Promise<T | null> => {
    if (!this.isValidValue(this.value)) {
      return null;
    }
    return resolvePathInObject(path, this.value);
  };

  public set = (path: Path, value: T | null): void => this._set(path, value);
}
