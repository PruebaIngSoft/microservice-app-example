# Estrategia de Ramas

## Desarrollo
- `master`: código estable para producción.
- `develop`: integración continua de nuevas funciones.
- `feature/*`: ramas para nuevas funcionalidades (ejemplo: `feature/login`).

## Operaciones
- `infra`: infraestructura como código (Docker, Kubernetes).
- `ci-cd`: configuración de pipelines.

## Flujo de trabajo
1. Los desarrolladores crean ramas `feature/*` desde `develop`.
2. Cuando terminan, hacen *merge* a `develop`.
3. Solo versiones estables pasan de `develop` a `master`.
4. Los cambios de infraestructura van a `infra`.
