import { DraftState } from './types';

export const draftStorageKey = 'cropwaygis.crop-planning.v1';

export const defaultDraftState: DraftState = {
  season: 'rabi',
  search: '',
  lines: [],
};

export function loadDraftState(): DraftState {
  if (typeof window === 'undefined') {
    return defaultDraftState;
  }

  const rawValue = window.localStorage.getItem(draftStorageKey);
  if (!rawValue) {
    return defaultDraftState;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<DraftState>;
    return {
      season: parsed.season === 'kharif' ? 'kharif' : 'rabi',
      search: '',
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
    };
  } catch {
    return defaultDraftState;
  }
}

export function saveDraftState(state: DraftState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    draftStorageKey,
    JSON.stringify({
      season: state.season,
      lines: state.lines,
    })
  );
}

export function clearDraftState() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(draftStorageKey);
}

