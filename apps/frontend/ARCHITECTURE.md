# Frontend Architecture Conventions

## Layering

- `app` and `components` can import from `hooks`, `stores`, `domain`, `types`, `utils`.
- `hooks` can import from `stores`, `domain`, `types`, `utils`.
- `stores` can import from `domain`, `types`, `constants`.
- `domain` can import from `types` and low-level constants only.
- `stores` and `domain` must not import from `components`.

## Naming

- React component files use PascalCase (`PedestrianStatsPanel.tsx`).
- Non-component files use camelCase (`filterSort.ts`, `mapDisplay.ts`).
- Constants use UPPER_SNAKE_CASE.
- Shared domain types live in `src/types`.

## Ownership Rules

- Domain rules reused across multiple features live in `src/domain/pedestrians`.
- Feature-specific UI constants stay inside the feature folder.
- Types used by multiple layers (`components`, `stores`, `hooks`) belong to `src/types`.
- Avoid duplicate implementations of the same business rule in multiple folders.

## File Size Guidance

- Prefer files up to ~150 lines for maintainability.
- Split by responsibility when a file starts to mix independent concerns.
- Keep store wiring separate from pure derivation logic.
