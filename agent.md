# agent.md — core-payments

## 1. Propósito y Stack

Backend de pagos construido con **NestJS 12**, **TypeScript strict**, **pnpm**, **vitest** y **ESLint**.
Persistencia: **Postgres** + **Prisma ORM** (wired via `PrismaService`/`PrismaModule`; ver `infrastructure/postgres/`).

## 2. Arquitectura Hexagonal Global

Las capas viven en la raíz de `src/`:

```
src/
├── application/          # núcleo hexagonal — TS puro, sin Nest ni ORM
│   ├── domain/           # entidades, VOs, errores, Result<T,E>
│   │   ├── shared/       # primitivas reutilizables
│   │   └── <feature>/    # elementos de cada feature
│   ├── ports/            # interfaces (contratos)
│   │   ├── use-cases/    # puertos de entrada (driving)
│   │   └── repositories/ # puertos de salida (driven)
│   └── use-cases/        # implementación de casos de uso (ROP)
├── infrastructure/       # adaptadores de salida (driven)
│   └── postgres/
│       └── repositories/ # implementan ports/repositories
└── presentation/         # adaptadores de entrada (driving) + wiring Nest
    ├── controllers/      # HTTP controllers + DTOs + result-to-http
    │   └── dtos/
    └── modules/          # wiring DI (tokens → useFactory)
```

### Regla de dependencia

```
presentation → application ← infrastructure
```

- **Domain** no depende de nada (ni Nest, ni ORM, ni use-cases, ni ports, ni infrastructure, ni presentation).
- **Use cases** dependen de domain y ports. No dependen de Nest, infrastructure ni presentation.
- **Infrastructure** depende de application (ports) y librerías externas. No depende de presentation.
- **Presentation** depende de application (ports, use-cases) y Nest. Orquesta todo.

Estas reglas se enforcean con ESLint `no-restricted-imports` (ver `eslint.config.mjs`).

## 3. Puertos y Adaptadores

- **Puertos de entrada** (`ports/use-cases/`): interfaces que definen los casos de uso. Cada una tiene un `Symbol` como token de inyección.
  - Ej: `UseCase<I, O, E>`, `CheckHealthUseCasePort`, `CHECK_HEALTH_USE_CASE`.
- **Puertos de salida** (`ports/repositories/`): interfaces de repositorio + tokens `Symbol`.
  - Ej: `PaymentRepositoryPort`, `PAYMENT_REPOSITORY`.
- **Adaptadores de salida** (`infrastructure/postgres/repositories/`): implementan los puertos de salida. Entidades ORM y mappers viven aquí.
- **Adaptadores de entrada** (`presentation/controllers/`): HTTP controllers + DTOs.
- **Wiring** (`presentation/modules/`): solo aquí se usa Nest DI. Los use cases se registran con `useFactory`.

## 4. ROP en Casos de Uso

- `execute()` retorna `ResultAsync<O, E>`.
- **Prohibido lanzar excepciones** desde un use case.
- Errores esperados = `DomainError` tipados (unión discriminada por `code`).
- Excepciones de infra se capturan en el repositorio con `ResultAsync.fromPromise(p, mapError)` y se convierten a `Err`.
- Flujo lineal: `validate → andThen → map`, sin `if (isErr) return`.
- El controller hace `match` vía `result-to-http` para mapear `Err(DomainError)` → `HttpException`.

```typescript
// Patrón típico de use case:
execute(input: Input): ResultAsync<Output, DomainError> {
  return validateInput(input)           // Result<Input, DomainError>
    .andThen((valid) => repo.save(valid)) // ResultAsync<Saved, DomainError>
    .map((saved) => toOutput(saved));     // ResultAsync<Output, DomainError>
}
```

## 5. Dominio

- Entidades con factory `create()` que retorna `Result<Entity, DomainError>`.
- Value Objects inmutables, sin setters públicos.
- Igualdad: entidades por `id`, VOs por `props`.

## 6. Persistencia

- Solo los puertos viven en `application/ports/repositories/`.
- Entidades ORM y mappers viven en `infrastructure/postgres/`.
- El dominio no conoce la persistencia.

## 7. Convenciones

- **kebab-case** en archivos y directorios.
- Sufijos obligatorios:
  - `.use-case.ts` — casos de uso
  - `.port.ts` — interfaces de puerto
  - `.repository.ts` — implementaciones de repositorio
  - `.module.ts` — módulos de Nest
  - `.vo.ts` — value objects
  - `.spec.ts` — tests unitarios
  - `.e2e-spec.ts` — tests e2e
- DTOs solo en `presentation/controllers/dtos/`.
- **Nunca exponer entidades de dominio** en respuestas HTTP; mapear a DTOs.
- Path aliases: `@application/*`, `@infrastructure/*`, `@presentation/*`.

## 8. Testing

- **Unit de use cases**: con puertos fake (sin Nest), asertar sobre `Result` (isOk/isErr, value/error).
- **E2e**: `supertest` contra la app Nest montada con `Test.createTestingModule`.
- Comandos: `pnpm test` (unit), `pnpm test:e2e` (e2e), `pnpm lint` (ESLint), `pnpm build`.

## 9. Checklist para Nuevo Feature

1. `src/application/domain/<feature>/` — entidades, VOs, errores.
2. `src/application/ports/use-cases/<feature>.use-case.port.ts` — interfaz + `Symbol`.
3. `src/application/ports/repositories/<feature>.repository.port.ts` — interfaz + `Symbol` (si necesita persistencia).
4. `src/application/use-cases/<feature>/<feature>.use-case.ts` — implementación.
5. `src/application/use-cases/<feature>/<feature>.use-case.spec.ts` — test unit.
6. `src/infrastructure/postgres/repositories/<feature>.repository.ts` — implementación del repo (si aplica).
7. `src/presentation/controllers/<feature>.controller.ts` — controller + DTOs.
8. `src/presentation/modules/<feature>.module.ts` — wiring DI.
9. `test/<feature>.e2e-spec.ts` — test e2e.
10. Registrar el módulo en `app.module.ts`.

## 10. No Hacer

- ❌ Importar `@nestjs/*` en `application/`.
- ❌ Importar `@infrastructure/*` o `@presentation/*` en `application/`.
- ❌ Importar use-cases o ports desde `domain/`.
- ❌ Lanzar excepciones desde un use case (usar `err()` / `errAsync()`).
- ❌ Usar `if (isErr) return` en un use case (usar `andThen` / `map`).
- ❌ Exponer entidades de dominio en respuestas HTTP.
- ❌ Usar `@Injectable()` en use cases o repositorios (se registran con `useFactory` / tokens).
- ❌ Crear ORM entities en `domain/` (van en `infrastructure/`).

## 11. Flujo de Git (rama → commits → PR)

- `main` = producción; `develop` = integración. ❌ Nunca commitear directo a `main` ni `develop`; todo cambio va por PR.
- Ramas desde `develop` actualizada: `feat/<desc>`, `fix/<desc>`, `chore/<desc>`, `docs/<desc>`.
- Commits convencionales: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
  — imperativo, minúscula, sin punto final. Ej: `feat: add payment model`.
- Commits atómicos: un propósito por commit.

Flujo:
1. `git checkout develop && git pull`
2. `git checkout -b feat/<desc>`
3. Commits atómicos
4. `git push -u origin feat/<desc>`
5. `gh pr create --base develop --title "<tipo>: <desc>" --body "<qué/cómo/verificación>"`
6. `gh pr checks` → `gh pr merge --squash --delete-branch`

Útil: `gh pr list`, `gh pr view --web`, `gh pr checkout <n>`, `gh pr edit`.
