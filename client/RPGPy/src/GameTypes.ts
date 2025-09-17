


export type TileType = 'S' | 'E' | 'C' | 'Q' | 'B' | 'X' | 'M' | 'R';
export type SkillType = 'Attack' | 'Defense' | 'Heal';

export type BaseLoot =  | { type: "Restock"; description: string; HP: number }
  | { type: "Weapon"; description: string; ATK: number }
  | { type: "Amour"; description: string; HP: number }
  | { type: "Loot"; description: string };

export interface SkillsType {
  type: SkillType;
  description: string;
  damage?:number;
  heal?:number;
  HP?:number;
  duration?:number;
  Cooldown:number;
}

export interface Enemy {
  name: string;
  hp: number;
  attack: number;
  styleImg?:string;
}

export type LootTypes = BaseLoot | SkillsType;

export interface MapJSON {
  mapId: string;
  name: string;
  legend: Record<string, string>;
  tiles: Record<string, { type: TileType; description?: string; quizPool?: string; enemyId?: string; lootTable?: string; branchExpected?: string; branchQuit?: number;isBranch?:boolean }>;
  quizPools: Record<string, { q: string; a: string[]; correct?: number; expectedResult?: string;}[]>;
  lootTables: Record<string, string[]>;
  lootEffects: Record<string, LootTypes>;
  Player:{ATK:number, HP:number};
  enemies: Record<string, Enemy>;
  SkillsSet: Record<string, {type: string, description: string, damage?:number, heal?:number, HP?:number, duration?:number, Cooldown:number}>;
  RolesSet: Record<string, {description:string, ATK:number, HP:number, Skills:string[]}>;
}

