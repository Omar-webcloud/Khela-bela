import type {HouseRules, Preferences, Diff, Mode} from '../types';
import type {Lang} from '../i18n';

const PREF_PREFIX = 'kb:';

export const DEFAULT_HOUSE_RULES: HouseRules = {
  cricketBalls: 12,
  cricketWickets: 2,
  chorRounds: 5,
  dotsSize: 3,
};

export const DEFAULT_PREFERENCES: Preferences = {
  lang: 'en',
  mode: 'computer',
  diff: 'medium',
  sound: true,
  animation: 'normal',
  houseRules: DEFAULT_HOUSE_RULES,
};

export function getPref<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(PREF_PREFIX + key);
    return val !== null ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setPref(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREF_PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private browsing
  }
}

export function getHouseRules(): HouseRules {
  return getPref<HouseRules>('houseRules', DEFAULT_HOUSE_RULES);
}

export function setHouseRules(rules: Partial<HouseRules>): HouseRules {
  const current = getHouseRules();
  const updated = {...current, ...rules};
  setPref('houseRules', updated);
  return updated;
}
