import { RawTreeData } from './../interface/raw-tree-data';
import { TreeService } from './../service/tree.service';
import { FlatTree, Tree } from './../interface/tree';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: './tree-demo.component.html',
  styleUrls: ['./tree-demo.component.scss']
})
export class TreeDemoComponent implements OnInit {

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<FlatTree, Tree>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<Tree, FlatTree>();

  /** A selected parent node to be inserted */
  selectedParent: FlatTree | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl!: FlatTreeControl<FlatTree>;

  treeFlattener!: MatTreeFlattener<Tree, FlatTree>;

  dataSource!: MatTreeFlatDataSource<Tree, FlatTree>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<FlatTree>(
    true /* multiple */
  );

  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number = 0;
  dragNodeExpandOverArea: number = 0;
  treeService = new TreeService([]);

  constructor(
    private http: HttpClient,
  ) {
  }

  ngOnInit(): void {

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<FlatTree>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    this.treeService.dataChange$.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data || [];
    });
    // 取得assets的測試用json
    this.http.get<RawTreeData[]>('/assets/json/data.json')
      .subscribe({
        next: (res) => {
          console.log('data', res);
          this.treeService.initialize(res);
        },
        error: (err) => {
          console.error(err);
        }
      })

  }

  getLevel = (node: FlatTree) => node.level;

  isExpandable = (node: FlatTree) => node.expandable;

  getChildren = (node: Tree): Tree[] | null => node.children;

  hasChild = (_: number, _nodeData: FlatTree) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: FlatTree) =>
    _nodeData.name === '';

  // /**
  //  * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
  //  */
  transformer = (node: Tree, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.name === node.name
        ? existingNode
        : {} as FlatTree;
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.expandable = node.children && node.children.length > 0 || false;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  // /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: FlatTree): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
  }

  // /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: FlatTree): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  // /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: FlatTree): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  // /** Select the category so we can insert the new item. */
  addNewItem(node: FlatTree, type: number = 1) {
    const parentNode = this.flatNodeMap.get(node);
    this.treeService.insertItem(parentNode!, 'NEW NODE', type);
    this.treeControl.expand(node);
  }

  // /** Save the node to database */
  saveNode(node: FlatTree, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.treeService.updateItem(nestedNode!, itemValue);
  }

  handleDragStart(event: any, node: any) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    event.dataTransfer.setData('foo', 'bar');
    //event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event: any, node: any) {
    event.preventDefault();
    // Handle node expand
    if (this.dragNodeExpandOverNode && node === this.dragNodeExpandOverNode) {
      if (
        Date.now() - this.dragNodeExpandOverTime >
        this.dragNodeExpandOverWaitTimeMs
      ) {
        if (!this.treeControl.isExpanded(node)) {
          this.treeControl.expand(node);
          //this.cd.detectChanges();
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    const percentageY = event.offsetY / event.target.clientHeight;
    if (0 <= percentageY && percentageY <= 0.25) {
      this.dragNodeExpandOverArea = 1;
    } else if (1 >= percentageY && percentageY >= 0.75) {
      this.dragNodeExpandOverArea = -1;
    } else {
      this.dragNodeExpandOverArea = 0;
    }
  }

  handleDrop(event: any, node: any) {
    if (node !== this.dragNode) {
      let newItem: Tree;
      if (this.dragNodeExpandOverArea === 1) {
        newItem = this.treeService.copyPasteItemAbove(
          this.flatNodeMap.get(this.dragNode)!,
          this.flatNodeMap.get(node)!
        );
      } else if (this.dragNodeExpandOverArea === -1) {
        newItem = this.treeService.copyPasteItemBelow(
          this.flatNodeMap.get(this.dragNode)!,
          this.flatNodeMap.get(node)!
        );
      } else {
        newItem = this.treeService.copyPasteItem(
          this.flatNodeMap.get(this.dragNode)!,
          this.flatNodeMap.get(node)!
        );
      }
      this.treeService.deleteItem(this.flatNodeMap.get(this.dragNode)!);
      this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem)!);
    }
    this.handleDragEnd(event, node);
  }

  handleDragEnd(event: any, node: any) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.dragNodeExpandOverArea = NaN;
    event.preventDefault();
  }

  getStyle(node: FlatTree): string {
    if (this.dragNode === node) {
      return 'drag-start';
    } else if (this.dragNodeExpandOverNode === node) {
      switch (this.dragNodeExpandOverArea) {
        case 1:
          return 'drop-above';
        case -1:
          return 'drop-below';
        default:
          return 'drop-center';
      }
    }
    return '';
  }

  deleteItem(node: FlatTree) {
    this.treeService.deleteItem(this.flatNodeMap.get(node)!);
  }

}
