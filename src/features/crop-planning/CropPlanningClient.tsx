'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { calculateCropPlan, getCrops, getSeasons, getUnits } from '@/lib/api/crop-planning';
import { nextStepHref } from '@/features/shell/config';

import { useCropPlanDraft } from './useCropPlanDraft';

function CropChip({
  label,
  meta,
  selected = false,
  onClick,
  onRemove,
}: {
  label: string;
  meta: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-[10px] px-[13px] py-[9px] text-left transition ${
        selected
          ? 'bg-[#356020] text-white'
          : 'bg-[#EDF2EA] text-[#1E1E1E] hover:bg-[#e0e8dc]'
      }`}
    >
      <span className="font-montserrat text-[12px] font-medium leading-tight">{label}</span>
      <span className={`font-montserrat text-[10px] font-bold leading-tight ${selected ? 'text-white opacity-50' : 'text-[#1E1E1E] opacity-50'}`}>{meta}</span>
      {onRemove ? (
        <span
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className={`flex h-[15px] w-[15px] items-center justify-center rounded-full bg-white/20 ml-[3px]`}
        >
          <X className="h-2 w-2 text-white" strokeWidth={3} />
        </span>
      ) : (
        <span
          className={`flex h-[15px] w-[15px] items-center justify-center rounded-full bg-white/20 ml-[3px]`}
        >
          <span className="relative h-2 w-2">
            <span className="absolute left-1/2 top-0 h-full w-[1.2px] -translate-x-1/2 rounded-full bg-white" />
            <span className="absolute left-0 top-1/2 h-[1.2px] w-full -translate-y-1/2 rounded-full bg-white" />
          </span>
        </span>
      )}
    </button>
  );
}

export function CropPlanningClient() {
  const router = useRouter();
  const { state, dispatch, clearPersistedDraft, hydrated } = useCropPlanDraft();
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(state.search);

  const seasonsQuery = useQuery({
    queryKey: ['seasons'],
    queryFn: getSeasons,
  });
  const unitsQuery = useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
  });
  const cropsQuery = useQuery({
    queryKey: ['crops', state.season, deferredSearch],
    queryFn: () => getCrops(state.season, deferredSearch),
  });

  const calculationMutation = useMutation({
    mutationFn: calculateCropPlan,
    onSuccess: () => setCalculationError(null),
    onError: (error) => setCalculationError(error instanceof Error ? error.message : 'Calculation failed.'),
  });
  const { data: calculationEnvelope, mutateAsync, reset, isPending } = calculationMutation;

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const allowedCropIds = new Set((cropsQuery.data?.data ?? []).map((crop) => crop.id));
    const hasInvalidLine = state.lines.some((line) => !allowedCropIds.has(line.cropId));
    if (hasInvalidLine) {
      dispatch({ type: 'syncAllowedCropIds', payload: Array.from(allowedCropIds) });
    }
  }, [cropsQuery.data?.data, dispatch, hydrated, state.lines]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!state.lines.length) {
      reset();
      return;
    }

    void mutateAsync({
      season: state.season,
      selected_crops: state.lines.map((line) => ({
        crop_id: line.cropId,
        area_value: Number(line.areaValue),
        unit: line.unit,
      })),
    });
  }, [hydrated, mutateAsync, reset, state.lines, state.season]);

  const units = unitsQuery.data?.data ?? [];
  const availableCrops = cropsQuery.data?.data ?? [];
  const selectedCropIds = new Set(state.lines.map((line) => line.cropId));
  const calculation = calculationEnvelope?.data;

  return (
    <div className="w-full h-full bg-white relative p-[17px]">
      <div className="flex flex-col">
        <div>
          <h1 className="font-montserrat text-[14px] font-medium text-black">Plan Crop</h1>
          <div className="mt-[16px] flex items-center gap-[19px]">
              <div className="relative w-[272px] h-[28px] shrink-0">
                <input
                  value={state.search}
                  onChange={(event) => dispatch({ type: 'setSearch', payload: event.target.value })}
                  placeholder="Search Crop"
                  className="h-full w-full rounded-[13px] border border-[#DADADA] bg-white pl-[10px] pr-[30px] font-montserrat text-[10px] font-medium text-[#222222] outline-none placeholder:text-[#222222] placeholder:opacity-50"
                />
                <Search className="pointer-events-none absolute right-[10px] top-1/2 h-3 w-3 -translate-y-1/2 text-[#222222]" />
              </div>
              <div className="flex h-[26px] items-center gap-[2px] rounded-[8px] bg-[#EDF2EA] p-[2px]">
                {(seasonsQuery.data?.data ?? [
                  { id: 'kharif', label: 'Kharif' },
                  { id: 'rabi', label: 'Rabi' },
                ]).map((season) => (
                  <button
                    key={season.id}
                    className={`flex h-[22px] items-center justify-center rounded-[6px] px-[30px] font-montserrat text-[12px] font-medium transition ${
                      state.season === season.id ? 'bg-[#203A13] text-white' : 'text-[#203A13]'
                    }`}
                    onClick={() => dispatch({ type: 'setSeason', payload: season.id })}
                  >
                    {season.label}
                  </button>
                ))}
              </div>
            </div>
        </div>

        <div className="mt-[30px] flex flex-col">
          <div className="flex items-center gap-[8px]">
            <div className="font-montserrat text-[12px] font-medium text-black opacity-60">Select Crop type</div>
            <div className="h-[1px] flex-1 bg-black/20"></div>
          </div>
          <div className="mt-[16px] flex flex-wrap gap-[19px]">
              {state.lines.map((line) => (
                <CropChip
                  key={line.cropId}
                  label={line.cropName}
                  meta={line.durationLabel}
                  selected
                  onRemove={() => dispatch({ type: 'removeCrop', payload: { cropId: line.cropId } })}
                />
              ))}
              {availableCrops
                .filter((crop) => !selectedCropIds.has(crop.id))
                .map((crop) => (
                  <CropChip
                    key={crop.id}
                    label={crop.name}
                    meta={crop.durationLabel}
                    onClick={() =>
                      dispatch({
                        type: 'addCrop',
                        payload: { crop, defaultUnit: units[0]?.id ?? 'acre' },
                      })
                    }
                  />
                ))}
            </div>
          </div>

        <div className="mt-[40px] flex flex-col">
          <div className="h-[1px] w-full bg-black/20 mb-[36px]"></div>
          <div className="mb-[26px] font-montserrat text-[12px] font-medium text-black">Compleate cost Calculator</div>
            {state.lines.length ? (
              <div className="w-full">
                <div className="overflow-x-auto">
                  <table className="min-w-[1160px] w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th colSpan={3} className="p-0 border-b border-transparent"></th>
                        <th 
                          colSpan={calculation?.components?.length ?? 1} 
                          className="bg-[#FBF4D7] border border-[#C2B165] border-b-0 rounded-t-[20px] py-[6px] font-montserrat text-[10px] font-medium text-black/70 text-center"
                        >
                          Est. cost Breakdown
                        </th>
                        <th className="p-0 border-b border-transparent"></th>
                      </tr>
                      <tr>
                        <th className="px-[17px] pb-[26px] pt-[20px] text-left font-montserrat text-[10px] font-medium text-black/70 align-bottom border-b border-black/20">Selected Crop</th>
                        <th className="px-[17px] pb-[26px] pt-[20px] text-left font-montserrat text-[10px] font-medium text-black/70 align-bottom border-b border-black/20">Area</th>
                        <th className="px-[17px] pb-[26px] pt-[20px] text-left font-montserrat text-[10px] font-medium text-black/70 align-bottom border-b border-black/20">Unit</th>
                        {(calculation?.components ?? []).map((component, idx, arr) => (
                          <th 
                            key={component.key} 
                            className={`px-2 pb-[26px] pt-[20px] text-center font-montserrat text-[10px] font-medium text-black/70 align-bottom bg-white border-b border-black/20 ${
                              idx === 0 ? 'border-l border-[#C2B165]' : ''
                            } ${
                              idx === arr.length - 1 ? 'border-r border-[#C2B165]' : ''
                            }`}
                          >
                            {component.label}
                          </th>
                        ))}
                        <th className="px-[17px] pb-[26px] pt-[20px] text-left font-montserrat text-[10px] font-medium text-black/70 align-bottom border-b border-black/20">Total Cost Inr</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.lines.map((line, rowIndex) => {
                        const row = calculation?.rows.find((item) => item.cropId === line.cropId);
                        const isLastRow = rowIndex === state.lines.length - 1;
                        return (
                          <tr key={line.cropId} className="align-top">
                            <td className="px-[17px] py-[35px] border-b border-black/10">
                              <div className="font-montserrat text-[14px] font-medium text-black">{line.cropName}</div>
                            </td>
                            <td className="px-[17px] py-[35px] border-b border-black/10">
                              <div className="flex h-[30px] w-[43px] items-center justify-center rounded-[8px] bg-[#F4F7FA]">
                                <input
                                  min={0.1}
                                  step={0.1}
                                  type="number"
                                  value={line.areaValue}
                                  onChange={(event) =>
                                    dispatch({
                                      type: 'updateArea',
                                      payload: {
                                        cropId: line.cropId,
                                        areaValue: Number(event.target.value),
                                      },
                                    })
                                  }
                                  className="w-full bg-transparent text-center font-poppins text-[12px] text-[#1E1E1E] outline-none"
                                />
                              </div>
                            </td>
                            <td className="px-[17px] py-[35px] border-b border-black/10">
                              <div className="flex h-[30px] w-[86px] items-center rounded-[4px] bg-[#EDF2EA] px-[10px]">
                                <select
                                  value={line.unit}
                                  onChange={(event) =>
                                    dispatch({
                                      type: 'updateUnit',
                                      payload: { cropId: line.cropId, unit: event.target.value },
                                    })
                                  }
                                  className="w-full appearance-none bg-transparent font-montserrat text-[12px] font-medium text-black outline-none"
                                >
                                  {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                      {unit.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            {(calculation?.components ?? []).map((component, idx, arr) => (
                              <td 
                                key={component.key} 
                                className={`px-2 py-[35px] text-center font-montserrat text-[14px] font-medium text-black bg-white ${
                                  idx === 0 ? 'border-l border-[#C2B165]' : ''
                                } ${
                                  idx === arr.length - 1 ? 'border-r border-[#C2B165]' : ''
                                } ${
                                  isLastRow ? 'border-b border-[#C2B165]' : 'border-b border-black/10'
                                } ${
                                  isLastRow && idx === 0 ? 'rounded-bl-[20px]' : ''
                                } ${
                                  isLastRow && idx === arr.length - 1 ? 'rounded-br-[20px]' : ''
                                }`}
                              >
                                {row ? (row.breakdown[component.key] ?? 0).toLocaleString('en-IN') : '-'}
                              </td>
                            ))}
                            <td className="px-[17px] py-[35px] border-b border-black/10">
                              <div className="inline-flex h-[32px] items-center rounded-[8px] bg-[#EDF2EA] px-3 font-poppins text-[12px] text-[#1E1E1E]">
                                {row ? `${(row.rowTotal).toLocaleString('en-IN')} /-` : '-'}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-line bg-[#fafcf8] px-6 py-12 text-center text-sm text-muted">
                Search and select a crop to start planning.
              </div>
            )}

            {calculationError ? (
              <div className="mt-4 rounded-2xl border border-[#efc7c7] bg-[#fff4f4] px-4 py-3 text-sm text-[#8b3434]">
                {calculationError}
              </div>
            ) : null}

            <div className="mt-[40px] h-[1px] w-full bg-black/20 mb-[5px]"></div>

            <div className="flex flex-col items-end gap-[80px]">
              <div className="flex flex-col items-start gap-[8px]">
                <div className="font-montserrat text-[12px] font-medium text-black">Grand totel</div>
                <div className="flex h-[37px] min-w-[140px] items-center justify-start rounded-[8px] bg-[#C6D8BD] px-[12px] py-[7px]">
                  <span className="font-montserrat text-[18px] font-bold leading-tight text-[#203A13]">
                    {calculation ? `${(calculation.grandTotal).toLocaleString('en-IN')} /-` : '0 /-'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="flex h-[26px] w-[110px] items-center justify-center rounded-[6px] bg-[#E3ECDF] transition hover:bg-[#dbe4d7]"
                  onClick={() => {
                    clearPersistedDraft();
                    dispatch({ type: 'clear' });
                    reset();
                    setCalculationError(null);
                  }}
                >
                  <span className="font-montserrat text-[12px] font-medium text-[#203A13]">Clear</span>
                </button>
                <button
                  className="flex h-[26px] w-[147px] items-center justify-center rounded-[6px] bg-[#356020] transition hover:bg-[#2e521b] disabled:opacity-50"
                  onClick={() => router.push(nextStepHref)}
                  disabled={!state.lines.length || isPending}
                >
                  <span className="font-montserrat text-[12px] font-medium text-white">continue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
