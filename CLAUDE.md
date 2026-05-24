# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GrandNode2 is an open-source e-commerce platform built on ASP.NET Core 10 and MongoDB. It supports B2B/B2C, Multi-Store, Multi-Vendor, Multi-Tenant, Multi-Language, and Multi-Currency out of the box.

## Commands

### Build & Restore
```bash
dotnet restore GrandNode.sln
dotnet build GrandNode.sln --configuration Release
```

Plugins must be built separately before running the web project:
```bash
dotnet build src/Plugins/Authentication.Facebook
dotnet build src/Plugins/Payments.StripeCheckout
# ... repeat for each plugin in src/Plugins/
```

Publish the web project:
```bash
dotnet publish src/Web/Grand.Web -c Release -o ./build/release
```

### Frontend
```bash
cd src/Web/Grand.Web
npm install
npm run build
```

### Tests
Run all tests (CI runs each project individually):
```bash
dotnet test src/Tests/Grand.Business.Catalog.Tests/Grand.Business.Catalog.Tests.csproj
dotnet test src/Tests/Grand.Business.Checkout.Tests/Grand.Business.Checkout.Tests.csproj
dotnet test src/Tests/Grand.Business.Common.Tests/Grand.Business.Common.Tests.csproj
dotnet test src/Tests/Grand.Domain.Tests/Grand.Domain.Tests.csproj
dotnet test src/Tests/Grand.Infrastructure.Tests/Grand.Infrastructure.Tests.csproj
dotnet test src/Tests/Grand.Data.Tests/Grand.Data.Tests.csproj
# ... and so on for each test project under src/Tests/
```

Run a single test:
```bash
dotnet test src/Tests/Grand.Business.Catalog.Tests --filter "FullyQualifiedName~MyTestClass"
```

Integration tests require a running MongoDB instance:
```bash
docker run -d -p 27017:27017 mongo
```

### Run Locally
```bash
# Start MongoDB first
docker run -d -p 127.0.0.1:27017:27017 --name mongodb mongo

# Run via Docker (full stack)
docker run -d -p 80:8080 --name grandnode2 --link mongodb:mongo \
  -v grandnode_images:/app/wwwroot/assets/images \
  -v grandnode_appdata:/app/App_Data \
  grandnode/grandnode2
```

Or open `GrandNode.sln` in Visual Studio 2022+ and run `Grand.Web`.

## Architecture

### Solution Structure

The solution (`GrandNode.sln`) is organized into distinct layers:

**Core Layer** (`src/Core/`):
- `Grand.SharedKernel` — Shared interfaces, attributes, extensions, base types
- `Grand.Domain` — Entity models, domain events, aggregates (no external dependencies)
- `Grand.Infrastructure` — DI wiring, plugin/module loading, type search, startup pipeline (`StartupBase.cs` is the central entry point)
- `Grand.Data` — Repository abstraction (`IRepository<T>`), database provider selection, MongoDB/LiteDB/CosmosDB implementations
- `Grand.Mapping` — AutoMapper profiles

**Business Layer** (`src/Business/`):
- `Grand.Business.Core` — CQRS commands, queries, and event definitions shared across business projects
- Individual feature projects: `Grand.Business.Catalog`, `Grand.Business.Checkout`, `Grand.Business.Customers`, `Grand.Business.Authentication`, `Grand.Business.Marketing`, `Grand.Business.Cms`, `Grand.Business.Messages`, `Grand.Business.Storage`, `Grand.Business.Common`
- Each business project registers its own services, command handlers, and validators

**Web Layer** (`src/Web/`):
- `Grand.Web` — Entry point (`Program.cs`), delegates almost entirely to `StartupBase`
- `Grand.Web.Admin` — Administration panel controllers and models
- `Grand.Web.Store` — Customer-facing storefront controllers and models
- `Grand.Web.Vendor` — Vendor portal
- `Grand.Web.Common` — Shared middleware, filters, tag helpers, view components

**Modules** (`src/Modules/`): Loaded dynamically via feature flags
- `Grand.Module.Api` — REST API with OpenAPI/Scalar
- `Grand.Module.Installer` — First-run installation wizard
- `Grand.Module.Migration` — Database migration scripts
- `Grand.Module.ScheduledTasks` — Background job scheduler

**Plugins** (`src/Plugins/`): Loaded dynamically from disk at startup with shadow copying. Each plugin is a standalone project implementing a provider interface (e.g., `IPaymentProvider`, `IShippingRateProvider`).

**Aspire** (`src/Aspire/`): Service orchestration and cloud-native defaults (OpenTelemetry, health checks, service discovery).

### Key Patterns

**CQRS via MediatR**: Commands and queries are defined in `Grand.Business.Core/Commands/` and `Grand.Business.Core/Queries/`. Handlers live in the corresponding business project. Use `IMediator.Send()` to dispatch.

**Repository Pattern**: `IRepository<T>` in `Grand.Data` wraps MongoDB operations. Never use the database driver directly — always go through the repository. Supports LINQ queries, pagination, and MongoDB-specific operations.

**Dependency Injection**: Services self-register by implementing interfaces discovered by Scrutor. The `StartupBase.cs` orchestrates all DI registration across layers. Plugins and modules register their own services on load.

**Domain Model**: All entities extend `BaseEntity` (with `Id`, audit fields). MongoDB BSON serialization is used — no EF Core. Multi-tenancy is handled via `StoreId`, `VendorId`, etc. on entities. Translations and dynamic attributes use `UserFields` collection on most entities.

**Plugin Architecture**: Plugins are built to `Plugins/` output directory and loaded at runtime. Each plugin implements a marker interface and is auto-discovered. When modifying a plugin, rebuild that plugin project before running the web app.

### Configuration

Primary config: `src/Web/Grand.Web/App_Data/appsettings.json`

Key settings:
- `ConnectionStrings:Mongodb` — MongoDB connection string
- `Database:DbProvider` — `0`=MongoDB, `1`=LiteDB, `2`=CosmosDB
- `Cache:RedisCachingEnabled` / `Cache:RedisCachingConnectionString` — Redis for distributed cache
- `LiteDb:LiteDbConnectionString` — LiteDB path (default: `App_Data/database.db`)
- Feature management flags control which modules are active

### Centralized Package Versions

All NuGet package versions are managed in `Directory.Packages.props`. When adding a package reference to a `.csproj`, omit the version — it is resolved from the central props file.

Common shared MSBuild properties (target framework, nullable, implicit usings) are in `src/Build/Grand.Common.props`.

### Testing Approach

- Framework: MSTest + Moq (primary), NUnit in some projects
- Snapshot testing: Verify.MSTest
- Code coverage: coverlet
- Test project naming: `Grand.{Layer}.Tests` under `src/Tests/`
- MongoDB must be running for data-layer integration tests; business logic tests mock the repository
