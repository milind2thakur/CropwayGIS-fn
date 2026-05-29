'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { calculateCropPlan, getCrops, getSeasons, getUnits } from '@/lib/api/crop-planning';
import { nextStepHref } from '@/features/shell/config';
import { Button } from '@/components/ui/button';

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
      className={`relative flex h-[33px] min-w-[156px] w-auto items-center gap-[6px] rounded-[10px] pl-[12px] pr-[30px] text-left transition ${
        selected
          ? 'bg-greenDark text-white'
          : 'bg-greenLight text-ink hover:bg-greenLightHover'
      }`}
    >
      <span className="font-montserrat text-[12px] font-medium leading-[130%] whitespace-nowrap">{label}</span>
      <span className="font-montserrat text-[10px] font-bold leading-[130%] opacity-50 whitespace-nowrap">{meta}</span>
      {onRemove ? (
        <span
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="absolute right-[9px] top-1/2 -translate-y-1/2 flex h-[15px] w-[15px] items-center justify-center rounded-[2px] bg-white/20 -rotate-45"
        >
          <span className="relative h-[8px] w-[8px]">
            <span className="absolute left-1/2 top-0 h-full w-[1.2px] -translate-x-1/2 rounded-[2px] bg-white" />
            <span className="absolute left-0 top-1/2 h-[1.2px] w-full -translate-y-1/2 rounded-[2px] bg-white" />
          </span>
        </span>
      ) : (
        <span
          className="absolute right-[9px] top-1/2 -translate-y-1/2 flex h-[15px] w-[15px] items-center justify-center rounded-[2px] bg-black/5"
        >
          <span className="relative h-[8px] w-[8px]">
            <span className="absolute left-1/2 top-0 h-full w-[1.2px] -translate-x-1/2 rounded-[2px] bg-black/40" />
            <span className="absolute left-0 top-1/2 h-[1.2px] w-full -translate-y-1/2 rounded-[2px] bg-black/40" />
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
  const shouldScrollCalculator = state.lines.length > 4;

  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto bg-canvas p-3 sm:p-5 lg:p-6">
      <div className="relative flex min-h-full w-full flex-col overflow-hidden rounded-[16px] border border-black/10 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="flex flex-col h-full min-h-0">
          <div className="shrink-0">
            <h1 className="font-montserrat text-[14px] font-medium text-black">Plan Crop</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="relative h-[28px] w-full shrink-0 sm:w-[272px]">
                <input
                  value={state.search}
                  onChange={(event) => dispatch({ type: 'setSearch', payload: event.target.value })}
                  placeholder="Search Crop"
                  className="h-full w-full rounded-[13px] border border-greenLightActive bg-white pl-[10px] pr-[30px] font-montserrat text-[10px] font-medium text-ink outline-none placeholder:text-ink/50"
                />
                <Search className="pointer-events-none absolute right-[10px] top-1/2 h-3 w-3 -translate-y-1/2 text-ink" />
              </div>
              <div className="flex h-[26px] w-full items-center gap-[2px] rounded-[8px] bg-greenLight p-[2px] sm:w-auto">
                {(seasonsQuery.data?.data ?? [
                  { id: 'kharif', label: 'Kharif' },
                  { id: 'rabi', label: 'Rabi' },
                ]).map((season) => (
                  <button
                    key={season.id}
                    className={`flex h-[22px] flex-1 items-center justify-center rounded-[6px] px-[18px] font-montserrat text-[12px] font-medium transition sm:flex-none sm:px-[30px] ${
                      state.season === season.id ? 'bg-greenDarkActive text-white' : 'text-greenDarkActive'
                    }`}
                    onClick={() => dispatch({ type: 'setSeason', payload: season.id })}
                  >
                    {season.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 shrink-0 rounded-[20px] border border-greenLight bg-white px-4 py-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:px-6 lg:px-8">
            <div className="flex items-center gap-[8px]">
              <div className="font-montserrat text-[12px] font-semibold leading-[130%] text-black/60 whitespace-nowrap">
                Select Crop Type
              </div>
              <div className="h-0 flex-1 border-t border-black/12"></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
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

          <div className="mt-5 flex min-h-0 flex-1 flex-col rounded-[24px] border border-greenLight bg-panel px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="mb-4 shrink-0 font-montserrat text-[12px] font-semibold text-black/70">Complete Cost Calculator</div>
            {state.lines.length ? (
              <div className="w-full flex-1 min-h-0 overflow-hidden flex flex-col">
                <div
                  className={`rounded-[18px] ${shouldScrollCalculator ? 'max-h-[420px] overflow-auto min-h-0' : 'overflow-x-auto overflow-y-visible'}`}
                >
                  <table className="min-w-[1160px] w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th colSpan={3} className="border-b border-transparent bg-panel p-0"></th>
                        <th 
                          colSpan={calculation?.components?.length ?? 1} 
                          className="rounded-t-[20px] border border-yellowNormalActive border-b-0 bg-yellowLightActive py-[6px] text-center font-montserrat text-[10px] font-medium text-ink/70"
                        >
                          Est. cost Breakdown
                        </th>
                        <th className="border-b border-transparent bg-panel p-0"></th>
                      </tr>
                      <tr>
                        <th className="align-bottom border-b border-black/20 bg-panel px-[17px] pb-[26px] pt-[20px] text-left font-montserrat text-[10px] font-medium text-ink/70">Selected Crop</th>
                        <th className="align-bottom border-b border-black/20 bg-panel px-[17px] pb-[26px] pt-[20px] text-left font-montserrat text-[10px] font-medium text-ink/70">Area</th>
                        <th className="align-bottom border-b border-black/20 bg-panel px-[17px] pb-[26px] pt-[20px] text-left font-montserrat text-[10px] font-medium text-ink/70">Unit</th>
                        {(calculation?.components ?? []).map((component, idx, arr) => (
                          <th 
                            key={component.key} 
                            className={`px-2 pb-[26px] pt-[20px] text-center font-montserrat text-[10px] font-medium text-black/70 align-bottom bg-white border-b border-black/20 ${
                              idx === 0 ? 'border-l border-yellowNormalActive' : ''
                            } ${
                              idx === arr.length - 1 ? 'border-r border-yellowNormalActive' : ''
                            }`}
                          >
                            {component.label}
                          </th>
                        ))}
                        <th className="align-bottom border-b border-black/20 bg-panel px-[17px] pb-[26px] pt-[20px] text-left font-montserrat text-[10px] font-medium text-ink/70">Total Cost Inr</th>
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
                              <div className="flex h-[30px] w-[43px] items-center justify-center rounded-[8px] bg-panel">
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
                                  className="w-full bg-transparent text-center font-montserrat text-[12px] font-medium leading-[130%] text-ink outline-none"
                                />
                              </div>
                            </td>
                            <td className="px-[17px] py-[35px] border-b border-black/10">
                              <div className="relative flex h-[30px] w-[86px] items-center rounded-[4px] bg-greenLight">
                                <select
                                  value={line.unit}
                                  onChange={(event) =>
                                    dispatch({
                                      type: 'updateUnit',
                                      payload: { cropId: line.cropId, unit: event.target.value },
                                    })
                                  }
                                  className="w-full h-full appearance-none bg-transparent font-montserrat text-[12px] font-medium leading-[130%] text-black outline-none pl-[20px] pr-[30px] cursor-pointer"
                                >
                                  {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                      {unit.label}
                                    </option>
                                  ))}
                                </select>
                                <svg 
                                  width="8" 
                                  height="5" 
                                  viewBox="0 0 8 5" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="pointer-events-none absolute right-[20px] top-1/2 -translate-y-1/2"
                                >
                                  <path d="M1 1L4 4L7 1" stroke="#222222" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </td>
                            {(calculation?.components ?? []).map((component, idx, arr) => (
                              <td 
                                key={component.key} 
                                className={`px-2 py-[35px] text-center font-montserrat text-[14px] font-medium text-black bg-white ${
                                  idx === 0 ? 'border-l border-yellowNormalActive' : ''
                                } ${
                                  idx === arr.length - 1 ? 'border-r border-yellowNormalActive' : ''
                                } ${
                                  isLastRow ? 'border-b border-yellowNormalActive' : 'border-b border-black/10'
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
                              <div className="inline-flex h-[32px] items-center rounded-[8px] bg-greenLight px-3 font-montserrat text-[12px] font-medium leading-[130%] text-ink">
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
              <div className="rounded-3xl border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-muted">
                Search and select a crop to start planning.
              </div>
            )}

            {calculationError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {calculationError}
              </div>
            ) : null}

            <div className="mt-5 mb-4 h-[1px] w-full shrink-0 bg-black/12 lg:mt-6"></div>

            <div className="flex shrink-0 flex-col items-stretch gap-5 sm:items-end lg:gap-8">
              <div className="flex flex-col items-start gap-[8px]">
                <div className="font-montserrat text-[12px] font-medium text-black">Grand Total</div>
                <div className="flex h-[40px] min-w-[152px] items-center justify-start rounded-[10px] bg-greenLightActive px-[14px] py-[7px]">
                  <span className="font-montserrat text-[18px] font-bold leading-tight text-greenDarkActive">
                    {calculation ? `${(calculation.grandTotal).toLocaleString('en-IN')} /-` : '0 /-'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="medium"
                  className="w-[110px]"
                  onClick={() => {
                    clearPersistedDraft();
                    dispatch({ type: 'clear' });
                    reset();
                    setCalculationError(null);
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  className="w-[147px] disabled:opacity-50"
                  onClick={() => router.push(nextStepHref)}
                  disabled={!state.lines.length || isPending}
                >
                  continue
                </Button>
                <Button
                  variant="ghost"
                  size="medium"
                  className="w-[110px] border border-greenDark/20 bg-white text-greenDark"
                  onClick={() => router.push(nextStepHref)}
                >
                  Skip
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
