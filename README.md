# Reactivities

A full-stack social activities platform built with .NET 10 and React 19. Users can create, browse, and join activities, follow other users, upload photos, and participate in real-time chat threads attached to each activity.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Domain Model](#domain-model)
- [Backend Details](#backend-details)
- [Frontend Details](#frontend-details)
- [Authentication and Authorization](#authentication-and-authorization)
- [Real-Time Communication](#real-time-communication)
- [External Services](#external-services)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)

---

## Overview

Reactivities is a social platform where authenticated users can organize and attend activities. Each activity has a host, a date, a location (with latitude/longitude for map display), and a category. Users can join or leave activities, comment on them in real time via WebSockets, upload profile photos, edit their profiles, and follow/unfollow other users. The application supports cursor-based pagination, activity filtering (by date, hosting status, and attendance), and email verification.

---

## Architecture

The backend follows **Clean Architecture** (also known as Onion Architecture), which enforces a strict separation of concerns through concentric dependency layers. The innermost layer (Domain) has zero external dependencies, and each outer layer depends only on the layers inside it.

```
API  -->  Application  -->  Domain
 |            |
 +---> Infrastructure
 +---> Persistence
```

**Dependency flow:**

- **Domain** -- The core. Contains entity definitions only. No dependencies on any other project.
- **Persistence** -- Depends on Domain. Contains the EF Core DbContext, migrations, and seed data.
- **Application** -- Depends on Domain and Persistence. Contains all business logic organized as MediatR commands and queries (CQRS pattern), DTOs, validators, and mapping profiles.
- **Infrastructure** -- Depends on Application. Contains implementations of interfaces defined in the Application layer (photo uploads, email sending, security handlers).
- **API** -- The outermost layer. Depends on Application and Infrastructure. Contains controllers, middleware, SignalR hubs, and the application entry point.

### Key Patterns Used

- **CQRS (Command Query Responsibility Segregation)** -- All business operations are split into Commands (write) and Queries (read), each handled by a dedicated MediatR handler class.
- **Mediator Pattern (MediatR)** -- Controllers never contain business logic. They dispatch requests to MediatR, which routes them to the appropriate handler in the Application layer. This keeps controllers thin.
- **Result Pattern** -- Handlers return a generic `Result<T>` object instead of throwing exceptions for expected failures. The base controller maps result codes (success, 404, error) to appropriate HTTP status codes.
- **Repository-less approach** -- EF Core's DbContext is injected directly into handlers rather than using a repository abstraction, keeping things simple while still benefiting from EF Core's unit-of-work pattern.
- **Validation Pipeline** -- FluentValidation validators are wired into the MediatR pipeline via a `ValidationBehaviour<TRequest, TResponse>`, so every command/query is validated before reaching its handler.
- **AutoMapper** -- Used to map between domain entities and DTOs, preventing circular reference issues and controlling exactly which data crosses the API boundary.

---

## Technology Stack

### Backend

| Technology | Purpose |
|---|---|
| .NET 10 | Runtime and web framework |
| ASP.NET Core Identity | User registration, login, password management, email confirmation |
| Entity Framework Core 10 | ORM for database access and migrations |
| SQL Server 2022 | Relational database (runs via Docker) |
| MediatR 12.5 | Mediator/CQRS implementation |
| AutoMapper 16 | Object-to-object mapping between entities and DTOs |
| FluentValidation 12 | Declarative request validation |
| SignalR | Real-time WebSocket communication for the comment system |
| CloudinaryDotNet 1.29 | Cloud-based image upload and storage |
| Resend 0.5 | Transactional email delivery for email confirmation |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI library |
| TypeScript 6 | Static typing |
| Vite 8 | Build tool and dev server |
| MUI (Material UI) 9 | Component library and design system |
| TanStack React Query 5 | Server state management, caching, and data fetching |
| MobX 6 | Client-side state management (UI state, counters) |
| React Router 8 | Client-side routing |
| React Hook Form 7 + Zod 4 | Form state management and schema-based validation |
| Axios | HTTP client with interceptors for error handling |
| SignalR Client 10 | WebSocket client for real-time comments |
| Leaflet + React Leaflet 5 | Interactive maps for activity locations |
| React Cropper | Image cropping before upload |
| React Dropzone | Drag-and-drop photo upload |
| date-fns 4 | Date formatting and manipulation |
| React Toastify | Toast notifications |
| React Calendar | Calendar widget for activity filtering |
| React Intersection Observer | Infinite scroll / lazy loading |

### DevOps and Tooling

| Technology | Purpose |
|---|---|
| Docker Compose | Runs SQL Server 2022 in a container for local development |
| ESLint 10 | Linting |
| Babel + React Compiler | Optimized React compilation |
| vite-plugin-mkcert | Local HTTPS certificates for development |

---

## Domain Model

The system has six core entities:

- **User** -- Extends ASP.NET Core `IdentityUser`. Holds display name, bio, image URL, and navigation properties to photos, activities, followers, and followings.
- **Activity** -- Represents an event with title, description, date, category, city, venue, and geographic coordinates. Has an index on the Date column for efficient querying.
- **ActivityAttendee** -- Join table between User and Activity. Uses a composite key (UserId + ActivityId). Contains an `IsHost` flag to identify the activity creator and a `DateJoined` timestamp.
- **Comment** -- Belongs to both a User and an Activity. Contains a text body and a creation timestamp. Used in the real-time chat system.
- **Photo** -- Belongs to a User. Stores the Cloudinary URL and public ID. Cascade-deletes when the owning user is deleted.
- **UserFollowing** -- Self-referencing many-to-many join table on User. Uses a composite key (ObserverId + TargetId). Observer is the follower, Target is the user being followed.

### Entity Relationships

```
User 1---* ActivityAttendee *---1 Activity
User 1---* Photo
User 1---* Comment *---1 Activity
User 1---* UserFollowing (as Observer/Follower)
User 1---* UserFollowing (as Target/Followee)
```

---

## Backend Details

### API Layer

The API project is the entry point (`Program.cs`). It registers all services, configures middleware, and seeds the database on startup.

**Controllers:**

- `BaseApiController` -- Abstract base. Provides access to the MediatR instance via service locator and a `HandleResults<T>` method that maps `Result<T>` to HTTP responses (200, 400, 404).
- `ActivitiesController` -- CRUD for activities plus an attendance toggle endpoint. Edit and delete are protected by the `IsActivityHost` authorization policy.
- `AccountController` -- Registration, login (cookie-based), logout, user info retrieval, password change, email confirmation resend, and GitHub OAuth login.
- `ProfilesController` -- Photo management (add, delete, set main), profile viewing and editing, follow/unfollow toggle, follower/following lists, and user activity history.
- `BuggyController` -- Intentional error endpoints for testing the exception middleware.
- `FallbackController` -- Serves the React SPA's `index.html` for any route not matched by the API.

**Middleware:**

- `ExceptionMiddleware` -- Global exception handler at the top of the pipeline. Catches unhandled exceptions, logs them, and returns standardized JSON error responses with stack traces in development mode.

**SignalR:**

- `CommentHub` -- WebSocket hub mapped to `/comments`. Clients join a group by activity ID on connection and receive existing comments. The `SendComment` method dispatches through MediatR and broadcasts the new comment to all group members.

### Application Layer

Organized by feature (Activities, Profiles), each containing:

- `Commands/` -- Write operations (CreateActivity, EditActivity, DeleteActivity, UpdateAttendance, AddComment, AddPhoto, DeletePhoto, SetMainPhoto, EditProfile, FollowToggle)
- `Queries/` -- Read operations (GetActivityList, GetActivityDetails, GetComments, GetProfile, GetProfilePhotos, GetFollowings, GetUserActivities)
- `DTOs/` -- Data transfer objects that control the shape of data sent to and from the API
- `Validators/` -- FluentValidation rules for commands

**Cross-cutting concerns in `Core/`:**

- `Result<T>` -- Generic result wrapper with success/failure factory methods
- `MappingProfiles` -- AutoMapper configuration for all entity-to-DTO mappings
- `PagedList` -- Generic paginated list with cursor-based pagination
- `PaginationParams` -- Base class for pagination query parameters
- `AppException` -- Standardized exception DTO
- `ValidationBehaviour<TRequest, TResponse>` -- MediatR pipeline behavior that runs FluentValidation before handler execution

### Persistence Layer

- `AppDbContext` -- Inherits from `IdentityDbContext<User>`. Configures composite keys for ActivityAttendee and UserFollowing, cascade delete rules, and a global DateTime-to-UTC value converter for all DateTime properties.
- `DbInitializer` -- Seeds the database with test users and sample activities on startup.
- `Migrations/` -- EF Core migration history.

### Infrastructure Layer

- `Security/IsHostRequirement` -- Custom authorization handler that checks whether the current user is the host of the activity being modified. Reads the activity ID from the route.
- `Security/UserAccessor` -- Extracts the current user's ID from the ClaimsPrincipal (HTTP context).
- `Photos/PhotoService` -- Implements `IPhotoService`. Uploads images to Cloudinary and returns the URL and public ID. Handles deletion by public ID.
- `Photos/CloudinarySettings` -- Configuration POCO bound to the `CloudinarySettings` section in appsettings.
- `Email/EmailSender` -- Implements `IEmailSender<User>` using the Resend API to send email confirmation links.

---

## Frontend Details

The React client is a Vite-based SPA using TypeScript and Material UI.

### Application Shell (`src/app/`)

- `layout/App.tsx` -- Root component. Sets up the MUI theme, toast container, and renders the router outlet with the NavBar.
- `layout/NavBar.tsx` -- Top navigation bar with links to activities and the create-activity form.
- `layout/UserMenu.tsx` -- Authenticated user dropdown with profile link, settings, and logout.
- `router/Routes.tsx` -- All route definitions using React Router 8.
- `router/RequireAuth.tsx` -- Route guard that redirects unauthenticated users.
- `shared/components/` -- Reusable UI components: TextInput, SelectInput, DateTimeInput, LocationInput (with autocomplete), MapComponent (Leaflet), PhotoUploadWidget (dropzone + cropper), AvatarPopover, DeleteButton, StarButton, StyledButton, MenuItemLink.

### Feature Modules (`src/features/`)

- `activities/dashboard/` -- Activity list with infinite scroll, date-grouped sections, filter sidebar (all activities, going, hosting, date range via calendar).
- `activities/details/` -- Activity detail page with header image, info panel, attendee sidebar with avatar popovers, and a real-time comment chat section.
- `activities/form/` -- Create/edit activity form with Zod validation, date picker, category dropdown, and a Leaflet-based location picker.
- `profiles/` -- User profile page with tabbed content: About (bio), Photos (gallery with upload, crop, set-main, delete), Activities (past, future, hosting), and Followers/Following lists with profile cards.
- `account/` -- Login form (with GitHub OAuth), registration, email verification, password reset, forgot password, and change password forms.
- `home/` -- Landing page.
- `errors/` -- NotFound (404), ServerError (500), and TestErrors (development error testing) pages.
- `counter/` -- MobX demo counter (for learning purposes).

### Library Layer (`src/lib/`)

- `api/agent.ts` -- Axios instance with base URL, cookie credentials, request/response interceptors, and centralized error handling (401 redirects, toast notifications for 400/500 errors).
- `hooks/useActivities.ts` -- TanStack Query hooks for activity CRUD, attendance, and infinite-scrolled list with cursor-based pagination.
- `hooks/useAccount.ts` -- TanStack Query hooks for login, register, logout, user info, GitHub OAuth, email verification, and password management.
- `hooks/useComments.ts` -- SignalR connection management. Establishes a persistent WebSocket connection to the CommentHub, receives real-time comments, and mutates the React Query cache.
- `hooks/useProfile.ts` -- TanStack Query hooks for profile data, photos, follow/unfollow, and user activities.
- `hooks/useStore.ts` -- MobX store access hook.
- `stores/` -- MobX stores for client-only UI state (activityStore, uiStore, counterStore) and root store composition.
- `schemas/` -- Zod validation schemas for activities, login, registration, password changes, profile edits, and password resets.
- `types/index.d.ts` -- TypeScript type definitions for Activity, Profile, Photo, Comment, User, Pagination, and related interfaces.
- `util/util.ts` -- Utility functions.

---

## Authentication and Authorization

### Authentication

The application uses **ASP.NET Core Identity** with **cookie-based authentication**. When a user logs in, the server issues an HttpOnly cookie that the browser automatically sends with every subsequent request. JavaScript cannot access this cookie, which protects against XSS-based token theft.

An `AllowAnonymous` endpoint (`GET /api/account/user-info`) lets the React client check authentication status on page load or refresh. If the cookie is valid, it returns user data; otherwise, it returns 204 No Content.

**GitHub OAuth** is also supported. The flow exchanges a GitHub authorization code for an access token, fetches the user's GitHub profile and email, creates a local user account if one does not exist, and signs them in.

**Email confirmation** is implemented using the Resend API. On registration, a confirmation link is emailed to the user with a base64-encoded token.

### Authorization

- All endpoints require authentication by default (a global `AuthorizeFilter` is applied to all controllers).
- The `IsActivityHost` custom authorization policy restricts edit and delete operations on activities to only the user who created (hosts) the activity. This is enforced by a custom `IAuthorizationHandler` that queries the ActivityAttendee join table.

---

## Real-Time Communication

The comment system uses **SignalR** (WebSockets). When a user navigates to an activity detail page, the React client opens a persistent WebSocket connection to the `/comments` hub, passing the activity ID as a query parameter.

- **On connection:** The server adds the client to a SignalR group named after the activity ID and sends all existing comments for that activity (`LoadComments`).
- **Sending a comment:** The client invokes the `SendComment` hub method, which dispatches through MediatR to persist the comment, then broadcasts it to all clients in the activity's group (`ReceiveComment`).
- **Client-side caching:** Incoming comments are pushed directly into the TanStack Query cache, so the UI updates instantly without a refetch.

---

## External Services

### Cloudinary

Used for all photo storage. When a user uploads a profile photo, the image is sent to the API as a multipart form upload, which then streams it to Cloudinary. The returned URL and public ID are stored in the database. Deletion removes the image from both Cloudinary and the database.

Configuration is stored in `appsettings.json` under the `CloudinarySettings` section (CloudName, ApiKey, ApiSecret).

### Resend

Used for transactional emails (email confirmation links). The API token is stored in configuration under `Resend:ApiToken`. The email sender is registered as a transient service implementing `IEmailSender<User>`.

### SQL Server

The database runs as a Docker container (SQL Server 2022) via the included `docker-compose.yml`. Connection retry logic is configured with up to 5 retries and a 10-second delay between attempts.

---

## Project Structure

```
Reactivities/
|-- Reactivities.slnx                 # Solution file referencing all .NET projects
|-- docker-compose.yml                # SQL Server 2022 container definition
|-- .gitignore
|
|-- API/                              # ASP.NET Core Web API (entry point)
|   |-- Program.cs                    # Application bootstrap, service registration, middleware
|   |-- API.csproj
|   |-- appsettings.json              # Production configuration
|   |-- appsettings.Development.json  # Development configuration
|   |-- Controllers/
|   |   |-- BaseApiController.cs      # Abstract base with MediatR + result handling
|   |   |-- AccountController.cs      # Auth: register, login, logout, GitHub OAuth
|   |   |-- ActivitiesController.cs   # Activity CRUD + attendance
|   |   |-- ProfilesController.cs     # Photos, profile, follow, user activities
|   |   |-- BuggyController.cs        # Intentional error endpoints for testing
|   |   |-- FallbackController.cs     # SPA fallback (serves index.html)
|   |   +-- WeatherForecastController.cs
|   |-- DTOs/
|   |   |-- RegisterDto.cs
|   |   |-- ChangePasswordDto.cs
|   |   +-- GitHubInfo.cs             # GitHub OAuth request/response models
|   |-- Middleware/
|   |   +-- ExceptionMiddleware.cs    # Global exception handler
|   |-- SignalR/
|   |   +-- CommentHub.cs            # Real-time comment WebSocket hub
|   +-- wwwroot/                      # Published React build output
|
|-- Application/                      # Business logic layer (CQRS handlers)
|   |-- Application.csproj
|   |-- Activities/
|   |   |-- Commands/
|   |   |   |-- CreateActivity.cs
|   |   |   |-- EditActivity.cs
|   |   |   |-- DeleteActivity.cs
|   |   |   |-- UpdateAttendance.cs
|   |   |   +-- AddComment.cs
|   |   |-- Queries/
|   |   |   |-- GetActivityList.cs    # Paginated, filterable activity list
|   |   |   |-- GetActivityDetails.cs
|   |   |   |-- GetComments.cs
|   |   |   +-- ActivityParams.cs     # Pagination + filter parameters
|   |   |-- DTOs/
|   |   |   |-- ActivityDto.cs
|   |   |   |-- BaseActivityDto.cs
|   |   |   |-- CommentDto.cs
|   |   |   |-- CreateActivityDto.cs
|   |   |   +-- EditActivityDto.cs
|   |   +-- Validators/
|   |-- Profiles/
|   |   |-- Commands/
|   |   |   |-- AddPhoto.cs
|   |   |   |-- DeletePhoto.cs
|   |   |   |-- SetMainPhoto.cs
|   |   |   |-- EditProfile.cs
|   |   |   +-- FollowToggle.cs
|   |   |-- Queries/
|   |   |   |-- GetProfile.cs
|   |   |   |-- GetProfilePhotos.cs
|   |   |   |-- GetFollowings.cs
|   |   |   +-- GetUserActivities.cs
|   |   |-- DTOs/
|   |   +-- Validators/
|   |-- Core/
|   |   |-- Result.cs                 # Generic result wrapper
|   |   |-- MappingProfiles.cs        # AutoMapper configuration
|   |   |-- PagedList.cs              # Cursor-based pagination
|   |   |-- PaginationParams.cs
|   |   |-- AppException.cs           # Standardized error DTO
|   |   +-- ValidationBehaviour.cs    # MediatR pipeline validation
|   +-- Interfaces/
|       |-- IPhotoService.cs
|       +-- IUserAccessor.cs
|
|-- Domain/                           # Core entities (no external dependencies)
|   |-- Domain.csproj
|   |-- Activity.cs
|   |-- ActivityAttendee.cs
|   |-- Comment.cs
|   |-- Photo.cs
|   |-- User.cs
|   +-- UserFollowing.cs
|
|-- Persistence/                      # Database access layer
|   |-- Persistence.csproj
|   |-- AppDbContext.cs               # EF Core context with Fluent API config
|   |-- DbInitializer.cs             # Seed data for users and activities
|   +-- Migrations/
|
|-- Infrastructure/                   # External service implementations
|   |-- Infrastructure.csproj
|   |-- Security/
|   |   |-- IsHostRequirement.cs      # Custom authorization handler
|   |   +-- UserAccessor.cs           # Claims-based current user accessor
|   |-- Photos/
|   |   |-- PhotoService.cs           # Cloudinary upload/delete
|   |   +-- CloudinarySettings.cs     # Configuration POCO
|   +-- Email/
|       +-- EmailSender.cs            # Resend email service
|
+-- client/                           # React SPA (Vite + TypeScript)
    |-- package.json
    |-- vite.config.ts
    |-- tsconfig.json
    |-- index.html
    |-- .env.development
    |-- .env.production
    +-- src/
        |-- main.tsx                  # React entry point (QueryClient, MobX, Router)
        |-- app/
        |   |-- layout/
        |   |   |-- App.tsx           # Root component with theme and toast
        |   |   |-- NavBar.tsx
        |   |   |-- UserMenu.tsx
        |   |   +-- styles.css
        |   |-- router/
        |   |   |-- Routes.tsx        # All route definitions
        |   |   +-- RequireAuth.tsx   # Auth guard for protected routes
        |   +-- shared/
        |       +-- components/
        |           |-- TextInput.tsx
        |           |-- SelectInput.tsx
        |           |-- DateTimeInput.tsx
        |           |-- LocationInput.tsx
        |           |-- MapComponent.tsx
        |           |-- PhotoUploadWidget.tsx
        |           |-- AvatarPopover.tsx
        |           |-- DeleteButton.tsx
        |           |-- StarButton.tsx
        |           |-- StyledButton.tsx
        |           +-- MenuItemLink.tsx
        |-- features/
        |   |-- activities/
        |   |   |-- dashboard/
        |   |   |   |-- ActivityDashboard.tsx
        |   |   |   |-- ActivityList.tsx
        |   |   |   |-- ActivityCard.tsx
        |   |   |   +-- ActivityFilters.tsx
        |   |   |-- details/
        |   |   |   |-- ActivityDetailPage.tsx
        |   |   |   |-- ActivityDetailsHeader.tsx
        |   |   |   |-- ActivityDetailsInfo.tsx
        |   |   |   |-- ActivityDetailsSidebar.tsx
        |   |   |   +-- ActivityDetailsChat.tsx
        |   |   +-- form/
        |   |       |-- ActivityForm.tsx
        |   |       +-- categoryOptions.ts
        |   |-- profiles/
        |   |   |-- ProfilePage.tsx
        |   |   |-- ProfileHeader.tsx
        |   |   |-- ProfileContent.tsx
        |   |   |-- ProfileAbout.tsx
        |   |   |-- ProfilePhotos.tsx
        |   |   |-- ProfileActivities.tsx
        |   |   |-- ProfileFollowings.tsx
        |   |   |-- ProfileCard.tsx
        |   |   +-- ProfileEditForm.tsx
        |   |-- account/
        |   |   |-- LoginForm.tsx
        |   |   |-- RegisterForm.tsx
        |   |   |-- AuthCallback.tsx
        |   |   |-- VerifyEmail.tsx
        |   |   |-- RegisterSuccess.tsx
        |   |   |-- ForgotPasswordForm.tsx
        |   |   |-- ResetPasswordForm.tsx
        |   |   |-- ChangePasswordForm.tsx
        |   |   +-- AccountFormWrapper.tsx
        |   |-- home/
        |   |   +-- HomePage.tsx
        |   |-- errors/
        |   |   |-- NotFound.tsx
        |   |   |-- ServerError.tsx
        |   |   +-- TestErrors.tsx
        |   +-- counter/
        |       +-- Counter.tsx
        +-- lib/
            |-- api/
            |   +-- agent.ts          # Axios instance + interceptors
            |-- hooks/
            |   |-- useActivities.ts  # Activity CRUD + pagination hooks
            |   |-- useAccount.ts     # Auth hooks
            |   |-- useComments.ts    # SignalR real-time comment hooks
            |   |-- useProfile.ts     # Profile + photo hooks
            |   +-- useStore.ts       # MobX store access
            |-- stores/
            |   |-- store.ts          # Root MobX store
            |   |-- activityStore.ts
            |   |-- uiStore.ts
            |   +-- counterStore.ts
            |-- schemas/
            |   |-- activitySchema.ts
            |   |-- loginSchema.ts
            |   |-- registerSchema.ts
            |   |-- changePasswordSchema.ts
            |   |-- resetPasswordSchema.ts
            |   +-- editProfileSchema.ts
            |-- types/
            |   +-- index.d.ts        # TypeScript interfaces
            +-- util/
                +-- util.ts
```

---

## Getting Started

### Prerequisites

- .NET 10 SDK
- Node.js (LTS)
- Docker and Docker Compose

### 1. Start the Database

```bash
docker-compose up -d
```

This launches SQL Server 2022 on port 1433.

### 2. Run the API

```bash
cd API
dotnet run
```

On first run, EF Core will automatically apply all pending migrations and seed the database with test data.

### 3. Run the Client

```bash
cd client
npm install
npm run dev
```

The Vite dev server starts on `https://localhost:3000` by default.

### Configuration

The API expects the following configuration sections (in `appsettings.json` or user secrets):

- `ConnectionStrings:DefaultConnection` -- SQL Server connection string
- `CloudinarySettings:CloudName`, `ApiKey`, `ApiSecret` -- Cloudinary credentials
- `Resend:ApiToken` -- Resend API key for email delivery
- `Authentication:GitHub:ClientId`, `ClientSecret` -- GitHub OAuth app credentials
- `ClientAppUrl` -- Base URL of the React client (used in email links and OAuth redirects)
