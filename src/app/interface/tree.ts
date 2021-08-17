export interface Tree {
  children: Tree[] | null;
  name: string;
  type: number;
  guid: string;
}

export interface FlatTree {
  expandable: boolean;
  name: string;
  level: number;
  type: number;
  guid: string;
}

