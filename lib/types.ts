import type {Lang} from './i18n';
import type {Outcome} from './games/paper-cricket/engine';

export type {Outcome};
export type Mode = 'computer' | 'local' | 'solo';
export type Diff = 'easy' | 'medium' | 'hard';

export interface HouseRules {
  cricketBalls: number;
  cricketWickets: number;
  chorRounds: number;
  dotsSize: number; // 3 -> 3x3 boxes (4x4 dots)
}

export interface Preferences {
  lang: Lang;
  mode: Mode;
  diff: Diff;
  sound: boolean;
  animation: 'normal' | 'fast' | 'off';
  houseRules: HouseRules;
}

export interface Summary {
  id: string;
  game: 'cricket' | 'chor' | 'dots' | string;
  mode: Mode;
  date: string;
  result: string;
  details?: string;
}

export interface GameProps {
  lang: Lang;
  mode: Mode;
  difficulty: Diff;
  soundEnabled?: boolean;
  houseRules?: HouseRules;
  onExit: () => void;
  onDone: (s: Summary) => void;
}
