# Bounded live evaluation

`npx tsx evals/run-live.ts` runs exactly two synthetic cases through the real Agents SDK path. It requires an explicitly configured `OPENAI_API_KEY`; the runner does not create or save one. Default model: `gpt-5.6-luna`, configurable with `OPENAI_MODEL`.

Each case inherits the three-turn/2,500-output-token limits and has a 60-second deadline. It checks a read-only evidence review and a draft that preserves unknown financial inputs. Results and token usage go to ignored `evals/results/latest.json`. This is a focused integration evaluation, not a comprehensive model-quality benchmark.

Ordinary `npm test` uses mocked providers and never incurs API charges. Do not run live evaluations in public CI or with confidential inputs.
