# Reactivities -- Quantified Project Metrics

Use these numbers to strengthen resume and portfolio bullet points.

---

## Backend Metrics

| Metric | Count |
|---|---|
| .NET projects in solution | 5 (API, Application, Domain, Infrastructure, Persistence) |
| Domain entities | 6 (User, Activity, ActivityAttendee, Comment, Photo, UserFollowing) |
| Database tables | 12 (6 custom + 6 ASP.NET Identity tables) |
| Custom API endpoints | 21 across 4 controllers |
| Identity-provided endpoints | ~10 (login, register, confirmEmail, forgotPassword, resetPassword, etc.) |
| MediatR command handlers | 10 (create, edit, delete activity; attendance; comment; photo add/delete/setMain; profile edit; follow toggle) |
| MediatR query handlers | 7 (activity list, activity details, comments, profile, profile photos, followings, user activities) |
| Total MediatR handlers | 17 |
| AutoMapper mapping profiles | 8 entity-to-DTO mappings in a single configuration class |
| FluentValidation validators | 4 (CreateActivity, EditActivity, BaseActivity, EditProfile) |
| DTOs | 12 (5 Activity DTOs, 4 Profile DTOs, 3 Account DTOs) |
| External service integrations | 3 (Cloudinary, Resend email, GitHub OAuth) |
| Custom authorization policies | 1 (IsActivityHost -- host-only edit/delete enforcement) |
| SignalR hubs | 1 (real-time comment system) |
| Seed data records | 10 activities + 3 users |
| NuGet packages | 7 (EF Core + SqlServer, MediatR, AutoMapper, FluentValidation, CloudinaryDotNet, Resend, Identity) |

## Frontend Metrics

| Metric | Count |
|---|---|
| React components/pages | ~50 across 6 feature modules |
| Feature modules | 6 (activities, profiles, account, home, errors, counter) |
| Custom React hooks | 5 (useActivities, useAccount, useComments, useProfile, useStore) |
| Zod validation schemas | 6 (activity, login, register, changePassword, resetPassword, editProfile) |
| Shared/reusable UI components | 11 (TextInput, SelectInput, DateTimeInput, LocationInput, MapComponent, PhotoUploadWidget, AvatarPopover, DeleteButton, StarButton, StyledButton, MenuItemLink) |
| npm production dependencies | 24 |
| npm dev dependencies | 16 |

## Resume-Ready Bullet Points

Below are weak-to-strong rewrites using the actual counted numbers.

### API and Architecture

| Weak | Strong |
|---|---|
| Built scalable RESTful APIs using .NET | Built a 21-endpoint REST API serving 6 entity types across 5 Clean Architecture projects in .NET 10 |
| Used CQRS and MediatR for business logic | Implemented 17 MediatR CQRS handlers (10 commands, 7 queries) with a FluentValidation pipeline to enforce input validation before handler execution |
| Implemented real-time features | Engineered a real-time comment system over SignalR WebSockets, broadcasting messages to activity-scoped groups |
| Used Entity Framework for data access | Configured Entity Framework Core against SQL Server with 12 tables, composite keys, cascade rules, and a global UTC DateTime converter |

### Authentication and Security

| Weak | Strong |
|---|---|
| Implemented authentication | Secured 21 endpoints behind cookie-based ASP.NET Core Identity auth with a custom IsActivityHost authorization policy for host-only mutations |
| Added social login | Integrated GitHub OAuth with a 4-step server-side flow (code exchange, token retrieval, profile fetch, account upsert) |
| Added email verification | Implemented email confirmation using the Resend API with base64-encoded token links |

### Frontend

| Weak | Strong |
|---|---|
| Built a React frontend | Built a 50-component React 19 SPA across 6 feature modules using TypeScript, MUI, and Vite |
| Managed state and data fetching | Managed server state with TanStack React Query (5 custom hooks) and client state with MobX, with cursor-based infinite scroll pagination |
| Added form validation | Validated 6 form flows using React Hook Form + Zod schemas with real-time error feedback |
| Integrated maps | Integrated Leaflet maps with location autocomplete for activity creation, storing latitude/longitude coordinates |

### External Services

| Weak | Strong |
|---|---|
| Used cloud storage for images | Integrated Cloudinary for photo upload, storage, and deletion across 3 profile photo endpoints |
| Used Docker for development | Containerized SQL Server 2022 via Docker Compose with persistent volume mounting for local development |
