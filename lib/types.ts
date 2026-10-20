import type {Lang} from './i18n';
export type Mode='computer'|'local';
export type Diff='easy'|'medium'|'hard';
export interface Summary{id:string;game:string;mode:Mode;date:string;result:string}
export interface GameProps{lang:Lang;mode:Mode;difficulty:Diff;onExit:()=>void;onDone:(s:Summary)=>void}
