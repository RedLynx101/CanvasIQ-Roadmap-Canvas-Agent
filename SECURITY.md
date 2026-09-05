# Security and data boundaries

CanvasIQ is a browser-local planning application. It does not provide organizational accounts, tenancy, encrypted project storage or a confidential public-demo environment. Do not enter sensitive information into a public deployment.

The optional AI route sends active planning context and recent messages to OpenAI only after explicit consent. It requires a deployment access code, validates schemas and byte limits, bounds execution and uses a durable admission counter. Access codes are not a substitute for real multi-user authentication. See [deployment requirements](docs/deployment.md) before enabling AI.

Imports are validated and rendered as text. The assistant has no file, shell, browsing or workflow-execution tools. Proposals require explicit acceptance and cannot silently overwrite a changed project. Model output is untrusted even when it has valid structure.

Report a suspected vulnerability through GitHub's private vulnerability reporting feature if available. If it is unavailable, open an issue asking for a private reporting channel without including exploit details, credentials or user data. Avoid putting sensitive reports in public issues.

Dependency advisories are checked in CI. Local validation and automated accessibility/security checks do not establish that every vulnerability has been found.
