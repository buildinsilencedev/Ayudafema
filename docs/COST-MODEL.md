# Cost model — Ayudafema.org

Estimates as of April 2026. Update before each major milestone.

## Variables

- `N` = cases/month
- Average tokens per OCR call: ~800 input (image), ~200 output
- Average tokens per draft call: ~2,000 input, ~1,200 output
- Average SMS per case: ~3 (T-30 + T-7 + confirmation)

## Compute costs by volume

### 100 cases/month (~3/day)

| Service         | Usage               | Cost       |
|-----------------|---------------------|------------|
| Supabase Free   | 500MB DB, 1GB storage | $0       |
| Cloudflare Pages| Unlimited deploys   | $0         |
| OpenRouter (Haiku OCR) | 100 × 1K tokens | ~$0.25 |
| OpenRouter (Sonnet draft) | 100 × 3.2K tok | ~$5 |
| Twilio SMS      | 300 msgs × $0.0075  | ~$2.25     |
| Railway (n8n)   | Hobby plan          | $5         |
| **Total**       |                     | **~$13/mo**|

### 1,000 cases/month (~33/day)

| Service         | Usage               | Cost       |
|-----------------|---------------------|------------|
| Supabase Pro    | 8GB DB, 100GB storage | $25      |
| Cloudflare Pages| Same                | $0         |
| OpenRouter (Haiku OCR) | 1K × 1K tok | ~$2.50 |
| OpenRouter (Sonnet draft) | 1K × 3.2K | ~$50  |
| Twilio SMS      | 3K msgs             | ~$22.50    |
| Railway (n8n)   | Pro                 | $20        |
| **Total**       |                     | **~$120/mo**|

### 10,000 cases/month (~330/day)

| Service         | Usage               | Cost       |
|-----------------|---------------------|------------|
| Supabase Team   | 64GB DB, 1TB storage | $599      |
| Cloudflare Pages| Same                | $0         |
| OpenRouter (Haiku OCR) | 10K × 1K tok | ~$25 |
| OpenRouter (Sonnet draft) | 8K × 3.2K (20% Opus) | ~$600 |
| OpenRouter (Opus draft, 2K complex) | 2K × 3.2K | ~$300 |
| Twilio SMS      | 30K msgs            | ~$225      |
| Railway (n8n)   | Pro                 | $100       |
| **Total**       |                     | **~$1,850/mo**|

## Notes

- OCR model costs assume all cases upload an image. ~30% may use ManualEntry (no OCR cost).
- Draft costs assume one draft per case. Re-drafts (attorney requests changes) increase by ~25%.
- Opus is ~10× more expensive than Sonnet. Keep `pickModel()` conservative to control costs.
- Embedding costs (ingest-corpus.ts) are one-time: ~$0.01 for initial corpus, ~$0.001/refresh.
- Better Stack + Sentry add ~$30/mo at scale (included in Team plans for small volumes).

## Cost control levers

1. Tune `CONF_THRESHOLD` in parseDenialLetter — higher threshold → more ManualEntry → less OCR re-runs.
2. Tune `pickModel()` — move threshold for Opus to `prior_appeal_count > 1` instead of `> 0`.
3. Cache common RAG results (most cases are code 120 with similar context).
4. Add a Haiku draft path for clearly standard cases as a fast-track option.
