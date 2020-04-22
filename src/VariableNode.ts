import Node, { INVALID } from "./Node";
import { NodeInitialisation } from "./types";

/*******************************************************************************
  Component
 ******************************************************************************/

export default class VariableNode<T> extends Node<T> {
  constructor(nodeDef: NodeInitialisation<T>) {
    super(nodeDef);
    this.value = nodeDef.value;
  }

  public get = async (path?: Array<string>): Promise<T | null> => {
    if (this.isValidValue(this.value)) {
      return this._getValueUsingPath(this.value, path);
    }
    return null;
  };

  public set = (value: T | null): void => {
    this.value = value;
    this.onChange(value);
  };
}
