# Branching Strategy

## Development Team Strategy (GitFlow Adapted)

### Main Branches
- **master**: Production-ready code, stable releases only
- **develop**: Integration branch for ongoing development and testing

### Supporting Branches
- **feature/{feature-name}**: New features or enhancements
  - Branch from: `develop`
  - Merge back to: `develop` 
  - Examples: `feature/cache-aside-implementation`, `feature/circuit-breaker-pattern`

- **hotfix/{fix-name}**: Critical production fixes
  - Branch from: `main`
  - Merge back to: `main` AND `develop`
  - Example: `hotfix/auth-vulnerability-fix`

- **bugfix/{bug-name}**: Non-critical development fixes
  - Branch from: `develop`
  - Merge back to: `develop`

### Development Workflow
1. `git checkout develop && git pull`
2. `git checkout -b feature/new-feature-name`
3. Implement changes with atomic commits
4. `git push origin feature/new-feature-name`
5. Create Pull Request to `develop`
6. Code review + automated CI/CD checks
7. Merge after approval
8. Deploy `develop` to staging automatically

## Operations Team Strategy

### Infrastructure Branches
- **infra**: All Infrastructure as Code changes
  - Terraform configurations
  - Kubernetes manifests  
  - Docker compose updates
  - Environment configurations

- **deploy/{env}**: Environment-specific overrides
  - `deploy/staging`: Staging-specific configs
  - `deploy/production`: Production-specific configs

### Operations Workflow
1. `git checkout infra`
2. Make infrastructure changes
3. `git push origin infra` → triggers infrastructure pipeline
4. Automated validation (terraform plan, k8s dry-run)
5. Manual approval required for apply/deploy
6. Changes applied to target infrastructure

## Branch Protection & Rules

- **master**: Requires PR review + passing CI + admin approval
- **develop**: Requires PR review + passing CI  
- **infra**: Requires ops team approval + infrastructure validation
- **feature/***: No restrictions, but CI must pass for PR

## Commit Message Convention