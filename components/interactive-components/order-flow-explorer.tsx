'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'before' | 'after';
const STAGES = ['Greeting', 'Take items', 'Modifiers', 'Read back', 'Validate', 'Send to POS'] as const;
type Stage = (typeof STAGES)[number];

interface SchemaItem { name: string; quantity: number; modifiers: string[]; price: number | null }
interface SchemaPreview { valid: boolean; label: string; detail: string; payload: { items: SchemaItem[] } }
interface TicketLine { label: string; modifiers?: string; price: string; invalid?: boolean }
interface CallStep {
  speaker: 'Agent' | 'Caller';
  text: string;
  note?: string;
  stage?: Stage;
  schema?: SchemaPreview;
  showTicket?: boolean;
}

const VALID_ITEMS: SchemaItem[] = [
  { name: 'Tuesday Fish Special', quantity: 2, modifiers: ['Extra tartar'], price: 8.99 },
  { name: 'Coleslaw', quantity: 1, modifiers: [], price: 2.99 },
];

const BEFORE_STEPS: CallStep[] = [
  { speaker: 'Agent', text: 'Thanks for calling. What can I get started for you?' },
  {
    speaker: 'Caller',
    text: 'Can I get two Tuesday Fish Specials with extra tartar, a coleslaw, and the Tuesday combo upgrade if you have one?',
  },
  {
    speaker: 'Agent',
    text: 'Sure, I added two Tuesday Fish Specials with extra tartar, one coleslaw, and the Tuesday Fish Deluxe Upgrade.',
    note: 'Free-form chat invents a promo item that is not on the menu.',
  },
  { speaker: 'Caller', text: 'Great, how long will that take?' },
  { speaker: 'Agent', text: 'About fifteen minutes. Sending your order to the kitchen now.', showTicket: true },
];

const AFTER_STEPS: CallStep[] = [
  { speaker: 'Agent', text: 'Thanks for calling. What can I get started for you?', stage: 'Greeting' },
  {
    speaker: 'Caller',
    text: 'Can I get two Tuesday Fish Specials, a coleslaw, and the Tuesday combo upgrade if you have one?',
    stage: 'Take items',
  },
  { speaker: 'Agent', text: 'What sauce would you like with the two Tuesday Fish Specials?', stage: 'Modifiers' },
  { speaker: 'Caller', text: 'Extra tartar sauce on both.', stage: 'Modifiers' },
  {
    speaker: 'Agent',
    text: 'I have two Tuesday Fish Specials with extra tartar, one coleslaw, and a Tuesday combo upgrade. Let me verify that against the menu.',
    stage: 'Read back',
  },
  {
    speaker: 'Agent',
    text: 'We do not carry a Tuesday combo upgrade. Would you like to keep just the two Tuesday Fish Specials with extra tartar and the coleslaw?',
    stage: 'Validate',
    note: 'Schema validation blocked the unknown item before it could reach the POS.',
    schema: {
      valid: false,
      label: 'Schema check failed',
      detail: 'Item "Tuesday combo upgrade" is not in the menu catalog.',
      payload: {
        items: [
          ...VALID_ITEMS,
          { name: 'Tuesday combo upgrade', quantity: 1, modifiers: [], price: null },
        ],
      },
    },
  },
  {
    speaker: 'Caller',
    text: 'Yes, just the two fish specials with extra tartar and the coleslaw.',
    stage: 'Validate',
    schema: {
      valid: true,
      label: 'Schema check passed',
      detail: 'Every item, modifier, and price matches the menu schema.',
      payload: { items: VALID_ITEMS },
    },
  },
  {
    speaker: 'Agent',
    text: 'Confirmed. Sending your order to the kitchen now. It will be ready in fifteen minutes.',
    stage: 'Send to POS',
    showTicket: true,
  },
];

const AFTER_TICKET: TicketLine[] = [
  { label: '2x Tuesday Fish Special', modifiers: 'Extra tartar', price: '$17.98' },
  { label: '1x Coleslaw', price: '$2.99' },
];

const BEFORE_TICKET: TicketLine[] = [
  ...AFTER_TICKET,
  { label: '1x Tuesday Fish Deluxe Upgrade', price: '$6.50', invalid: true },
];

function StatusIcon({ kind, className }: { kind: 'check' | 'x'; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={className}>
      {kind === 'check' ? (
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0l-3.25-3.25a1 1 0 011.415-1.415l2.542 2.543 6.543-6.548a1 1 0 011.415 0z"
          clipRule="evenodd"
        />
      ) : (
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      )}
    </svg>
  );
}

const BTN_FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export function OrderFlowExplorer() {
  const [mode, setMode] = useState<Mode>('before');
  const [stepIndex, setStepIndex] = useState(0);

  const steps = mode === 'before' ? BEFORE_STEPS : AFTER_STEPS;
  const currentStep = steps[stepIndex];
  const visibleSteps = steps.slice(0, stepIndex + 1);
  const currentStageIndex = currentStep.stage ? STAGES.indexOf(currentStep.stage) : -1;
  const ticketLines = mode === 'before' ? BEFORE_TICKET : AFTER_TICKET;

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setStepIndex(0);
  };

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
      <div className="flex flex-col gap-3 mb-5">
        <div
          role="group"
          aria-label="Order flow mode"
          className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl self-start"
        >
          {(['before', 'after'] as const).map((id) => {
            const active = mode === id;
            const label = id === 'before' ? 'Before the rebuild' : 'After the rebuild';
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => switchMode(id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${BTN_FOCUS} ${
                  active
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-1" aria-live="polite">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            aria-label="Previous step"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${BTN_FOCUS}`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
            disabled={stepIndex === steps.length - 1}
            aria-label="Next step"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${BTN_FOCUS}`}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setStepIndex(0)}
            disabled={stepIndex === 0}
            aria-label="Reset call walkthrough"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${BTN_FOCUS}`}
          >
            Reset
          </button>
        </div>
      </div>

      {mode === 'after' ? (
        <ol aria-label="Order state stages" className="flex flex-wrap gap-1.5 mb-5">
          {STAGES.map((stage, idx) => {
            const isCurrent = idx === currentStageIndex;
            const isDone = idx < currentStageIndex;
            return (
              <li
                key={stage}
                aria-current={isCurrent ? 'step' : undefined}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {isDone && <StatusIcon kind="check" className="w-3.5 h-3.5 shrink-0" />}
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />}
                <span>{stage}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mb-5 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400">
          Free-form conversation with no stages and no menu validation before the POS.
        </div>
      )}

      <div className="space-y-2.5 mb-4">
        <AnimatePresence initial={false}>
          {visibleSteps.map((step, idx) => (
            <motion.div
              key={`${mode}-${idx}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`p-3 rounded-xl border text-sm ${
                step.speaker === 'Agent'
                  ? 'bg-neutral-50 dark:bg-neutral-800/70 border-neutral-200 dark:border-neutral-700'
                  : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">{step.speaker}</span>
                {step.stage && <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{step.stage}</span>}
              </div>
              <p className="text-neutral-800 dark:text-neutral-100 leading-relaxed">{step.text}</p>
              {step.note && <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">{step.note}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {currentStep.schema && (
          <motion.div
            key={`schema-${stepIndex}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className={`mb-4 p-3.5 rounded-xl border ${
              currentStep.schema.valid
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                POS order JSON payload
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentStep.schema.valid
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                }`}
              >
                <StatusIcon kind={currentStep.schema.valid ? 'check' : 'x'} className="w-3.5 h-3.5" />
                <span>{currentStep.schema.label}</span>
              </span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-2">{currentStep.schema.detail}</p>
            <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 text-xs overflow-auto max-h-56 leading-relaxed">
              <code>{JSON.stringify(currentStep.schema.payload, null, 2)}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentStep.showTicket && (
          <motion.div
            key={`ticket-${mode}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                POS ticket
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  mode === 'before'
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <StatusIcon kind={mode === 'before' ? 'x' : 'check'} className="w-3.5 h-3.5 shrink-0" />
                <span>{mode === 'before' ? 'Wrong order reached the kitchen' : 'Order matches the menu'}</span>
              </span>
            </div>

            <ul className="space-y-1.5 text-sm">
              {ticketLines.map((line) => (
                <li
                  key={line.label}
                  className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg border ${
                    line.invalid
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {line.invalid && <StatusIcon kind="x" className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                    <span className="font-medium">{line.label}</span>
                    {line.modifiers && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">({line.modifiers})</span>
                    )}
                    {line.invalid && (
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300">
                        Not on menu
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs">{line.price}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        Simplified illustration. Not the production prompts or the vendor&apos;s system.
      </p>
    </div>
  );
}
