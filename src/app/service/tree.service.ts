import { TreeData } from './../interface/tree-data';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Tree } from '../interface/tree';

export class TreeService {

  private dataChangeSubject$ = new BehaviorSubject<Tree[]>([]);
  dataChange$ = this.dataChangeSubject$.asObservable();

  get data(): Tree[] {
    return this.dataChangeSubject$.value;
  }

  constructor(treeData: any) {
    this.initialize(treeData);
  }

  initialize(treeData: TreeData) {
    // Build the tree nodes from Json object. The result is a list of `Tree` with nested
    //     file node as children.
    const data = this.buildFileTree(treeData, 0);

    // Notify the change.
    this.dataChangeSubject$.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `Tree`.
   */
  buildFileTree(treeData: TreeData, level: number): Tree[] {
    Object.keys(treeData).forEach((key) => {
      const value = treeData[key];
    })
    return Object.keys(treeData).reduce<Tree[]>((accumulator, key) => {
      const value = treeData[key];
      const node: Tree = {} as Tree;
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: Tree, name: string): Tree {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem = { item: name } as Tree;
    parent.children.push(newItem);
    this.dataChangeSubject$.next(this.data);
    return newItem;
  }

  insertItemAbove(node: Tree, name: string): Tree {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { item: name } as Tree;
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

  insertItemBelow(node: Tree, name: string): Tree {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { item: name } as Tree;
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
    node.item = name;
    this.dataChangeSubject$.next(this.data);
  }

  deleteItem(node: Tree) {
    this.deleteNode(this.data, node);
    this.dataChangeSubject$.next(this.data);
  }

  copyPasteItem(from: Tree, to: Tree): Tree {
    const newItem = this.insertItem(to, from.item);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: Tree, to: Tree): Tree {
    const newItem = this.insertItemAbove(to, from.item);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: Tree, to: Tree): Tree {
    const newItem = this.insertItemBelow(to, from.item);
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
}
