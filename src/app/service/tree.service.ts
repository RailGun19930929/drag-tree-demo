import { FlatTree } from './../interface/tree';
import { RawTreeData } from './../interface/raw-tree-data';
import { Guid } from "guid-typescript";
import { BehaviorSubject } from 'rxjs';
import { Tree } from '../interface/tree';

export class TreeService {

  private dataChangeSubject$ = new BehaviorSubject<Tree[]>([]);
  dataChange$ = this.dataChangeSubject$.asObservable();

  get data(): Tree[] {
    return this.dataChangeSubject$.value;
  }

  constructor(treeDataList: RawTreeData[]) {
    this.initialize(treeDataList);
  }

  initialize(treeDataList: RawTreeData[]) {
    // Build the tree nodes from Json object. The result is a list of `Tree` with nested
    //     file node as children.
    const data = this.buildFileTree(treeDataList, 0, null);
    console.log('initialize tree', data);
    // Notify the change.
    this.dataChangeSubject$.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `Tree`.
   */
  buildFileTree(treeDataList: RawTreeData[], level: number, parentGuid: string | null): Tree[] {

    const treeList: Tree[] = [];
    treeDataList.filter(x => x.ParentGuid === parentGuid)
      .forEach(x => {
        const childrenTreeList: Tree[] = this.buildFileTree(treeDataList, level + 1, x.NodeGuid);
        const tree: Tree = {
          name: x.NodeName,
          type: x.ServiceType,
          guid: x.NodeGuid,
          children: childrenTreeList.length === 0 ? null : childrenTreeList
        };
        treeList.push(tree);
      });

    return treeList;

  }

  /** Add an item to to-do list */
  insertItem(parent: Tree, name: string, type: number): Tree {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem = {
      name,
      type,
      guid: Guid.create().toString()
    } as Tree;
    parent.children.push(newItem);
    this.dataChangeSubject$.next(this.data);
    return newItem;
  }

  insertItemAbove(node: Tree, name: string, type: number): Tree {
    const parentNode = this.getParentFromNodes(node);
    const newItem = {
      name,
      type,
      guid: Guid.create().toString()
    } as Tree;
    if (parentNode) {
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChangeSubject$.next(this.data);
    return newItem;
  }

  insertItemBelow(node: Tree, name: string, type: number): Tree {
    const parentNode = this.getParentFromNodes(node);
    const newItem = {
      name,
      type,
      guid: Guid.create().toString()
    } as Tree;
    if (parentNode != null) {
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.splice(
        parentNode.children.indexOf(node) + 1,
        0,
        newItem
      );
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChangeSubject$.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: Tree): Tree | null {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: Tree, node: Tree): Tree | null {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  updateItem(node: Tree, name: string) {
    node.name = name;
    this.dataChangeSubject$.next(this.data);
  }

  deleteItem(node: Tree) {
    this.deleteNode(this.data, node);
    this.dataChangeSubject$.next(this.data);
  }

  copyPasteItem(from: Tree, to: Tree): Tree {
    const newItem = this.insertItem(to, from.name, from.type);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: Tree, to: Tree): Tree {
    const newItem = this.insertItemAbove(to, from.name, from.type);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: Tree, to: Tree): Tree {
    const newItem = this.insertItemBelow(to, from.name, from.type);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  deleteNode(nodes: Tree[], nodeToDelete: Tree) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }

  updateNode(node: FlatTree): void {
    // find node
    const currentNode = this.findNodeByGuid(this.data, node.guid);
    console.log('currentNode', currentNode, this.data);
    if (currentNode) {
      currentNode.name = node.name;
      currentNode.type = node.type;
      this.dataChangeSubject$.next(this.data);
    }
  }

  findNodeByGuid(tree: Tree[], guid: string): Tree | null {
    let node = null;
    for (let item of tree) {
      if (item.guid === guid) {
        node = item;
      } else if (item.children) {
        node = this.findNodeByGuid(item.children, guid);
      }
      if (node && node.guid === guid) {
        break;
      }
    }
    return node;
  }
}
