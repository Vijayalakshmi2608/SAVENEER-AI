# SAVENEER AI 2.0 — Publishing & Release Dossier

**Product:** SAVENEER AI — Village Water Intelligence for Sustainable Farming  
**Release:** 2.0 Resilience Engine upgrade  
**Tagline:** Predict the pressure. Compare interventions. Plan every drop.  
**Deployment:** https://saveneer-ai-mpr4cy.v2.appdeploy.ai/  
**Application ID:** saveneer-ai-mpr4cy

## 1. Executive summary

SAVENEER AI is a village-scale water and farm decision-support prototype. It connects farm profiles, indicative crop-water estimates, a village water budget, stress scenarios, pump feasibility, a farmer-reported evidence ledger and an AI explanation layer.

The central innovation is a **Village Resilience Engine**: a scenario-based planning workflow that compares a current crop mix with a bounded set of adaptive crop-mix alternatives, estimates farm-level shortfalls under a user-selected supply shock, exposes uncertainty through sensitivity ranges and explains the trade-offs. The engine is designed to support village meetings and farmer decisions, not to allocate water or prescribe crops.

## 2. Problem and users

Seasonal decisions are often made with fragmented information: crop choices, farm area, irrigation access, available supply and rainfall context are considered separately. Smallholders, farmer producer organisations (FPOs), watershed teams and local agricultural extension workers need a shared, understandable way to stress-test options before the season begins.

**Primary users:** farmers and FPO coordinators.  
**Supporting users:** watershed programme teams, agricultural extension officers and local planners.  
**Decision supported:** compare indicative demand and adaptation scenarios, identify where modelled shortfalls may concentrate, and decide what information must be validated before action.

## 3. Innovation and differentiators

1. **Village water budget:** aggregates saved crop scenarios against a user-entered supply figure.
2. **Scenario-based village digital representation:** models farm/crop demand under selectable supply shocks; it is not a live sensor-connected digital twin.
3. **Farm vulnerability radar:** ranks farms using a transparent screening heuristic based on modelled demand, area-proportional planning share and input completeness.
4. **Bounded intervention search:** enumerates 12 candidate combinations (three comparison crops × four area-shift levels), then presents three ranked alternatives.
5. **Uncertainty sensitivity:** displays an indicative gap envelope under ±15% demand and ±10% supply perturbations. This is not a statistical confidence interval.
6. **Village Resilience Copilot:** the existing OpenRouter-backed assistant explains supplied context; numerical outputs remain deterministic.
7. **Pump-Minute planning:** converts a user-entered pump discharge rate into a storage- and time-constrained illustrative plan.
8. **WaterProof evidence ledger:** validates submitted SHA-256 record fingerprints and previous-entry linkage. It establishes record integrity at submission, not truth of the physical observation.

## 4. Technical architecture

`Farm inputs + supply assumptions + weather context`
→ `provenance and input checks`
→ `deterministic crop-demand calculator`
→ `scenario engine and bounded intervention search`
→ `farm vulnerability screening + uncertainty sensitivity`
→ `human review`
→ `AI explanation (OpenRouter)`
→ `farmer-reported evidence ledger`

### Deterministic layer

The numerical layer calculates indicative crop demand using prototype crop coefficients, soil multipliers, irrigation multipliers and a rainfall adjustment. The intervention search enumerates the explicitly listed alternatives and scores them with a disclosed weighted heuristic. It does not rely on an LLM to invent or calculate litres.

### AI layer

OpenRouter is called from the backend using the secure `OPENROUTER_API_KEY` secret. The browser does not receive the secret. The assistant is instructed not to invent groundwater, rainfall measurements, yields, verified savings or legal rights. Provider availability and free-model routing are not guaranteed.

## 5. Data provenance and limitations

| Data | Current source/class | Limitation |
|---|---|---|
| Demo farms and scenarios | Synthetic fictional Kaveripakkam records | Not real farmers or field measurements |
| Farm profiles | User-entered project records | Not independently verified |
| Crop demand | Deterministic model estimate | Prototype coefficients; not calibrated agronomy |
| Village supply | User-entered assumption | No live tank, canal or groundwater sensor feed |
| Weather context | Open-Meteo forecast API at approximate Kaveripakkam coordinates | Forecast/model output, not a local rain-gauge observation |
| Pump flow | User-entered rate | Requires calibrated discharge test |
| WaterProof entries | Farmer-reported unless stated otherwise | Hash integrity does not verify physical truth |
| AI response | OpenRouter model output | May be unavailable or wrong; human review required |

**No live NWDP, CGWB or India-WRIS data feed is currently integrated.** No validated drought prediction, field pilot, independently measured savings or legally recognized water credit is claimed.

## 6. Optimizer method

For each farm, the model estimates current demand and alternative-crop demand. It evaluates the candidate crop on 20%, 40%, 60% or 80% of each farm's recorded area. It calculates village demand, supply gap and a farm-level indicative deficit against an area-proportional planning share.

The ranking score is:

`0.55 × village gap ratio + 0.30 × worst farm deficit ratio + 0.15 × demand ratio`

Lower scores rank earlier within the 12 candidate combinations. This is a transparent screening heuristic, not a cost optimizer or a global mathematical optimum. It currently does not model intervention cost, crop market price, labour, food-security priorities, farmer preference or verified crop suitability.

The uncertainty envelope uses a simple sensitivity test: demand ±15% and supply ±10%. It is not a probability distribution or forecast.

## 7. Responsible AI and safeguards

- Clearly label synthetic, user-entered, forecast, farmer-reported and model-estimated values.
- Never describe Open-Meteo forecast output as measured rainfall or groundwater.
- Do not treat the screening score as a validated drought forecast.
- Do not present area-proportional supply as a water right or allocation.
- Do not claim modelled demand reduction as measured water savings.
- Do not infer water volume from pump minutes without a calibrated flow rate.
- Do not treat a hash as proof of physical measurement or independent verification.
- Require local agronomic and watershed review before crop or infrastructure decisions.
- Do not expose API keys in frontend code, prompts, logs or public documentation.

## 8. Release and publishing checklist

### Before public judging
- [ ] Open the deployed app on desktop and a 375px mobile viewport.
- [ ] Load the clearly labelled demo village and verify all four synthetic farm profiles.
- [ ] Change supply shock and candidate crop; confirm the existing resilience scenario updates.
- [ ] Verify the new optimizer returns up to three alternatives and farm vulnerability rows.
- [ ] Confirm uncertainty text says sensitivity range, not confidence interval.
- [ ] Test a real OpenRouter question and record whether a completion succeeds; key validation alone is not a completion test.
- [ ] Test weather refresh and confirm source, timestamp and forecast disclaimer.
- [ ] Test pump planning with a calibrated or explicitly illustrative flow rate.
- [ ] Create a baseline and follow-up evidence record; verify the UI does not call the difference a verified saving.
- [ ] Run the platform end-to-end QA suite and resolve any failures.
- [ ] Capture fresh screenshots and a short narrated demo only after tests pass.
- [ ] Replace demo assumptions with dated, locally validated inputs before any real deployment.

### Demo script (3–4 minutes)
1. Explain the fragmented village planning problem.
2. Load the fictional Kaveripakkam dataset and state clearly that it is synthetic.
3. Apply a 40% supply shock in the Resilience Lab.
4. Open the intervention optimizer and compare the top three bounded alternatives.
5. Select an alternative and inspect the farm vulnerability radar and sensitivity range.
6. Explain why the ranking is only a decision aid and what missing data must be collected.
7. Show Pump-Minute constraints and the WaterProof integrity disclaimer.
8. Ask the AI copilot to explain the selected village scenario; distinguish AI explanation from deterministic calculation.

## 9. Validation plan

**Technical validation:** unit tests for crop demand, supply shock, area allocation, ranking stability, empty farm sets and uncertainty bounds; API validation tests; mobile interaction checks; OpenRouter success and failure-path tests.

**Field validation:** recruit a small FPO or watershed partner; agree consent and data governance; collect dated farm area/crop/soil/irrigation inputs; calibrate pump discharge; compare model estimates with observed irrigation records; ask an agricultural extension officer to review crop suitability; publish error ranges and feedback before making impact claims.

**Success measures:** scenario completion rate, proportion of inputs with source/date, number of farms with validated profiles, difference between modelled and observed demand, percentage of recommendations reviewed by local experts, and matched baseline/follow-up evidence coverage.

## 10. Business and scaling pathway

Potential customers include FPOs, watershed implementation partners, NGOs, district-level programmes and agricultural service providers. A practical pilot could offer a seasonal village assessment and planning dashboard, followed by an annual programme licence or per-village service fee. Pricing must be tested with partners; no revenue or customer traction is claimed.

Scaling requires source adapters for official datasets, role-based access and consent, audit logging, validated crop coefficients by agro-climatic zone, local language review, security testing and an operational support process.

## 11. Current release status

This dossier describes the intended release and current prototype boundaries. A successful cloud deployment does not itself establish end-to-end feature testing, field validation, security certification or agronomic accuracy. Refer to the latest AppDeploy deployment status and QA results before describing the release as production-validated.
