# Governed localization delivery

The durable path is `/api/governed-localization-deliveries`. A tenant membership and Bearer identity are required, and every write also requires `X-Tenant-Id` and `Idempotency-Key`. Cases advance through format validation, segmentation, locked TM/terminology versions, assignment, translation, independent QA, client acceptance, and versioned packaging. Evidence stores only encrypted-storage references, versions, SHA-256 digests, timestamps, and non-sensitive metadata.

The migration `server/migrations/001_governed_localization.sql` is an explicit operator action; startup never applies it. It adds tenant-scoped cases, immutable evidence/events, optimistic versions, retention metadata, and connector-failure receipts. Apply it through the approved deployment migrator after backup, review, and rollback planning.

Supported assessment fixtures cover documents, subtitles, software resources, websites, and structured content. Placeholder preservation and zero QA errors are necessary but never sufficient: delivery remains a human/client decision. RTL/CJK layout, plural/gender behavior, subtitle timing, rights, billing, and real CAT/TMS/CMS/provider acceptance require controlled datasets and qualified reviewers.

Legacy AI, interpretation, and generated agent routes are quarantined by default. `ENABLE_LEGACY_PROVIDER_ROUTES` is forbidden in production; credentials alone cannot enable them. The governed connector catalog records intended integrations without pretending a provider is configured.

Copy `.env.example` to a secret-managed `.env`, replace every placeholder, and keep mock/bootstrap switches false. Run `node --test server/governance/workflow.test.cjs` and `bash -n start.sh`. `start.sh` only starts already-installed code, refuses occupied ports, and stops only its child processes; installation, database creation, migration, and seed data are separate opt-in operations.
