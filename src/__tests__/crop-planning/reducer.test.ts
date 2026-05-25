import { cropPlanReducer } from '@/features/crop-planning/reducer';
import { defaultDraftState } from '@/features/crop-planning/storage';

describe('crop plan reducer', () => {
  it('adds a crop only once', () => {
    const crop = {
      id: 'rice',
      name: 'Rice',
      durationLabel: '90-150 days',
      seasons: ['rabi'],
      active: true,
    };

    const nextState = cropPlanReducer(defaultDraftState, {
      type: 'addCrop',
      payload: { crop, defaultUnit: 'acre' },
    });
    const duplicateState = cropPlanReducer(nextState, {
      type: 'addCrop',
      payload: { crop, defaultUnit: 'acre' },
    });

    expect(duplicateState.lines).toHaveLength(1);
  });

  it('clears back to the baseline state', () => {
    const populatedState = {
      season: 'kharif' as const,
      search: 'ri',
      lines: [{ cropId: 'rice', cropName: 'Rice', durationLabel: '90-150 days', areaValue: 2, unit: 'acre' }],
    };

    expect(cropPlanReducer(populatedState, { type: 'clear' })).toEqual(defaultDraftState);
  });
});

