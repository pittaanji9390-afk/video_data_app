# Database Documentation

This directory manages PostgreSQL database artifacts, migrations, seed data, and schema definitions.

## Folder Overview

- `migrations/`: Contains sequential database migration files (DDL scripts for table creation, updates, and indexing).
- `seeds/`: Contains seed data files for local development and initial lookup data.
- `schema/`: Contains raw SQL schema definitions and entity relationship references.

## Database Guidelines

1. **No direct manual database modifications**: All changes must be made via version-controlled migration files in `migrations/`.
2. **Local PostgreSQL connection**: Configured via environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
3. **AWS RDS Compatibility**: Ensure SQL scripts adhere to standard PostgreSQL syntax compatible with AWS RDS PostgreSQL instances.
