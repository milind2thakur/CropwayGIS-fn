import { clearDraftState, defaultDraftState, loadDraftState, saveDraftState } from '@/features/crop-planning/storage';

describe('crop planning storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns default state when nothing is stored', () => {
    expect(loadDraftState()).toEqual(defaultDraftState);
  });

  it('saves and loads the persisted draft', () => {
    saveDraftState({
      season: 'kharif',
      search: 'ignored',
      lines: [{ cropId: 'rice', cropName: 'Rice', durationLabel: '90-150 days', areaValue: 4, unit: 'acre' }],
    });

    expect(loadDraftState()).toEqual({
      season: 'kharif',
      search: '',
      lines: [{ cropId: 'rice', cropName: 'Rice', durationLabel: '90-150 days', areaValue: 4, unit: 'acre' }],
    });
  });

  it('clears persisted draft state', () => {
    saveDraftState(defaultDraftState);
    clearDraftState();
    expect(loadDraftState()).toEqual(defaultDraftState);
  });
});

