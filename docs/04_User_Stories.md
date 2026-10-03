# User Stories

## 1. Overview

This document defines the primary user stories for SportsHub Version 1.

User stories describe the actions that different users want to perform and the value they expect from the system.

SportsHub Version 1 is initially designed for a single university and focuses primarily on cricket tournaments.

---

# 2. Guest User Stories

## US-01 — View Live Matches

**As a Guest,**  
I want to view currently live matches  
so that I can follow university sports without being physically present at the venue.

---

## US-02 — View Live Score

**As a Guest,**  
I want to view the live score of an ongoing cricket match  
so that I can follow the progress of the match in real time.

---

## US-03 — View Upcoming Matches

**As a Guest,**  
I want to view upcoming matches  
so that I know which teams are playing next and when the matches will take place.

---

## US-04 — View Match Results

**As a Guest,**  
I want to view completed match results  
so that I can know which team won and by what margin.

---

## US-05 — View Tournament Fixtures

**As a Guest,**  
I want to view the complete tournament fixture  
so that I can understand the schedule and progression of the tournament.

---

## US-06 — View Schedule Changes

**As a Guest,**  
I want to see whether a match has been postponed, cancelled, or rescheduled  
so that I do not rely only on WhatsApp or other informal sources for updates.

---

## US-07 — View Teams

**As a Guest,**  
I want to view team information  
so that I can know which players are representing each team.

---

## US-08 — View Player Statistics

**As a Guest,**  
I want to view player statistics  
so that I can track the performance of players during a tournament.

---

## US-09 — Search Sports Information

**As a Guest,**  
I want to search for tournaments, teams, players, or matches  
so that I can quickly find the information I am interested in.

---

# 3. Registered User Stories

## US-10 — Create an Account

**As a university student,**  
I want to create a SportsHub account  
so that I can maintain a persistent profile throughout my university journey.

---

## US-11 — Log In

**As a registered user,**  
I want to log in securely  
so that I can access and manage my SportsHub profile.

---

## US-12 — Manage My Profile

**As a registered user,**  
I want to update my personal information and profile photo  
so that my SportsHub profile remains accurate.

---

## US-13 — Participate Using Existing Profile

**As a registered user,**  
I want my existing profile to be used when I participate in a tournament  
so that I do not have to provide my information again or create a separate player account.

---

# 4. Sports Coordinator User Stories

## US-14 — Access Coordinator Dashboard

**As a Sports Coordinator,**  
I want to access a dashboard for my assigned sport  
so that I can manage tournaments and matches efficiently.

---

## US-15 — Create a Tournament

**As a Sports Coordinator,**  
I want to create a tournament  
so that I can organize matches and teams under a single competition.

---

## US-16 — Edit Tournament Information

**As a Sports Coordinator,**  
I want to edit tournament information  
so that incorrect or changed details can be updated.

---

## US-17 — Create Teams

**As a Sports Coordinator,**  
I want to create teams for a tournament  
so that players can be organized before matches are scheduled.

---

## US-18 — Search Registered Users

**As a Sports Coordinator,**  
I want to search registered users by name or roll number  
so that I can quickly find the correct student.

---

## US-19 — Add Players to a Team

**As a Sports Coordinator,**  
I want to add registered users to a team  
so that existing user profiles can be used without creating duplicate player records.

---

## US-20 — Remove Players from a Team

**As a Sports Coordinator,**  
I want to remove a player from a team when necessary  
so that the team information remains accurate.

---

## US-21 — Assign Team Leadership

**As a Sports Coordinator,**  
I want to assign a captain and vice-captain  
so that team leadership information is correctly displayed.

---

## US-22 — Schedule a Match

**As a Sports Coordinator,**  
I want to schedule a match between two teams  
so that users can see when and where the match will take place.

---

## US-23 — Modify a Match Schedule

**As a Sports Coordinator,**  
I want to modify the date, time, or venue of a match  
so that schedule changes can be communicated through the centralized platform.

---

## US-24 — Postpone or Cancel a Match

**As a Sports Coordinator,**  
I want to mark a match as postponed or cancelled  
so that users receive accurate match information.

---

## US-25 — Start a Match

**As a Sports Coordinator,**  
I want to start a scheduled match  
so that its status changes to Live and users can begin following the score.

---

## US-26 — Update Live Score

**As a Sports Coordinator,**  
I want to update the cricket score during a match  
so that users can receive accurate live updates.

The scoring process should support updates such as:

- Runs
- Wickets
- Overs
- Extras

---

## US-27 — End an Innings

**As a Sports Coordinator,**  
I want to end an innings  
so that the system can correctly transition to the next stage of the match.

---

## US-28 — Complete a Match

**As a Sports Coordinator,**  
I want to mark a match as completed  
so that the final result and statistics are permanently recorded.

---

# 5. System Administrator User Stories

## US-29 — Manage Sports

**As a System Administrator,**  
I want to create, update, or disable sports  
so that the platform can control which sports are available.

---

## US-30 — Assign Coordinator Permissions

**As a System Administrator,**  
I want to assign Sports Coordinator permissions to a registered user  
so that authorized people can manage specific sports.

---

## US-31 — Remove Coordinator Permissions

**As a System Administrator,**  
I want to remove coordinator permissions  
so that users who are no longer responsible for a sport cannot modify its information.

---

## US-32 — Manage University Information

**As a System Administrator,**  
I want to manage university-level information  
so that SportsHub displays accurate university details.

---

# 6. System-Level User Stories

These stories describe actions that must happen automatically as a result of user actions.

## US-33 — Update Match Status

**When a coordinator starts a match,**  
the system should change the match status to `Live`  
so that users can immediately identify ongoing matches.

---

## US-34 — Update Live Score for Viewers

**When a coordinator updates a score,**  
the system should make the updated score available to viewers with minimal delay  
so that guests and registered users receive near real-time information.

---

## US-35 — Maintain Player Statistics

**When a match is completed,**  
the system should update relevant player statistics  
so that player performance can be tracked across matches.

---

## US-36 — Maintain Team Statistics

**When a match is completed,**  
the system should update team statistics  
so that tournament standings remain accurate.

---

## US-37 — Prevent Duplicate Team Members

**When a coordinator adds a user to a team,**  
the system should prevent the same user from being added multiple times to the same team.

---

## US-38 — Restrict Unauthorized Actions

**When a user attempts to perform a restricted action,**  
the system should verify their permissions  
so that only authorized users can modify SportsHub data.

---

# 7. User Story Priority

Not every user story needs to be implemented immediately.

For Version 1, we can prioritize them as follows.

## Must Have

- US-01: View Live Matches
- US-02: View Live Score
- US-03: View Upcoming Matches
- US-04: View Match Results
- US-05: View Tournament Fixtures
- US-10: Create an Account
- US-11: Log In
- US-12: Manage Profile
- US-14: Access Coordinator Dashboard
- US-15: Create Tournament
- US-17: Create Teams
- US-18: Search Registered Users
- US-19: Add Players to Team
- US-22: Schedule a Match
- US-25: Start a Match
- US-26: Update Live Score
- US-28: Complete a Match
- US-30: Assign Coordinator Permissions
- US-34: Update Live Score for Viewers
- US-37: Prevent Duplicate Team Members
- US-38: Restrict Unauthorized Actions

---

## Should Have

- US-06: View Schedule Changes
- US-07: View Teams
- US-08: View Player Statistics
- US-09: Search Sports Information
- US-13: Participate Using Existing Profile
- US-16: Edit Tournament Information
- US-20: Remove Players from Team
- US-21: Assign Team Leadership
- US-23: Modify Match Schedule
- US-24: Postpone or Cancel Match
- US-27: End an Innings
- US-35: Maintain Player Statistics
- US-36: Maintain Team Statistics
- US-31: Remove Coordinator Permissions

---

## Could Have

- US-29: Manage Sports
- US-32: Manage University Information

---

# 8. Important User Flows

## Flow 1 — Viewing a Live Match

```text
Guest
  ↓
Open SportsHub
  ↓
View Live Matches
  ↓
Select Match
  ↓
View Live Score
  ↓
View Match Details / Scorecard