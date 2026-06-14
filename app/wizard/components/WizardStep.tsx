'use client'

import CountrySelect, { ALL_COUNTRIES } from '@/components/CountrySelect'
import InlineCalendar from './InlineCalendar'

export interface WizardAnswers {
  passport: string
  destination: string
  purpose: string
  duration: string
  travelDate: string
}

interface StepConfig {
  stepNum: number
  label: string
  question: string
  subtitle?: string
}

export const STEPS: StepConfig[] = [
  { stepNum: 1, label: 'Passport', question: 'Where is your passport from?', subtitle: 'Select your passport country' },
  { stepNum: 2, label: 'Destination', question: 'Where are you traveling to?', subtitle: 'Select your destination country' },
  { stepNum: 3, label: 'Purpose', question: "What's the purpose of your trip?" },
  { stepNum: 4, label: 'Duration', question: 'How many days will you stay?', subtitle: 'Maximum 90 for most tourist visas' },
  { stepNum: 5, label: 'Travel Date', question: 'When do you plan to travel?', subtitle: 'Optional — helps us calculate application deadlines' },
]

const PURPOSE_OPTIONS = [
  { value: 'Tourism', label: '🌴 Tourism', desc: 'Sightseeing & leisure' },
  { value: 'Business', label: '💼 Business', desc: 'Meetings & conferences' },
  { value: 'Transit', label: '✈️ Transit', desc: 'Passing through' },
  { value: 'Student', label: '🎓 Student', desc: 'Study or courses' },
  { value: 'Family', label: '👨‍👩‍👧 Family', desc: 'Visiting relatives' },
  { value: 'Work', label: '⚒️ Work', desc: 'Employment' },
]

interface Props {
  step: number
  answers: Partial<WizardAnswers>
  onAnswer: (field: keyof WizardAnswers, value: string) => void
  onNext: () => void
  onBack: () => void
  /** Country auto-detected from saved choice or IP — shown as a hint on step 1 */
  autoDetected?: string | null
}

export default function WizardStep({ step, answers, onAnswer, onNext, onBack, autoDetected }: Props) {
  const config = STEPS[step - 1]
  const progress = (step / 5) * 100

  function canProceed(): boolean {
    const field = (['passport', 'destination', 'purpose', 'duration', 'travelDate'] as (keyof WizardAnswers)[])[step - 1]
    if (field === 'travelDate') return true // optional
    const val = answers[field]
    if (field === 'duration') return !!val && Number(val) > 0
    return !!val
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canProceed()) onNext()
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4" onKeyDown={handleKeyDown}>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Question {step} of 5
          </span>
          <div className="flex gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.stepNum}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  s.stepNum < step ? 'w-6 bg-teal-500' :
                  s.stepNum === step ? 'w-6 bg-teal-500' :
                  'w-3 bg-slate-200',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
        <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card — note: NO overflow-hidden, or the country dropdown gets clipped */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Question */}
        <div className="px-6 pt-7 pb-5">
          <div className="mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-600">
              {config.label}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2 mb-1">{config.question}</h2>
          {config.subtitle && (
            <p className="text-sm text-slate-500">{config.subtitle}</p>
          )}
        </div>

        {/* Input area */}
        <div className="px-6 pb-6">
          {step === 1 && (
            <>
              <CountrySelect
                value={answers.passport ?? ''}
                onChange={(v) => onAnswer('passport', v)}
                placeholder="Search passport country…"
                variant="light"
              />
              {autoDetected && answers.passport === autoDetected && (
                <p className="mt-2 text-xs text-slate-500">
                  📍 Auto-detected: {ALL_COUNTRIES.find((c) => c.name === autoDetected)?.flag ?? '🌍'}{' '}
                  {autoDetected} — change above if this isn&apos;t right
                </p>
              )}
            </>
          )}

          {step === 2 && (
            <CountrySelect
              value={answers.destination ?? ''}
              onChange={(v) => onAnswer('destination', v)}
              placeholder="Search destination country…"
              variant="light"
            />
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-2.5">
              {PURPOSE_OPTIONS.map((opt) => {
                const selected = answers.purpose === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onAnswer('purpose', opt.value); onNext() }}
                    className={[
                      'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all duration-150',
                      selected
                        ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50',
                    ].join(' ')}
                  >
                    <span className="text-base font-semibold text-slate-800">{opt.label}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{opt.desc}</span>
                  </button>
                )
              })}
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={answers.duration ?? ''}
                  onChange={(e) => onAnswer('duration', e.target.value)}
                  placeholder="e.g. 7"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base font-semibold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  days
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                💡 Maximum 90 days for most tourist visas
              </p>
            </div>
          )}

          {step === 5 && (
            <div>
              <InlineCalendar
                value={answers.travelDate ?? ''}
                onChange={(v) => onAnswer('travelDate', v)}
              />
              <p className="mt-2 text-xs text-slate-500">
                📅 Helps us calculate your earliest application date — optional
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-3 rounded-b-2xl">
          {step > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition"
            >
              ← Back
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed()}
            className={[
              'ml-auto flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-150',
              canProceed()
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm hover:shadow-md hover:-translate-y-px'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            ].join(' ')}
          >
            {step === 5 ? 'Get My Visa Plan →' : 'Continue →'}
          </button>

          {step === 5 && (
            <button
              type="button"
              onClick={onNext}
              className="text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-2"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
