'use client';

import { useEffect, useReducer, useState } from 'react';

import { cropPlanReducer } from './reducer';
import { clearDraftState, defaultDraftState, loadDraftState, saveDraftState } from './storage';

export function useCropPlanDraft() {
  const [state, dispatch] = useReducer(cropPlanReducer, defaultDraftState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: 'hydrate', payload: loadDraftState() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveDraftState(state);
  }, [hydrated, state]);

  return {
    state,
    dispatch,
    clearPersistedDraft: clearDraftState,
    hydrated,
  };
}
