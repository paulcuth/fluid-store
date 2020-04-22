import StoreNode from "./StoreNode";
import ComputedNode from "./ComputedNode";
import VariableNode from "./VariableNode";
import Node from "./Node";
import { NodeInitialisation } from "./types";

export default (nodeDef: NodeInitialisation<any>): Node<any> => {
  switch (true) {
    case StoreNode.isStoreNode(nodeDef):
      return new StoreNode(nodeDef);
    case ComputedNode.isComputedNode(nodeDef):
      return new ComputedNode(nodeDef);
    default:
      return new VariableNode(nodeDef);
  }
};
