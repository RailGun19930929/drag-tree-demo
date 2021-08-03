export interface Tree {
  children: Tree[] | null;
  item: string;
  type: 'category' | 'data';
}

export interface FlatTree {
  expandable: boolean;
  item: string;
  level: number;
  type: 'category' | 'data';
}

