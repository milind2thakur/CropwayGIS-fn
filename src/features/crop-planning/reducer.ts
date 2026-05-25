import { CropOption, DraftState } from './types';

export type DraftAction =
  | { type: 'hydrate'; payload: DraftState }
  | { type: 'setSeason'; payload: DraftState['season'] }
  | { type: 'setSearch'; payload: string }
  | { type: 'syncAllowedCropIds'; payload: string[] }
  | { type: 'addCrop'; payload: { crop: CropOption; defaultUnit: string } }
  | { type: 'removeCrop'; payload: { cropId: string } }
  | { type: 'updateArea'; payload: { cropId: string; areaValue: number } }
  | { type: 'updateUnit'; payload: { cropId: string; unit: string } }
  | { type: 'clear' };

export function cropPlanReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'hydrate':
      return action.payload;
    case 'setSeason':
      return {
        ...state,
        season: action.payload,
        lines: state.lines.filter((line) => line.areaValue > 0),
      };
    case 'setSearch':
      return { ...state, search: action.payload };
    case 'syncAllowedCropIds':
      return {
        ...state,
        lines: state.lines.filter((line) => action.payload.includes(line.cropId)),
      };
    case 'addCrop':
      if (state.lines.some((line) => line.cropId === action.payload.crop.id)) {
        return state;
      }
      return {
        ...state,
        lines: [
          ...state.lines,
          {
            cropId: action.payload.crop.id,
            cropName: action.payload.crop.name,
            durationLabel: action.payload.crop.durationLabel,
            areaValue: 1,
            unit: action.payload.defaultUnit,
          },
        ],
      };
    case 'removeCrop':
      return { ...state, lines: state.lines.filter((line) => line.cropId !== action.payload.cropId) };
    case 'updateArea':
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.cropId === action.payload.cropId ? { ...line, areaValue: action.payload.areaValue } : line
        ),
      };
    case 'updateUnit':
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.cropId === action.payload.cropId ? { ...line, unit: action.payload.unit } : line
        ),
      };
    case 'clear':
      return {
        season: 'rabi',
        search: '',
        lines: [],
      };
    default:
      return state;
  }
}
