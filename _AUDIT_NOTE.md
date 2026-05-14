# Audit Note — AILocalizationTranslationAgency

Source audit: `_AUDIT/reports/batch_05.md` § 9

## Audit accuracy correction
The audit reported "0 AI endpoints" but the project actually exposes ~27 formal `/api/ai/*` routes (see `server/index.js`):
`/ai/translate`, `/ai/localize`, `/ai/grammar`, `/ai/terminology`, `/ai/tm`, `/ai/quality`, `/ai/cultural`, `/ai/seo`, `/ai/back-translation`, `/ai/sentiment`, `/ai/lang-detect`, `/ai/readability`, `/ai/style-transfer`, `/ai/summarize`, `/ai/brand-voice`, `/ai/subtitles`, `/ai/doc-compare`, `/ai/competitor`, `/ai/project-analyzer`, `/ai/client-insights`, `/ai/translator-matcher`, `/ai/glossary-gen`, `/ai/order-optimizer`, `/ai/bias-check`, `/ai/invoice-analyzer`, `/ai/generate-quote`, `/ai-results`.

The audit's "missing" endpoints already exist:
- `/ai/translate` — exists (`ai-translate.js`)
- `/ai/quality-assurance` — exists as `/ai/quality` (`ai-quality.js`)
- `/ai/terminology-compliance` — exists as `/ai/terminology` (`ai-terminology.js`)
- `/ai/cost-estimate` — exists as `/ai/generate-quote` (`ai-generate-quote.js`)

## Implemented in this pass
Backlog-only (no code changes). The substantive AI surface is complete; remaining gaps are non-mechanical.

## Backlog (priority order)

### Needs product decision
- TM (translation memory) leverage metrics & sync workflows
- Multi-pass QA workflow (reviewer → auditor approval gating)
- In-context review tool (side-by-side source/target UI — frontend out of scope)
- Translator time tracking + invoicing rule engine

### Needs creds / external SDK
- DTP (desktop publishing) integration (InDesign, FrameMaker)
- File format converters (XLIFF, TMX, SDLXLIFF) — likely external libs

### Custom feature suggestions (deferred)
- Agentic translator assignment + capacity load-balancing
- Streaming QA agent (long-running review with token streaming)
- Multi-modal translation (images + subtitles + audio)
- Brand voice consistency agent (cross-project drift detection)
- Vertical-specific TM management (legal/medical/technical)

### Mechanical (low-value duplicates)
- None — audit's "missing" AI list is already covered.

## Apply pass 3 (frontend)

**Action**: LEFT-AS-IS. Frontend already exhaustively wired.

- `client/src/pages/AIPage.js` is config-driven and contains 26 endpoint configs matching every backend `/api/ai/*` route 1:1.
- `client/src/pages/AIHistory.js` consumes `/api/ai-results`.
- `client/src/services/api.js` axios instance auto-adds `Authorization: Bearer <token>` from `localStorage.token`; 401 redirects to `/`.
- 503 (no `OPENROUTER_API_KEY`) surfaces through axios error handling.

No FE files modified. See `_AUDIT/apply3_logs/ab3_88.md`.

## Apply pass 4 (mechanical backlog)

**Action**: LEFT-AS-IS. No mechanical backlog items remain.

Per the pass-2 audit note, the audit's "missing" AI endpoints are all already
covered by the 26 `/api/ai/*` routes in `server/routes/ai-*.js`. The remaining
backlog (TM-leverage workflows, multi-pass QA gating, in-context review UI,
translator time-tracking + invoicing rule engine, DTP integrations, XLIFF/TMX
converters, agentic translator assignment, streaming QA, multi-modal translation,
brand-voice drift, vertical-specific TM) is exclusively
NEEDS-PRODUCT-DECISION or NEEDS-CREDS / external SDK — none qualify as mechanical
LLM-only additions.

No code changed in this pass. See `_AUDIT/apply4_logs/ab3_88.md`.
