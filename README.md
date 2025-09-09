# TheTimeVortex —  Website 🌌

[![Status](https://img.shields.io/badge/deploy-automated-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A fast, static hub for our creator group.

One banner. Many styles.

## Local D1 development

Use the provided `wrangler.local.toml` to connect your local `wrangler` to the
remote D1 database. Run dev mode with:

```bash
wrangler dev --config wrangler.local.toml --remote
```

This loads the production-like database using the `preview_database_id` field.