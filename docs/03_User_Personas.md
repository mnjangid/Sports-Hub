# User Personas

## 1. Overview

This document defines the primary user personas for SportsHub Version 1.

The purpose of these personas is to understand the different types of people who will interact with the platform, their goals, problems, and expectations. These personas will guide future decisions related to features, user interface design, user stories, and system requirements.

SportsHub Version 1 is initially designed for a single university and focuses primarily on cricket tournaments.

---

# 2. Persona 1 — Guest / Sports Enthusiast

## Who is this user?

This user is a student, friend, alumni, or any other person interested in following university sports. They may not have a SportsHub account and should still be able to access public sports information.

They are primarily interested in quickly checking what is happening during a tournament.

## Goals

The Guest / Sports Enthusiast wants to:

* View live match scores.
* Check which matches are currently being played.
* View upcoming matches.
* Check match results.
* View tournament fixtures.
* View tournament standings.
* Check player and team statistics.

## Problems

Currently, this user may face problems such as:

* Not knowing where to find the latest match information.
* Missing matches because multiple sports occur simultaneously.
* Depending on WhatsApp groups for fixture updates.
* Not knowing whether a match has been postponed or rescheduled.
* Being unable to physically attend every match.

## How SportsHub helps

SportsHub provides a centralized public platform where the user can quickly access:

* Live scores
* Fixtures
* Results
* Tournament information
* Player statistics

The user should not be required to create an account just to access basic sports information.

## Key Requirement

> **Sports information should be easy to access with minimal friction.**

---

# 3. Persona 2 — Registered Student

## Who is this user?

This is a university student who has created a SportsHub account.

Initially, they may simply use SportsHub to follow university sports. Later, they may participate in a tournament and be added to a team using their existing profile.

The user maintains one SportsHub identity throughout their university journey.

## Goals

The Registered Student wants to:

* Maintain a personal profile.
* Access university sports information.
* Have an existing profile that can be used if they participate in a tournament.
* View their future sports participation and statistics.
* Avoid repeatedly providing personal information for different tournaments.

## Problems

Without a centralized profile:

* Students may need to provide the same information repeatedly.
* Coordinators may manually collect names, photos, and other details.
* Duplicate player records may be created.
* Sports participation history may not be connected to the same person.

## How SportsHub helps

A registered user creates their profile once.

Their profile can later be found by a coordinator and added to a team.

For example:

```text
Student creates SportsHub account
            ↓
Completes profile
            ↓
Uses SportsHub as a viewer
            ↓
Participates in a tournament
            ↓
Coordinator finds existing profile
            ↓
Adds user to a team
```

The user does not need to create a separate player account.

## Key Requirement

> **One person should have one persistent SportsHub identity.**

---

# 4. Persona 3 — Sports Coordinator

## Who is this user?

The Sports Coordinator is responsible for managing one or more sports or tournaments.

For example, a Cricket Coordinator may be responsible for organizing cricket matches, managing teams, creating fixtures, and updating live scores.

This is one of the most important personas in Version 1 because the quality of the data displayed to users depends on the coordinator's ability to manage the tournament efficiently.

## Goals

The Sports Coordinator wants to:

* Create and manage tournaments.
* Create teams.
* Add registered users to teams.
* Schedule matches.
* Update or reschedule fixtures.
* Start and manage live matches.
* Update scores quickly.
* Maintain accurate tournament information.

## Problems

Currently, a coordinator may need to:

* Share schedules manually through WhatsApp.
* Inform students separately when schedules change.
* Manage player information manually.
* Use different platforms for scoring and communication.
* Handle match information from multiple locations.

Updating a score should also be fast enough to use during an actual match.

The coordinator should not have to navigate through multiple complicated screens just to record a run or wicket.

## How SportsHub helps

SportsHub provides a dedicated coordinator dashboard where the coordinator can manage the complete tournament workflow.

A simplified workflow is:

```text
Create Tournament
        ↓
Create Teams
        ↓
Add Registered Users
        ↓
Schedule Matches
        ↓
Publish Fixtures
        ↓
Start Match
        ↓
Update Live Score
        ↓
Complete Match
        ↓
Statistics and History Updated
```

## Key Requirement

> **Tournament management and live scoring must be fast, simple, and reliable.**

---

# 5. Persona 4 — System Administrator

## Who is this user?

During the initial deployment of SportsHub, the System Administrator will be the platform owner or developer.

The administrator is responsible for controlling high-level system access and assigning Sports Coordinator permissions.

If the university officially adopts SportsHub in the future, these responsibilities can be transferred to authorized university staff.

## Goals

The System Administrator wants to:

* Manage the university configuration.
* Create and manage sports.
* Assign Sports Coordinator permissions.
* Remove coordinator permissions when necessary.
* Maintain overall control of the platform.

## Problems

Without centralized access management:

* Unauthorized users could modify tournament information.
* There would be no clear control over who manages a particular sport.
* Coordinator permissions could become difficult to manage.

## How SportsHub helps

The system provides administrative controls for managing sports and assigning authorized coordinators.

The administrator does not need to manage every tournament directly. Instead, they assign responsibility to the appropriate Sports Coordinator.

## Key Requirement

> **Administrative control should be centralized, secure, and easy to manage.**

---

# 6. Persona Relationships

The following diagram represents how these personas relate to the platform:

```text
                    ┌─────────────────┐
                    │      Guest      │
                    │                 │
                    │ Views public    │
                    │ sports data     │
                    └────────┬────────┘
                             │
                             │ Registers
                             ▼
                    ┌─────────────────┐
                    │ Registered User │
                    │                 │
                    │ Persistent      │
                    │ SportsHub       │
                    │ identity        │
                    └────────┬────────┘
                             │
               ┌─────────────┼──────────────┐
               │             │              │
               ▼             ▼              ▼
            Player      Coordinator     Administrator
          (Team Member)  (Permission)    (Permission)
```

A Player does not require a separate account. A registered user becomes a player when they are associated with a team or tournament.

Coordinator and Administrator responsibilities are determined through permissions assigned to the user's account.

---

# 7. Persona Summary

| Persona                   | Primary Goal                                                 | Main Interaction                                     |
| ------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| Guest / Sports Enthusiast | Follow university sports                                     | View live scores, fixtures, results, and statistics  |
| Registered Student        | Maintain a persistent identity and participate when required | Manage profile and access sports information         |
| Sports Coordinator        | Organize and manage sports tournaments                       | Teams, fixtures, matches, and live scoring           |
| System Administrator      | Control platform access and sports management                | Assign coordinators and manage system-level settings |

---

# 8. Design Principles Derived from Personas

The following principles should guide SportsHub development:

1. Public sports information should be easy to access.
2. Creating an account should provide additional value but should not be required for basic score viewing.
3. Each registered user should have one persistent identity.
4. A player should be represented using the existing user profile rather than creating duplicate accounts.
5. Coordinators should only manage the sports or tournaments assigned to them.
6. Live scoring must prioritize speed and simplicity.
7. Administrative permissions must be controlled and restricted.
8. The system should remain understandable for users with different levels of technical experience.
