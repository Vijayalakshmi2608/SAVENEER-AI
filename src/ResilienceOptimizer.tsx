import { useMemo, useState } from 'react';

type Farm = {
  id: string;
  farmer: string;
  acres: number;
  soil: string;
  crop: string;
  irrigation: string;
};

type Props = {
  farms: Farm[];
  supplyM3: number;
  rainfallMm: number;
  shockPercent: number;
};

const cropFactors: Record<string, number> = {
  Paddy: 1200,
  Groundnut: 450,
  Maize: 500,
  Millet: 300,
  'Black gram': 280,
  Vegetables: 650,
};

const soilFactors: Record<string, number> = {
  Sandy: 1.16,
  Clay: 0.91,
  Unknown: 1.08,
};

const irrigationFactors: Record<string, number> = {
  Drip: 0.72,
  Sprinkler: 0.84,
  Rainfed: 0.62,
};

function estimateDemand(farm: Farm, crop: string, rainfallMm: number) {
  const soilFactor = soilFactors[farm.soil] ?? 1;
  const irrigationFactor = irrigationFactors[farm.irrigation] ?? 1;
  const rainfallFactor = Math.max(0.68, 1 - Math.min(Math.max(rainfallMm, 0), 500) / 1500);
  return Math.max(0, farm.acres) * (cropFactors[crop] ?? cropFactors.Paddy) *
    soilFactor * irrigationFactor * rainfallFactor;
}

function fmt(value: number) {
  return Math.round(value).toLocaleString('en-IN');
}

export default function ResilienceOptimizer({ farms, supplyM3, rainfallMm, shockPercent }: Props) {
  const [selected, setSelected] = useState(0);
  const supply = Math.max(0, supplyM3 * (1 - shockPercent / 100));
  const baselineRows = farms.map((farm) => ({
    farm,
    demand: estimateDemand(farm, farm.crop, rainfallMm),
  }));
  const baselineDemand = baselineRows.reduce((sum, row) => sum + row.demand, 0);

  const candidates = useMemo(() => {
    const rows: Array<{
      crop: string;
      shift: number;
      demand: number;
      gap: number;
      worstFarmDeficit: number;
      score: number;
      reduction: number;
      farms: Array<{ farm: Farm; demand: number; share: number; deficit: number; vulnerability: number }>;
    }> = [];

    for (const crop of ['Millet', 'Black gram', 'Groundnut']) {
      for (const shift of [20, 40, 60, 80]) {
        const farmRows = farms.map((farm) => {
          const current = estimateDemand(farm, farm.crop, rainfallMm);
          const alternative = estimateDemand(farm, crop, rainfallMm);
          const demand = current * (1 - shift / 100) + alternative * (shift / 100);
          const share = farms.reduce((sum, item) => sum + Math.max(0, item.acres), 0) > 0
            ? supply * Math.max(0, farm.acres) / farms.reduce((sum, item) => sum + Math.max(0, item.acres), 0)
            : 0;
          const deficit = Math.max(0, demand - share);
          const vulnerability = Math.min(100, Math.round(
            65 * (demand > 0 ? deficit / demand : 0) +
            25 * (baselineDemand > 0 ? demand / baselineDemand : 0) +
            10 * (farm.soil === 'Unknown' ? 1 : 0)
          ));
          return { farm, demand, share, deficit, vulnerability };
        });
        const demand = farmRows.reduce((sum, row) => sum + row.demand, 0);
        const gap = Math.max(0, demand - supply);
        const worstFarmDeficit = farmRows.reduce((max, row) =>
          Math.max(max, row.demand > 0 ? row.deficit / row.demand : 0), 0);
        const demandRatio = baselineDemand > 0 ? demand / baselineDemand : 1;
        const gapRatio = demand > 0 ? gap / demand : 0;
        const score = 0.55 * gapRatio + 0.30 * worstFarmDeficit + 0.15 * demandRatio;
        rows.push({
          crop,
          shift,
          demand,
          gap,
          worstFarmDeficit,
          score,
          reduction: baselineDemand - demand,
          farms: farmRows,
        });
      }
    }
    return rows.sort((a, b) => a.score - b.score);
  }, [farms, rainfallMm, supply, baselineDemand]);

  const alternatives = candidates.slice(0, 3);
  const active = alternatives[Math.min(selected, Math.max(0, alternatives.length - 1))];
  const baselineGap = Math.max(0, baselineDemand - supply);
  const baselineWorst = baselineRows.reduce((max, row) => {
    const area = farms.reduce((sum, farm) => sum + Math.max(0, farm.acres), 0);
    const allocation = area > 0 ? supply * Math.max(0, row.farm.acres) / area : 0;
    return Math.max(max, row.demand > 0 ? Math.max(0, row.demand - allocation) / row.demand : 0);
  }, 0);

  const uncertainty = (demand: number) => ({
    low: Math.max(0, demand * 0.85 - supply * 1.10),
    high: Math.max(0, demand * 1.15 - supply * 0.90),
  });
  const baselineRange = uncertainty(baselineDemand);
  const optionRange = uncertainty(active?.demand ?? baselineDemand);

  if (farms.length === 0) {
    return <section className="panel optimizer-panel">
      <small>BOUNDED INTERVENTION SEARCH</small>
      <h2>Village Resilience Optimizer</h2>
      <p className="muted">Add farm profiles or load the labelled village demo to run the scenario comparison.</p>
    </section>;
  }

  return <section className="panel optimizer-panel">
    <div className="panel-title">
      <div>
        <small>VILLAGE RESILIENCE ENGINE · DECISION SUPPORT</small>
        <h2>Adaptive intervention optimizer</h2>
        <p className="muted">A transparent, bounded search across 12 crop-mix alternatives. It ranks modelled trade-offs; it does not issue water allocations or agronomic prescriptions.</p>
      </div>
      <span className="tag">12 candidates</span>
    </div>
    <div className="optimizer-summary">
      <div><small>Current modelled demand</small><b>{fmt(baselineDemand)} m³</b></div>
      <div><small>Stress-adjusted supply</small><b>{fmt(supply)} m³</b></div>
      <div><small>Current modelled gap</small><b className={baselineGap > 0 ? 'negative' : 'positive'}>{fmt(baselineGap)} m³</b></div>
    </div>
    <div className="uncertainty-card">
      <b>Uncertainty envelope · baseline gap</b>
      <p>{fmt(baselineRange.low)}–{fmt(baselineRange.high)} m³ under a simple ±15% demand and ±10% supply sensitivity test.</p>
      <small>This is a sensitivity range, not a statistical confidence interval or forecast.</small>
    </div>
    <h3>Three candidate strategies</h3>
    <div className="strategy-grid">
      {alternatives.map((option, index) => <button
        key={option.crop + option.shift}
        className={'strategy-option ' + (selected === index ? 'chosen' : '')}
        onClick={() => setSelected(index)}
      >
        <span>OPTION {index + 1}</span>
        <b>{option.crop} · {option.shift}% area scenario</b>
        <strong>{fmt(option.demand)} m³</strong>
        <small>Modelled demand · gap {fmt(option.gap)} m³</small>
      </button>)}
    </div>
    {active && <>
      <div className="optimizer-detail">
        <div>
          <small>SELECTED CANDIDATE</small>
          <h3>{active.crop} on {active.shift}% of each farm's area</h3>
          <p>Modelled demand change: <b>{active.reduction >= 0 ? '−' : '+'}{fmt(Math.abs(active.reduction))} m³</b> versus current crop mix.</p>
        </div>
        <div className="optimizer-kpi">
          <small>Scenario gap</small>
          <strong>{fmt(active.gap)} m³</strong>
          <small>Range: {fmt(optionRange.low)}–{fmt(optionRange.high)} m³</small>
        </div>
      </div>
      <h3>Farm vulnerability radar</h3>
      <p className="muted">Indicative ranking from modelled farm demand, area-proportional planning share and input completeness. It is not a legal entitlement or a verified risk assessment.</p>
      {[...active.farms].sort((a, b) => b.vulnerability - a.vulnerability).map((row) => <div className="vulnerability-row" key={row.farm.id}>
        <div className="vulnerability-heading">
          <b>{row.farm.farmer}</b>
          <span>{row.vulnerability}/100 screening score</span>
        </div>
        <div className="bar"><i style={{ width: row.vulnerability + '%' }} /></div>
        <small>{fmt(row.demand)} m³ estimated demand · {fmt(row.share)} m³ area-proportional planning share · {fmt(row.deficit)} m³ indicative gap</small>
      </div>)}
      <div className="uncertainty-card">
        <b>Why this option ranks here</b>
        <p>Composite screening score: {active.score.toFixed(3)}. The ranking weights village gap (55%), worst farm-level deficit ratio (30%) and total demand relative to baseline (15%). Lower is better within this limited candidate set.</p>
        <small>Candidate ranking does not include intervention cost, market prices, soil-specific agronomic suitability, farmer preference, labour, nutrition or infrastructure constraints because those inputs are not currently collected. Confirm these before acting.</small>
      </div>
    </>}
    <div className="warning">Crop factors are illustrative prototype coefficients. The search is exhaustive only across the 12 listed combinations, not globally optimal. Supply is distributed by farm area solely as a discussion lens. No farm is assigned water by this tool.</div>
  </section>;
}
