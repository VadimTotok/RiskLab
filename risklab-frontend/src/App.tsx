
import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

type HistogramBin = {
  lowerBound: number
  upperBound: number
  count: number
}

type SimulationResult = {
  averageFinalValue: number
  medianFinalValue: number
  probabilityOfLoss: number
  valueAtRisk: number
  expectedShortfall: number
  minimumFinalValue: number
  maximumFinalValue: number
  distribution: HistogramBin[]
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${(value * 100).toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  })}%`
}

function App() {
  const [initialInvestment, setInitialInvestment] = useState(100000)
  const [annualExpectedReturn, setAnnualExpectedReturn] = useState(8)
  const [annualVolatility, setAnnualVolatility] = useState(20)
  const [years, setYears] = useState(5)
  const [simulations, setSimulations] = useState(10000)

  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function runSimulation() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/api/simulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialInvestment,
          annualExpectedReturn: annualExpectedReturn / 100,
          annualVolatility: annualVolatility / 100,
          years,
          simulations,
          confidenceLevel: 0.95,
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Ошибка сервера: ${response.status}`)
      }

      const data: SimulationResult = await response.json()

      if (!Array.isArray(data.distribution)) {
        throw new Error(
          'Backend не вернул данные распределения. Проверь SimulationResult в Java.',
        )
      }

      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось выполнить симуляцию.',
      )
    } finally {
      setLoading(false)
    }
  }

  const maxBinCount = result
    ? Math.max(...result.distribution.map((bin) => bin.count), 1)
    : 1

  const initialCapitalPosition =
    result &&
    result.maximumFinalValue > result.minimumFinalValue
      ? ((initialInvestment - result.minimumFinalValue) /
          (result.maximumFinalValue - result.minimumFinalValue)) *
        100
      : 0

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">R</span>
          <span>RiskLab</span>
        </a>

        <span className="topbar-label">MONTE CARLO SIMULATOR</span>
      </header>

      <section className="hero">
        <p className="eyebrow">INVESTMENT RISK ANALYSIS</p>
        <h1>
          Увидь возможное
          <br />
          <span>будущее инвестиций.</span>
        </h1>
        <p className="hero-description">
          Смоделируй тысячи сценариев развития портфеля и оцени,
          как доходность и рыночная волатильность влияют на твой капитал.
        </p>
      </section>

      <section className="workspace">
        <aside className="control-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / PARAMETERS</p>
              <h2>Настройки модели</h2>
            </div>
            <span className="status-dot" title="Модель готова" />
          </div>

          <div className="field">
            <label htmlFor="investment">Начальный капитал, ₽</label>
            <input
              id="investment"
              type="number"
              min="1"
              step="10000"
              value={initialInvestment}
              onChange={(event) =>
                setInitialInvestment(Number(event.target.value))
              }
            />
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="return">Ожидаемая доходность</label>
              <span className="field-value">{annualExpectedReturn}%</span>
            </div>
            <input
              id="return"
              type="range"
              min="-20"
              max="40"
              step="1"
              value={annualExpectedReturn}
              onChange={(event) =>
                setAnnualExpectedReturn(Number(event.target.value))
              }
            />
            <div className="range-labels">
              <span>−20%</span>
              <span>40%</span>
            </div>
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="volatility">Годовая волатильность</label>
              <span className="field-value">{annualVolatility}%</span>
            </div>
            <input
              id="volatility"
              type="range"
              min="0"
              max="80"
              step="1"
              value={annualVolatility}
              onChange={(event) =>
                setAnnualVolatility(Number(event.target.value))
              }
            />
            <div className="range-labels">
              <span>0%</span>
              <span>80%</span>
            </div>
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="years">Горизонт инвестирования</label>
              <span className="field-value">
                {years} {years === 1 ? 'год' : years >= 2 && years <= 4 ? 'года' : 'лет'}
              </span>
            </div>
            <input
              id="years"
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(event) => setYears(Number(event.target.value))}
            />
            <div className="range-labels">
              <span>1 год</span>
              <span>30 лет</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="simulations">Количество сценариев</label>
            <select
              id="simulations"
              value={simulations}
              onChange={(event) => setSimulations(Number(event.target.value))}
            >
              <option value={1000}>1 000 сценариев</option>
              <option value={5000}>5 000 сценариев</option>
              <option value={10000}>10 000 сценариев</option>
              <option value={25000}>25 000 сценариев</option>
              <option value={50000}>50 000 сценариев</option>
            </select>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={runSimulation}
            disabled={
              loading ||
              !Number.isFinite(initialInvestment) ||
              initialInvestment <= 0
            }
          >
            {loading ? (
              <>
                <span className="spinner" />
                Расчёт сценариев...
              </>
            ) : (
              <>
                Запустить симуляцию
                <span aria-hidden="true">↗</span>
              </>
            )}
          </button>

          <p className="panel-note">
            Модель использует случайные сценарии доходности. Результаты
            меняются при каждом запуске.
          </p>
        </aside>

        <section className="results-area">
          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">
                <span>↗</span>
              </div>
              <p className="eyebrow">02 / RESULTS</p>
              <h2>Твой анализ начнётся здесь</h2>
              <p>
                Настрой параметры слева и запусти симуляцию, чтобы увидеть
                возможные результаты инвестирования и связанные с ними риски.
              </p>
              <div className="empty-stats">
                <div>
                  <strong>VaR</strong>
                  <span>Риск потерь</span>
                </div>
                <div>
                  <strong>Monte Carlo</strong>
                  <span>Метод симуляции</span>
                </div>
                <div>
                  <strong>95%</strong>
                  <span>Уровень доверия</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="message-panel">
              <span className="spinner" />
              <h2>Моделируем будущее</h2>
              <p>
                Рассчитываем {simulations.toLocaleString('ru-RU')} возможных
                траекторий твоего капитала.
              </p>
            </div>
          )}

          {error && (
            <div className="error-panel" role="alert">
              <h2>Не удалось выполнить симуляцию</h2>
              <p>{error}</p>
              <button
                className="secondary-button"
                type="button"
                onClick={runSimulation}
              >
                Попробовать снова
              </button>
            </div>
          )}

          {result && (
            <>
              <div className="panel-heading results-heading">
                <div>
                  <p className="eyebrow">02 / RESULTS</p>
                  <h2>Результаты симуляции</h2>
                </div>
                <span className="result-badge">95% CONFIDENCE</span>
              </div>

              <div className="metric-grid">
                <article className="metric-card primary-metric">
                  <p>Средний конечный капитал</p>
                  <strong>{formatMoney(result.averageFinalValue)}</strong>
                  <span>
                    {formatPercent(
                      result.averageFinalValue / initialInvestment - 1,
                    )}{' '}
                    к начальному капиталу
                  </span>
                </article>

                <article className="metric-card">
                  <p>Медианный капитал</p>
                  <strong>{formatMoney(result.medianFinalValue)}</strong>
                  <span>50% сценариев ниже этого значения</span>
                </article>

                <article className="metric-card risk-metric">
                  <p>Вероятность убытка</p>
                  <strong>{formatPercent(result.probabilityOfLoss)}</strong>
                  <span>Капитал ниже начального</span>
                </article>

                <article className="metric-card">
                  <p>Value at Risk (95%)</p>
                  <strong>{formatMoney(result.valueAtRisk)}</strong>
                  <span>Порог потерь на уровне 95%</span>
                </article>

                <article className="metric-card">
                  <p>Expected Shortfall (95%)</p>
                  <strong>{formatMoney(result.expectedShortfall)}</strong>
                  <span>Средний убыток в худших 5% сценариев</span>
                </article>
              </div>

              <section className="chart-panel">
                <div className="chart-heading">
                  <div>
                    <p className="eyebrow">DISTRIBUTION ANALYSIS</p>
                    <h2>Распределение результатов</h2>
                    <p className="chart-description">
                      Количество сценариев в каждом диапазоне конечного капитала
                    </p>
                  </div>
                  <span className="chart-count">
                    {result.distribution
                      .reduce((sum, bin) => sum + bin.count, 0)
                      .toLocaleString('ru-RU')}{' '}
                    сценариев
                  </span>
                </div>

                
<div className="histogram">
  {result.distribution.map((bin, index) => {
    const height = (bin.count / maxBinCount) * 100

    return (
      <div
        className="histogram-column"
        key={`${bin.lowerBound}-${index}`}
        title={`${formatMoney(bin.lowerBound)} – ${formatMoney(bin.upperBound)}: ${bin.count} сценариев`}
      >
        <div className="histogram-bar-area">
          <div
            className="histogram-bar"
            style={{
              height: `${bin.count > 0 ? Math.max(height, 1) : 0}%`,
            }}
          />
        </div>
      </div>
    )
  })}

  {result.distribution.length > 0 &&
    result.minimumFinalValue <= initialInvestment &&
    initialInvestment <= result.maximumFinalValue && (
      <div
        className="capital-marker"
        style={{
          left: `${initialCapitalPosition}%`,
        }}
      >
        <span>Стартовый капитал</span>
      </div>
    )}
</div>


                <div className="histogram-axis">
                  <span>
                    {formatMoney(result.distribution[0]?.lowerBound ?? 0)}
                  </span>
                  <span>
                    {formatMoney(
                      result.distribution[result.distribution.length - 1]
                        ?.upperBound ?? 0,
                    )}
                  </span>
                </div>

                <div className="chart-legend">
                  <span className="legend-dot" />
                  <span>Конечная стоимость портфеля</span>
                </div>
              </section>

              <section className="chart-panel range-panel">
                <div className="chart-heading">
                  <div>
                    <p className="eyebrow">OUTCOME RANGE</p>
                    <h2>Диапазон результатов</h2>
                    <p className="chart-description">
                      От минимального до максимального смоделированного результата
                    </p>
                  </div>
                </div>

                <div className="range-stats">
                  <div className="range-stat">
                    <span>Минимальный капитал</span>
                    <strong>{formatMoney(result.minimumFinalValue)}</strong>
                  </div>
                  <div className="range-stat">
                    <span>Начальный капитал</span>
                    <strong>{formatMoney(initialInvestment)}</strong>
                  </div>
                  <div className="range-stat">
                    <span>Максимальный капитал</span>
                    <strong>{formatMoney(result.maximumFinalValue)}</strong>
                  </div>
                </div>
              </section>

              <p className="disclaimer">
                RiskLab: образовательный симулятор, а не инвестиционная
                рекомендация. Модельные результаты не гарантируют будущую
                доходность и не учитывают автоматически налоги, комиссии и
                инфляцию.
              </p>
            </>
          )}
        </section>
      </section>

    </main>
  )
}

export default App
