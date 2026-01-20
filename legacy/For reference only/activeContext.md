# GeoGuessr Stats Dashboard - Active Context

## Current Focus

Maintaining the current application state and ensuring data consistency. The project architecture has been successfully consolidated to use MongoDB for all data storage, removing the dependency on Upstash KV.

## Recent Changes

*   **Architecture Simplification:** Migrated all duel and game metadata from Upstash KV to MongoDB. The application now uses a single database connection for both relational data and vector embeddings.
*   **Userscript Improvements:** Fixed synchronization issues caused by GeoGuessr API changes (pagination tokens) and aggressive rate limiting. Implemented batched processing and exponential backoff.
*   **New Feature:** Added "Country Confusion Matrix" to visualize gameplay mistakes.

## Next Steps

*   Monitor application performance with the new single-database architecture.
*   Explore additional analytics features based on the rich dataset now stored in MongoDB.
