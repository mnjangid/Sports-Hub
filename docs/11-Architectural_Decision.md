# ADR-001: Unified User Model

## Status

Accepted

## Decision

SportsHub will use a unified User model.

Visitors can access public tournament information as guests without authentication.

Users who register will have a single account throughout their university journey.

A registered user may later become a player, volunteer, sports coordinator, or university administrator without creating a new account.

Roles determine permissions, while the User account represents identity.

## Rationale

- Eliminates duplicate user records.
- Simplifies authentication.
- Supports role changes over time.
- Provides a foundation for future features such as tournament applications, achievements, and notifications.