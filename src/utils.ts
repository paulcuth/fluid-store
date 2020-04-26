import Node from "./Node";
import StoreNode from "./StoreNode";
import ComputedNode from "./ComputedNode";
import VariableNode from "./VariableNode";
import { Path, NodePathTuple, NodeDefinition, NodeAPI } from "./types";

export const createNode = (
  nodeDef: NodeDefinition<any>,
  api: NodeAPI
): Node<any> => {
  if (StoreNode.isStoreNode(nodeDef)) {
    return new StoreNode(nodeDef, api);
  }
  if (ComputedNode.isComputedNode(nodeDef)) {
    return new ComputedNode(nodeDef, api);
  }
  return new VariableNode(nodeDef, api);
};

const pathToArray = (path: Path): Array<string> => {
  return Array.isArray(path) ? path : path.split(".");
};

export const resolvePathInObject = (
  path: string | Array<string> | null,
  object: any | null
): any => {
  if (path == null || object == null) {
    return object;
  }

  const pathArr = pathToArray(path);
  if (path.length === 0) {
    return object;
  }

  const [key, ...subPath] = pathArr;
  return resolvePathInObject(subPath, object[key]);
};

export const resolveNodePath = (
  nodes: { [key: string]: Node<any> },
  path: Path
): NodePathTuple<any> => {
  const pathArr = pathToArray(path);
  const properties: Array<string> = [];
  let node;

  do {
    const key = pathArr.join(".");
    node = nodes[key];

    if (node == null) {
      const next = pathArr.pop();
      if (next != null) {
        properties.unshift(next);
      }
    }
  } while (node == null && pathArr.length > 0);

  if (node == null) {
    throw new ReferenceError(`Property path '${path}' not found`);
  }

  if (node instanceof StoreNode && properties.length > 0) {
    return node.store.resolveNodePath(properties);
  }

  return [node, properties];
};
