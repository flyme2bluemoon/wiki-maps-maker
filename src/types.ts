export type MapMode = 'world' | 'continent' | 'country';
export type WorldMode = 'groups' | 'gradient';
export type ScaleType = 'data' | '0-100' | 'custom';

export interface Group {
  id: string;
  name: string;
  colorId: string;
  members: string[];
}

export interface DocState {
  title?: string;
  caption?: string;
  groups?: Group[];
  worldMode?: WorldMode;
  gradientValues?: Record<string, number | string>;
  scaleType?: ScaleType;
  customMin?: string;
  customMax?: string;
  startColorId?: string;
  endColorId?: string;
}
