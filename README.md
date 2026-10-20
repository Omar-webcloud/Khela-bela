# Product Requirements Document (PRD)
## Bangla School Games — Browser-Based Nostalgia Game Collection

**Working title:** KhelaBela (খেলাবেলা)  
**Product type:** Web-based casual multiplayer games  
**Platform:** Mobile web, desktop web, and tablet  
**Status:** Draft v1.0  
**Target audience:** Bangladeshi users, diaspora communities, and anyone who grew up playing traditional paper games  
**Primary language:** Bangla, with English support

---

## 1. Product vision

Build a free, instantly accessible browser-based game collection that brings back the nostalgic experience of playing simple games with friends using a pen and paper.

Users should be able to open a link, choose a game, and start playing without installing an app or creating an account.

The product should feel familiar to people who grew up in Bangladesh during the 1990s, 2000s, and 2010s, while remaining accessible to younger players.

### Core value proposition

- No download or mandatory sign-up.
- Play solo, locally with friends, or online with remote friends.
- Faithfully recreate the original paper-game mechanics.
- Support Bangla and English interfaces.
- Make games fast to start, easy to understand, and fun to replay.

### Product principles

1. **Nostalgia first:** Simple visuals inspired by notebooks, pens, pencils, and school desks.
2. **Instant play:** Reach a playable game within two interactions from the home page.
3. **Faithful mechanics:** Preserve familiar rules and allow configurable house rules.
4. **Social by default:** Make inviting a friend as easy as sharing a URL.
5. **Mobile first:** All games must work comfortably on touchscreens.
6. **No unnecessary friction:** Guest play should be the default.

---

## 2. Target users

### Primary personas

**Persona A: The nostalgic Bangladeshi adult**

- Grew up playing paper games at school or at home.
- Wants to relive childhood memories with friends.
- Values familiar rules and visual details.
- May access the game from a mobile phone.

**Persona B: Friends playing remotely**

- Wants a quick game during a call or chat.
- Needs a simple invitation link.
- Prefers synchronized multiplayer without account creation.

**Persona C: Students looking for quick entertainment**

- Wants short games that can be played during breaks.
- Understands the mechanics without reading long instructions.
- Expects responsive controls and immediate feedback.

**Persona D: Bangladeshi diaspora**

- Lives outside Bangladesh.
- Wants to share culturally familiar games with friends, siblings, or children.
- Benefits from Bangla and English language support.

---

## 3. Product scope

### MVP: Three games

| Game | Players | Core experience |
|---|---|---|
| Paper Cricket | 2 players, with spectators optional | Pen-based outcomes determine runs and wickets |
| Chor Police | 4 players | Secret role assignment, deduction, and scoring |
| Dots and Boxes (কাগজে কাটাকাটি) | 2 players | Draw lines, complete boxes, and win by claiming more squares |

### MVP platform features

- Responsive home page and game selection.
- Guest play.
- Local pass-and-play.
- Private online multiplayer rooms.
- Shareable room links.
- Bangla and English language toggle.
- Rules and house-rule settings.
- Score tracking and replay.
- Basic sound and animation settings.
- Reconnect handling for online games.

### Out of scope for MVP

- Public matchmaking and ranked ladders.
- Voice or video chat.
- User accounts and social profiles.
- In-game currency, ads, or purchases.
- Native iOS and Android apps.
- Chat messages between strangers.
- Additional games such as Ludo or Carrom.

---

## 4. Information architecture

### Main navigation

1. Home
2. Games
3. How to Play
4. Language
5. Settings

### Proposed home page

**Hero section**

- Logo: KhelaBela / খেলাবেলা
- Tagline: “ছোটবেলার খেলা, আবার ফিরে আসুক”
- English alternative: “Your childhood games, one click away.”
- Primary action: Play Now
- Secondary action: Explore Games

**Game cards**

Each card contains:

- Game title in Bangla and English.
- Nostalgic illustration or animated preview.
- Short description.
- Player count.
- Estimated round duration.
- Play button.

**Additional sections**

- Recently played.
- How it works.
- Invite friends.
- About the games and their Bangladeshi cultural context.

---

## 5. Game requirements

### 5.1 Paper Cricket — কলম ক্রিকেট

**Objective:** Recreate the schoolyard paper-cricket game in which a pen determines the batting result, including boundaries and wickets.

#### Gameplay flow

1. Select Paper Cricket.
2. Choose Local Play or Play with a Friend.
3. Configure the rules.
4. Select who bats first.
5. Take turns performing a pen spin, drop, or equivalent digital action.
6. Add runs or record a wicket according to the outcome.
7. Complete the innings and switch players.
8. Declare the winner and offer a rematch.

#### Core mechanics

- The game board displays a hand-drawn circle divided into result regions.
- Each region represents a possible outcome, such as 0, 1, 2, 3, 4, 6, or OUT.
- A player performs a digital pen-spin action.
- The pen animation resolves to one valid region.
- The corresponding score or wicket is recorded.
- A visible scorecard updates after each delivery.

#### Required rule settings

- Number of wickets per innings.
- Number of balls or overs per innings.
- Available scoring outcomes.
- Outcome-region distribution.
- Boundary and out rules.
- Optional bonus rules.

The default outcome distribution must be clearly documented and editable. The game must not imply that all school groups used identical rules.

#### Digital fairness

- Online outcomes must be generated by the authoritative game server.
- Both players must see the same resolved result.
- Animation must not affect the outcome.
- A player must not be able to reroll an outcome by refreshing the page or disconnecting.
- If the original group used a specific pen-pointing convention, the game should support that convention as a configurable rule.

#### Acceptance criteria

- Every delivery produces exactly one valid outcome.
- Scores and wickets update correctly.
- The innings ends when its configured limit is reached.
- The second innings correctly compares totals.
- A completed match displays both scorecards and the winner.
- Rematch starts a new match without requiring a new room.

---

### 5.2 Chor Police — চোর-পুলিশ

**Objective:** Recreate the traditional secret-chit game where players draw roles, reveal selected identities, and use deduction to identify the hidden culprit.

#### Default game mode

Four players:

- বাবু (Babu)
- পুলিশ (Police)
- চোর (Chor)
- ডাকাত (Dakait)

Each role is assigned once per round.

#### Gameplay flow

1. Create a local or online room.
2. Wait for four players.
3. Shuffle the role chits digitally.
4. Privately reveal each player's assigned role.
5. Reveal the roles required by the selected rule set.
6. Let the Police player identify the hidden culprit.
7. Reveal all roles.
8. Calculate points and update the scoreboard.
9. Start another round with new assignments.

#### Role privacy

- A player can see only their own secret role during the private reveal phase.
- In local pass-and-play, a privacy screen must prevent the next player from seeing the previous player's role.
- In online multiplayer, role assignments must be delivered only to the appropriate player.
- No secret role may appear in public game-state data or another player's interface before the reveal phase.

#### Rule settings

- Role names and number of roles.
- Scoring values per role.
- Which roles are revealed initially.
- Whether the Police identifies the Chor, the Dakait, or a specific target according to the selected rules.
- Incorrect-guess penalties.
- Points awarded to an unidentified culprit.
- Number of rounds.

The default rules must be explicit, because role visibility and scoring vary between households and friend groups.

#### MVP scoring preset

An example preset:

| Role or result | Points |
|---|---:|
| Babu | 1,000 |
| Police guesses correctly | 500 |
| Police guesses incorrectly | 0 |
| Hidden culprit | 0 |

The game must support alternative presets without requiring code changes.

#### Acceptance criteria

- The system assigns each configured role exactly once per round.
- Each player sees only their own role before the reveal.
- Only a valid Police guess can be submitted.
- A round cannot be scored twice.
- All roles are revealed after the guess.
- Scores are correctly accumulated across rounds.
- Players can restart or leave a completed match.

---

### 5.3 Dots and Boxes — কাগজে কাটাকাটি

**Objective:** Recreate the classic paper game in which players draw connecting lines to complete squares and claim them.

#### Gameplay flow

1. Select Dots and Boxes.
2. Choose local or online multiplayer.
3. Choose a board size.
4. Select the starting player.
5. Tap an available line between adjacent dots.
6. Award any completed square to the player who closed it.
7. Grant an extra turn when at least one square is completed.
8. Continue until all squares are claimed.
9. Display the final score and winner.

#### Board configuration

The MVP should provide three board sizes:

- Small: 3 × 3 dots, producing 4 boxes.
- Medium: 4 × 4 dots, producing 9 boxes.
- Large: 5 × 5 dots, producing 16 boxes.

The interface must distinguish between the number of dots and the number of boxes.

#### Core rules

- Each move draws one legal line between adjacent dots.
- Existing lines cannot be selected again.
- A player claims every square completed by their move.
- A player who completes one or more squares gets another turn.
- A move that completes multiple squares awards all of them to that player.
- The game ends when all boxes have been claimed.
- The player with the most boxes wins.
- Equal scores produce a draw.

#### Interface requirements

- Clearly show the current player.
- Highlight available lines on hover or touch.
- Display player scores and claimed-box counts.
- Animate a line when it is drawn.
- Mark completed squares with the owner's colour or initials.
- Provide undo only in local practice mode, if enabled; never permit unilateral undo in online competitive matches.

#### Acceptance criteria

- Every legal line can be selected once and only once.
- Illegal or repeated moves are rejected.
- All newly completed boxes are assigned correctly.
- Extra turns are granted correctly.
- The game ends only when the board is complete.
- The final scores match the claimed boxes.
- Local and online modes use identical rules.

---

## 6. Multiplayer requirements

### Mode A: Local pass-and-play

Designed for two or more people sharing one device.

- No network connection required after the game loads.
- Players take turns on the same screen.
- Private role reveal for Chor Police.
- A clear handoff screen prevents accidental information exposure.
- A new round can be started immediately.

### Mode B: Private online room

Designed for friends playing from separate devices.

1. One player creates a room.
2. The system generates a short room code and shareable link.
3. Other players join as guests.
4. The host selects the game and rule settings.
5. The match starts when the required number of players is present.
6. The game state synchronizes between all players.
7. A disconnected player can reconnect to the same match.

#### Room requirements

- Private rooms only for MVP.
- Host can start a game when player requirements are met.
- Room membership is validated by the server.
- Invalid or expired room links show a friendly error.
- A player cannot submit a move for another player.
- A reconnecting player resumes the existing state.
- If the host disconnects, the session remains recoverable; host reassignment or a clearly defined host-disconnect policy is required.

#### Player counts

| Game | Minimum | Maximum |
|---|---:|---:|
| Paper Cricket | 2 | 2 active players |
| Chor Police | 4 | 4 |
| Dots and Boxes | 2 | 2 |

Spectators may be added later, but are not required for MVP.

---

## 7. UX and visual design

### Visual direction

Use a nostalgic notebook aesthetic rather than a glossy casino or arcade design.

**Visual elements**

- Off-white paper backgrounds.
- Blue and black ink.
- Red pencil marks.
- Hand-drawn borders and circles.
- Subtle paper textures.
- Pen strokes and small celebratory animations.
- Familiar Bangla typography.

The interface must remain clean and readable on small screens. Texture should never interfere with contrast or touch targets.

### Typography

- Use a legible Bangla typeface such as Noto Sans Bengali.
- Pair it with a readable Latin typeface.
- Avoid decorative Bengali fonts for scorecards and instructions.

### Accessibility

- Minimum touch target of approximately 44 × 44 CSS pixels.
- Strong text/background contrast.
- Keyboard support for desktop interactions.
- Visible focus indicators.
- Screen-reader labels for game controls.
- Respect reduced-motion preferences.
- Never rely on colour alone to identify a player or game state.

### Sound

Optional sound effects:

- Pen tap.
- Paper shuffle.
- Ball or boundary effect for Paper Cricket.
- Box-completion sound.
- Win and draw sounds.

All sounds must be optional, with mute enabled from the settings screen.

---

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Home page with three game cards | P0 |
| FR-02 | Guest access without registration | P0 |
| FR-03 | Responsive mobile and desktop layouts | P0 |
| FR-04 | Local pass-and-play mode | P0 |
| FR-05 | Private online rooms and shareable links | P0 |
| FR-06 | Paper Cricket scoring and innings engine | P0 |
| FR-07 | Chor Police private roles and scoring | P0 |
| FR-08 | Dots and Boxes legal-move engine | P0 |
| FR-09 | Bangla and English UI | P0 |
| FR-10 | Rematch and replay | P0 |
| FR-11 | Reconnection and game-state recovery | P0 for online mode |
| FR-12 | Configurable house rules | P1 |
| FR-13 | Sound settings | P1 |
| FR-14 | Recent games and match history | P2 |
| FR-15 | Public matchmaking and leaderboards | Post-MVP |

**Priority definitions:** P0 = launch-critical, P1 = desirable, P2 = later enhancement.

---

## 9. Technical architecture

### Recommended architecture

Use a TypeScript-based web stack that supports a shared game engine and real-time synchronization.

| Layer | Recommended approach |
|---|---|
| Frontend | React with Next.js and TypeScript |
| Styling | Tailwind CSS or an equivalent responsive design system |
| Real-time communication | WebSockets via Socket.IO or a managed equivalent |
| Backend | Node.js with TypeScript |
| Game logic | Shared, deterministic game-state modules |
| Database | PostgreSQL for durable match and room metadata |
| Ephemeral state | Redis or managed equivalent, if needed |
| Hosting | A platform supporting server-side execution and WebSockets |
| Testing | Vitest for logic; Playwright for browser workflows |

These are proposed defaults, not hard dependencies. A smaller deployment can begin with in-memory room state if the limitations are clearly understood.

### Architecture principles

- Keep the game rules independent of the UI.
- Represent each match as explicit state plus validated actions.
- Make the server authoritative for online matches.
- Use the same rule engine for local and online play wherever practical.
- Version the game rules and room protocol.
- Separate public match state from private player data.
- Keep persistent storage minimal for guest-first play.

### Example game-state model

```ts
type GameType =
  | "paper-cricket"
  | "chor-police"
  | "dots-and-boxes";

type RoomStatus =
  | "waiting"
  | "playing"
  | "completed"
  | "expired";

interface GameRoom {
  id: string;
  gameType: GameType;
  status: RoomStatus;
  playerIds: string[];
  currentPlayerId?: string;
  rulesVersion: number;
  state: unknown;
  createdAt: string;
  updatedAt: string;
}
```

The `state` field should use game-specific types in production rather than remain `unknown`.

### Server-side validation

Every online action must be checked for:

- Valid room membership.
- Correct player turn.
- Valid game phase.
- Legal move or selection.
- Valid payload and permitted values.
- Duplicate action or stale-state protection.

The server must reject invalid actions without corrupting the match.

### Reconnection

- Maintain a stable player identity for the room session.
- Persist enough state to recover the current match.
- Re-send the latest authorized state after reconnect.
- Do not reassign secret roles when a player reconnects.
- Apply a configurable room expiration policy.

---

## 10. Data and privacy

The MVP should not require names, emails, phone numbers, or social-media accounts.

### Minimal data collection

- Random room identifier.
- Random guest player identifier.
- Game type and rule configuration.
- Current match state.
- Scores and completed-match result.
- Creation, update, and expiration timestamps.

### Privacy requirements

- Do not expose secret Chor Police roles to unauthorized clients.
- Do not collect unnecessary personal data.
- Do not include room secrets in analytics events.
- Apply room expiration and data deletion policies.
- Avoid third-party advertising trackers in the MVP.
- Publish a basic privacy notice.

---

## 11. Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | Home page loads in under 2.5 seconds at the 75th percentile on the agreed test profile |
| Interaction | Local game actions respond within 100 ms under normal conditions |
| Multiplayer | Moves are normally reflected to connected players within 300 ms under the agreed test network |
| Reliability | No lost accepted moves during ordinary reconnection scenarios |
| Compatibility | Latest two major versions of Chrome, Safari, Firefox, and Edge |
| Responsiveness | Functional from 320 CSS pixels wide and above |
| Availability | Initial target of 99.5% monthly availability for online services |
| Security | Server-authoritative validation and private room access |
| Accessibility | Keyboard navigation, readable contrast, and reduced-motion support |
| Localization | Correct Bangla text rendering and language switching without losing match state |

Performance targets are initial goals and should be verified against a defined device and network test matrix.

---

## 12. Analytics and success metrics

### North-star metric

**Weekly completed multiplayer matches per active user.**

This measures whether users return to play with other people, rather than merely opening the site.

### Core metrics

| Metric | Initial target |
|---|---:|
| Home-page-to-game-start conversion | 60% or more |
| Local game completion rate | 80% or more |
| Online room creation-to-match-start rate | 60% or more |
| Successful multiplayer match completion | 90% or more |
| Rematch rate | 25% or more |
| Median time to first playable action | Under 30 seconds |

These are proposed launch targets, not established benchmarks. Recalibrate them after collecting real usage data.

### Event tracking

Track only what is necessary:

- `home_viewed`
- `game_selected`
- `game_started`
- `room_created`
- `room_joined`
- `match_completed`
- `match_abandoned`
- `rematch_started`
- `language_changed`

Include game type, play mode, and outcome category where appropriate. Avoid tracking secret role assignments or unnecessary player-level identifiers.

---

## 13. Testing strategy

### Unit tests

- Paper Cricket outcome resolution, scoring, wickets, and innings completion.
- Chor Police role assignment, role visibility rules, guess validation, and score calculations.
- Dots and Boxes legal moves, square completion, bonus turns, and final scoring.

### Integration tests

- Create and join a room.
- Start a game at the required player count.
- Synchronize moves between clients.
- Reconnect without duplicating or losing accepted moves.
- Reject unauthorized or stale actions.
- Prevent private role information from leaking.

### Browser tests

- Mobile and desktop layouts.
- Bangla and English text rendering.
- Touch interaction and keyboard navigation.
- Reload and reconnect behavior.
- Full match and rematch flows for all three games.

### Manual playtesting

Run sessions with Bangladeshi players from different age groups. Specifically validate:

- Paper Cricket's pen-circle conventions.
- Chor Police role names, reveal order, and scoring.
- Familiarity of the Dots and Boxes board and bonus-turn rules.
- Whether the visuals genuinely evoke paper-and-pen play.

---

## 14. Delivery roadmap

### Phase 1 — Product definition and design

- Finalize the rules for all three games.
- Document alternate house rules.
- Create mobile-first wireframes.
- Design the paper-and-pen visual system.
- Prototype the three core game loops.

**Exit criteria:** Playtesters can explain and play each game without developer assistance.

### Phase 2 — Core game development

- Implement game engines and local play.
- Implement scoreboards and end-of-match screens.
- Add language switching.
- Build responsive layouts.
- Add automated rule-engine tests.

**Exit criteria:** All three games are fully playable offline or locally on one device.

### Phase 3 — Online multiplayer

- Implement room creation and joining.
- Add real-time synchronization.
- Add private role delivery for Chor Police.
- Implement server-side move validation.
- Add reconnection and room expiration.

**Exit criteria:** Two-player and four-player matches pass end-to-end tests.

### Phase 4 — Polish and launch

- Add animations, sound, and settings.
- Optimize loading and touch interactions.
- Complete privacy and accessibility reviews.
- Run cross-browser tests and user playtests.
- Deploy to production and monitor metrics.

**Exit criteria:** No known critical gameplay, privacy, or synchronization bugs remain.

---

## 15. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Different groups remember different rules | Ship explicit default rules and configurable variants |
| Chor Police role leakage | Deliver private roles only through authorized server messages |
| Pen outcomes feel unlike the original | Tune the animation and outcome regions with actual players |
| Multiplayer rooms lose state | Implement recovery and define expiration behavior |
| Mobile controls feel too small | Use large touch targets and test on real devices |
| Bangla typography renders inconsistently | Use a tested Bengali font and verify major browsers |
| Too much engineering before validating fun | Launch local play first, then add online multiplayer |
| Slow initial loading | Keep illustrations lightweight and defer nonessential assets |

---

## 16. MVP release checklist

- [ ] Home page and all three game cards are complete.
- [ ] All three games have documented, playable rules.
- [ ] Paper Cricket correctly records runs, wickets, and innings.
- [ ] Chor Police supports four players and private role assignment.
- [ ] Dots and Boxes correctly handles completed squares and extra turns.
- [ ] Local play works without accounts.
- [ ] Private online rooms work on separate devices.
- [ ] Bangla and English interfaces are available.
- [ ] Reconnection does not duplicate moves or reveal secret roles.
- [ ] Mobile and desktop layouts pass usability tests.
- [ ] Privacy notice and analytics controls are in place.
- [ ] Critical gameplay and security tests pass.

---

## 17. Key product decisions to finalize

Before development begins, resolve these three decisions:

**1. Paper Cricket fidelity**

Which exact pen-circle rule should be the default? The original circle layout, pointer convention, outcome distribution, and wicket rules should be captured from people who played this specific version.

**2. Chor Police scoring**

Should the default use the Babu/Police/Chor/Dakait scoring preset above, or should the product ship a different familiar Bangladeshi variation?

**3. Multiplayer launch strategy**

Should the first public version ship with both local play and online rooms, or launch with local play first and release online multiplayer after validating the game loops?

### Recommended decision

Start with **local play for all three games and private online rooms as the next release milestone**, while designing the game-state architecture for multiplayer from day one. This reduces early delivery risk without requiring a rewrite later.

The success criterion is straightforward: a user should open KhelaBela, recognize a game from their childhood, and be playing within seconds.
