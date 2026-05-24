# AGENTS.md

GrandNode2 is an open-source e-commerce platform built on ASP.NET Core 10 and MongoDB. It supports B2B/B2C, Multi-Store, Multi-Vendor, Multi-Tenant, Multi-Language, and Multi-Currency out of the box.

## Key Commands

```bash
# Build
dotnet restore GrandNode.sln
dotnet build GrandNode.sln --configuration Release

# Test (run per project — repeat for each project under src/Tests/)
dotnet test src/Tests/Grand.Business.Catalog.Tests/Grand.Business.Catalog.Tests.csproj
dotnet test src/Tests/Grand.Business.Checkout.Tests/Grand.Business.Checkout.Tests.csproj
# ... and so on for Grand.Business.Authentication.Tests, Grand.Business.Cms.Tests,
# Grand.Business.Common.Tests, Grand.Business.Customers.Tests, Grand.Business.Marketing.Tests,
# Grand.Business.Messages.Tests, Grand.Business.Storage.Tests, Grand.Data.Tests,
# Grand.Domain.Tests, Grand.Infrastructure.Tests, Grand.SharedKernel.Tests, Grand.Web.Admin.Tests,
# Grand.Web.Common.Tests, Grand.Modules.Tests

# Run single test
dotnet test src/Tests/Grand.Business.Catalog.Tests --filter "FullyQualifiedName~MyTestClass"

# Frontend
cd src/Web/Grand.Web && npm install && npm run build

# Start MongoDB (required for integration tests and local run)
docker run -d -p 127.0.0.1:27017:27017 --name mongodb mongo
```

## For Claude Code Users

See **CLAUDE.md** for the full architecture reference: layers, patterns, CQRS, repository, plugin system, and configuration.

## Docs

| Path | Contents |
|------|----------|
| `docs/adr/` | Architecture Decision Records — why things were built the way they were |
| `docs/superpowers/specs/` | AI-generated feature design specs (Superpowers brainstorming output) |
| `docs/superpowers/plans/` | AI-generated implementation plans (Superpowers writing-plans output) |

## Branch & PR Convention

- All PRs target `ai-test/develop` on `vladyslavavramchuk/grandnode2`
- Commit messages: short one-liner, imperative form (`Add X`, `Fix Y`, `Update Z`)
