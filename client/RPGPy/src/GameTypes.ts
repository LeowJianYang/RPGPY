


export type TileType = 'S' | 'E' | 'C' | 'Q' | 'B' | 'X' | 'M' | 'R';

export type LootTypes ="Restock" | "Weapon" | "Amour" | "Loot";

export interface Enemy {
  name: string;
  hp: number;
  attack: number;
}


export interface MapJSON {
  mapId: string;
  name: string;
  legend: Record<string, string>;
  tiles: Record<string, { type: TileType; description?: string; quizPool?: string; enemyId?: string; lootTable?: string; branchExpected?: string; branchQuit?: number; }>;
  quizPools: Record<string, { q: string; a: string[]; correct?: number; expectedResult?: string;}[]>;
  lootTables: Record<string, string[]>;
  lootEffects: Record<string, {type:LootTypes,description: string, HP?:number, ATK?:number}>;
  Player:{ATK:number, HP:number};
  enemies: Record<string, Enemy>;
}

