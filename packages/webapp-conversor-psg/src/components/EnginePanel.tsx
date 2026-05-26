import { useState } from 'react';

import type { HypoxicScore, PSGRecord } from '@somnosalud/psg-parser';

interface EnginePanelProps {
  record: PSGRecord;
  hypoxic: HypoxicScore;
  onClose: () => void;
}

const SCORE_COLORS: Record<HypoxicScore['catClass'], string> = {
  leve: '#4ade80',
  moderada: '#fbbf24',
  alta: '#fb923c',
  critica: '#f87171',
};

const PROFILE_COLORS: Record<string, string> = {
  A: '#f87171',
  B: '#fb923c',
  C: '#fbbf24',
  '—': '#64748b',
  'C (probable)': '#fbbf24',
};

type EngineTab = 'results' | 'methodology';

/**
 * Panel modal con tabs: Resultados (score + metricas + breakdown + flags +
 * detalle) y Metodología (explicación del scoring + DOI Azarbarzin 2019).
 *
 * Migrado desde legacy-v0/index.html lineas 1746-1845 + buildMethodologyTabPSG.
 */
export function EnginePanel({ record, hypoxic, onClose }: EnginePanelProps) {
  const [tab, setTab] = useState<EngineTab>('results');
  const scoreColor = SCORE_COLORS[hypoxic.catClass];

  return (
    <div className="engine-panel">
      <div className="engine-tabs-bar">
        <button
          className={`engine-tab-btn ${tab === 'results' ? 'active' : ''}`}
          onClick={() => setTab('results')}
        >
          Resultados
        </button>
        <button
          className={`engine-tab-btn ${tab === 'methodology' ? 'active' : ''}`}
          onClick={() => setTab('methodology')}
        >
          Metodología del cálculo
        </button>
        <button
          className="engine-tab-btn"
          onClick={onClose}
          style={{ color: '#f87171', marginLeft: 'auto' }}
          aria-label="Cerrar panel del Engine"
        >
          ✕ Cerrar
        </button>
      </div>

      {tab === 'results' ? (
        <ResultsTab record={record} hypoxic={hypoxic} scoreColor={scoreColor} />
      ) : (
        <MethodologyTab />
      )}
    </div>
  );
}

function ResultsTab({
  record,
  hypoxic,
  scoreColor,
}: {
  record: PSGRecord;
  hypoxic: HypoxicScore;
  scoreColor: string;
}) {
  const profileColor = PROFILE_COLORS[hypoxic.perfil] ?? '#64748b';
  const remNremRatio =
    hypoxic.iah_nrem > 0
      ? (hypoxic.iah_rem / hypoxic.iah_nrem).toFixed(1)
      : '—';
  const t85RatioT90 =
    hypoxic.t85_pct > 0 && hypoxic.t90_pct > 0
      ? (hypoxic.t85_pct / hypoxic.t90_pct).toFixed(2)
      : '—';

  const metrics = [
    { l: 'IAH', v: `${hypoxic.iah} ev/h` },
    { l: 'IAH REM', v: `${hypoxic.iah_rem} ev/h` },
    { l: 'IAH NREM', v: `${hypoxic.iah_nrem} ev/h` },
    { l: 'ODI', v: `${hypoxic.odi} ev/h` },
    { l: 'T90', v: `${hypoxic.t90_pct.toFixed(1)}%` },
    { l: 'T85', v: `${hypoxic.t85_pct.toFixed(1)}%` },
    { l: 'T80', v: `${hypoxic.t80_pct.toFixed(1)}%` },
    { l: 'SpO₂ basal', v: `${hypoxic.spo2_basal}%` },
    { l: 'SpO₂ media', v: `${hypoxic.spo2_media}%` },
    { l: 'SpO₂ nadir', v: `${hypoxic.nadir}%` },
    { l: 'HB', v: 'N/A', na: true },
    { l: 'Clustering', v: 'N/A', na: true },
  ];

  return (
    <div className="engine-tab-content">
      {/* Patient info */}
      <div className="engine-card">
        <div className="engine-card-header">
          {String(record.paciente_apellido ?? '')},{' '}
          {String(record.paciente_nombre ?? '')} —{' '}
          {String(record.estudio_fecha ?? '')}
        </div>
        <div className="engine-card-body engine-meta">
          IAH: {hypoxic.iah} ev/h · TST: {String(record.tiempo_sueno_total_min ?? '—')} min ·
          Eficiencia: {String(record.eficiencia_sueno_porc ?? '—')}%
        </div>
      </div>

      {/* NA warning */}
      <div className="na-note">
        ⚠ Score parcial — sin señal cruda de SpO₂. HB, clustering y %
        nadir&lt;80 no son computables desde el informe PDF. Máximo teórico
        alcanzable: {hypoxic.maxPossible}/100.
      </div>

      {/* Score display */}
      <div className="engine-card">
        <div className="engine-card-header">Score Hipóxico (parcial desde informe PSG)</div>
        <div className="engine-card-body score-display">
          <div className="score-big" style={{ color: scoreColor }}>
            {hypoxic.total}
          </div>
          <div className="score-label">de {hypoxic.maxPossible} posibles (de 100)</div>
          <div className={`score-cat score-${hypoxic.catClass}`}>{hypoxic.categoria}</div>
          <div className="score-desc">{hypoxic.catDesc}</div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="engine-card">
        <div className="engine-card-header">Métricas del informe</div>
        <div className="engine-card-body">
          <div className="metrics-grid">
            {metrics.map((m, i) => (
              <div key={i} className={`metric-card ${m.na ? 'na' : ''}`}>
                <div className="mv">{m.v}</div>
                <div className="ml">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="engine-card">
        <div className="engine-card-header">Desglose por componente</div>
        <div className="engine-card-body">
          {hypoxic.components.map((c, i) => {
            const pct = ((c.value / c.max) * 100).toFixed(0);
            return (
              <div key={i} className="breakdown-item">
                <span className="breakdown-label">
                  {c.label}
                  {c.note && <span className="breakdown-note"> ({c.note})</span>}
                </span>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{ width: `${pct}%`, background: c.color }}
                  />
                </div>
                <span className="breakdown-value">
                  {c.value}/{c.max}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile */}
      <div className="engine-card">
        <div className="engine-card-header">Perfil hipóxico</div>
        <div className="engine-card-body">
          <span
            className="profile-badge"
            style={{ background: `${profileColor}30`, color: profileColor }}
          >
            {hypoxic.perfil}
          </span>
          <p
            className="profile-desc"
            dangerouslySetInnerHTML={{ __html: hypoxic.perfilDesc }}
          />
        </div>
      </div>

      {/* Flags */}
      {hypoxic.flags.length > 0 && (
        <div className="engine-card">
          <div className="engine-card-header">Alertas clínicas</div>
          <div className="engine-card-body">
            <ul className="flag-list">
              {hypoxic.flags.map((f, i) => (
                <li key={i} className={f.t}>
                  {f.m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Detail table */}
      <div className="engine-card">
        <div className="engine-card-header">Detalle paso a paso</div>
        <div className="engine-card-body">
          <table className="detail-table">
            <thead>
              <tr>
                <th>Componente</th>
                <th>Métrica</th>
                <th>Valor</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={4}>Carga (0-40)</td>
                <td className="na-cell">HB</td>
                <td className="na-cell">N/A</td>
                <td className="na-cell">—/16</td>
              </tr>
              <tr>
                <td>T90</td>
                <td>{hypoxic.t90_pct.toFixed(1)}%</td>
                <td>{hypoxic.t90_score}/16</td>
              </tr>
              <tr>
                <td>Bonus T85/T90</td>
                <td>{t85RatioT90}</td>
                <td>{hypoxic.bonus_t85}/4</td>
              </tr>
              <tr>
                <td>Bonus T80</td>
                <td>{hypoxic.t80_pct.toFixed(1)}%</td>
                <td>{hypoxic.bonus_t80}/4</td>
              </tr>
              <tr>
                <td>Ciclicidad (0-16)</td>
                <td>ODI</td>
                <td>{hypoxic.odi} ev/h</td>
                <td>{hypoxic.ciclicidad}/16</td>
              </tr>
              <tr>
                <td rowSpan={2}>Profundidad (0-20)</td>
                <td>Nadir</td>
                <td>{hypoxic.nadir}%</td>
                <td>{hypoxic.prof_base}/16</td>
              </tr>
              <tr>
                <td className="na-cell">% nadir&lt;80</td>
                <td className="na-cell">N/A</td>
                <td className="na-cell">—/4</td>
              </tr>
              <tr>
                <td>Mod. basal (0-8)</td>
                <td>SpO₂ basal</td>
                <td>{hypoxic.spo2_basal}%</td>
                <td>{hypoxic.mod_basal}/8</td>
              </tr>
              <tr>
                <td>Mod. temporal (0-8)</td>
                <td>REM/NREM ratio</td>
                <td>{remNremRatio}</td>
                <td>{hypoxic.mod_temporal}/8</td>
              </tr>
              <tr>
                <td>Mod. clínico (0-8)</td>
                <td colSpan={2} className="na-cell">No implementado</td>
                <td>0/8</td>
              </tr>
              <tr className="detail-total">
                <td colSpan={3}>TOTAL (parcial)</td>
                <td>
                  {hypoxic.total}/{hypoxic.maxPossible}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MethodologyTab() {
  return (
    <div className="engine-tab-content">
      <div className="engine-card">
        <div className="engine-card-header">
          Metodología — Score Hipóxico desde Informe PSG (parcial)
        </div>
        <div className="engine-card-body">
          <div className="method-section">
            <h3>Concepto</h3>
            <p>
              Score 0-100 con 6 componentes (carga + ciclicidad + profundidad +
              modificador basal + modificador temporal + modificador clínico).
              Cuando el input es un informe PDF (no señal cruda de SpO₂), solo
              están disponibles métricas agregadas — el score real máximo se
              limita a ~76/100.
            </p>
            <div className="method-formula">
              Componentes computables: T90, T85, T80 (carga parcial), ODI
              (ciclicidad), nadir (profundidad parcial), SpO₂ basal,
              IAH REM/NREM (temporal parcial)
            </div>
            <div className="method-formula na-text">
              Componentes NO computables: HB real (área bajo curva por evento),
              clustering temporal, % nadir&lt;80, modificador clínico (edad +
              comorbilidades)
            </div>
          </div>

          <div className="method-section">
            <h3>1. Carga acumulativa (0-40 teórico, 0-24 real sin HB)</h3>
            <p>Suma T90_score + bonus_T85 + bonus_T80. Sin HB real.</p>
            <ul>
              <li>T90 &lt; 1% → 0 puntos · &lt; 3% → 2 · &lt; 5% → 4 · &lt; 10% → 7 · &lt; 15% → 10 · &lt; 30% → 13 · ≥ 30% → 16</li>
              <li>Bonus T85/T90: ratio &gt; 0.7 → 4 · &gt; 0.5 → 2</li>
              <li>Bonus T80: &gt; 5% → 4 · &gt; 1% → 2</li>
            </ul>
          </div>

          <div className="method-section">
            <h3>2. Ciclicidad (0-16) por ODI</h3>
            <p>
              ODI &lt; 5 → 0 · &lt; 10 → 3 · &lt; 15 → 5 · &lt; 25 → 8 ·
              &lt; 35 → 11 · &lt; 50 → 14 · ≥ 50 → 16
            </p>
          </div>

          <div className="method-section">
            <h3>3. Profundidad (0-20)</h3>
            <p>
              Nadir SpO₂ ≥ 88 → 0 · ≥ 85 → 3 · ≥ 80 → 6 · ≥ 75 → 10 · ≥ 70 → 14
              · &lt; 70 → 16
            </p>
            <p className="na-text">Bonus % nadir&lt;80 no disponible (requiere histograma).</p>
          </div>

          <div className="method-section">
            <h3>4. Modificador basal (0-8) por SpO₂ vigilia</h3>
            <p>
              &lt; 88 → 8 · &lt; 90 → 6 · &lt; 92 → 4 · &lt; 95 → 2 · ≥ 95 → 0
            </p>
          </div>

          <div className="method-section">
            <h3>5. Modificador temporal (0-8)</h3>
            <p>
              Ratio IAH REM / IAH NREM ≥ 2 → +4 (REM-predominante) · ≥ 1.5 → +2
            </p>
            <p className="na-text">Clustering temporal no disponible (requiere timestamps de eventos).</p>
          </div>

          <div className="method-section">
            <h3>6. Modificador clínico (0-8)</h3>
            <p className="na-text">No implementado en este informe (requiere edad + comorbilidades).</p>
          </div>

          <div className="method-section">
            <h3>Categorización</h3>
            <ul>
              <li><strong>Leve</strong> (≤ 15): Daño esperable mínimo.</li>
              <li><strong>Moderada</strong> (16-39): Daño relevante. Iniciar PAP.</li>
              <li><strong>Alta</strong> (40-69): Daño significativo. Prioridad terapéutica.</li>
              <li><strong>Crítica</strong> (≥ 70): Daño severo activo.</li>
            </ul>
          </div>

          <div className="method-section">
            <h3>Referencia científica</h3>
            <p>
              Azarbarzin A, Sands SA, Stone KL, et al.{' '}
              <em>
                The hypoxic burden of sleep apnoea predicts cardiovascular
                disease-related mortality: the Osteoporotic Fractures in Men
                Study and the Sleep Heart Health Study.
              </em>{' '}
              Eur Heart J. 2019;40(14):1149-1157.
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.1093/eurheartj/ehy624"
                target="_blank"
                rel="noopener noreferrer"
              >
                10.1093/eurheartj/ehy624
              </a>{' '}
              · <strong>PMID:</strong> 30376054 · <strong>Evidence Level:</strong> A
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
