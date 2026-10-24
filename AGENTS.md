# Agent instructions

Read `ANTIGRAVITY_MASTER.md` before making changes. It is the source of truth for the full-stack implementation.

Most important rule: every AI feature in Kilari must use Gemma 4 through the single server-side AI gateway. Never call an AI provider directly from the browser and never substitute another generative model.

Preserve the existing Kilari frontend design and user flows while replacing simulated backend behavior with real typed APIs, deterministic business rules, and provider adapters.
