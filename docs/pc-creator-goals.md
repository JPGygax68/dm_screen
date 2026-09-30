The PC Creator
=====================

Goals and considerations
------------------------

### Reminder: general, app-wide goals

As a reminder, here are some of the fundamental goals that all parts of the app need to fulfill to the fullest possible extent, while being aware that some of them compete with each other:

- It must be quick, easy, safe, and painless to use (natural competition right there)
- It must not require an expert DM to use - in fact, it is supposed to *replace* the expert so that novice DMs can "jump in" without fear
- It must support starting a game with hardly any preparation at all, "making things up as we go".

### Specific goals for this component

Because character creation should be fast and easy in some cases (spontaneous games), it is necessary to split character creation from the full character editor. Ideally, the DM should be able to "click together" a party in a single minute.

Thus, the goal for now should be to make PC creation easy by keeping everything simple. This should not introduce any restrictions though: from the very beginning, the app must support the goal of keeping the dm in complete control.

- The Player Character (PC) Creator shall be a component, and offer some flexibility regarding how it can be integrated into the wider UI (overlay, detail view, card vs list item, etc.)

- Its intent is limited to the domain of "quick start": it must be possible to input enough data to begin a new campaign - but only if all details are left for later.

### Translating the goals to this component

The "quick start" goal can probably only be achieved via a (simple) template system; the user:
  
  1. enters the name, gender (male, female, special/other) of their character
  2. selects a basic template, which (in this early version) just selects the main ability scores (more sophisticated templates will be made available later)
  3. optionally selects race
  4. optionally (only if race was specified) chooses a portrait from a (limited) choice
  5. confirms the creation

A crucial point: while confirming the creation will create and persist a Player Character (PC) object, that object will only contain the above mentioned fields entered by the DM - i.e. almost none -, but will maintain a reference to the template it was created from. This will allow the app to alert the DM (or player) whenever the app is accessing a field for the first time, and give him a chance to enter the full PC *Editor* to adjust things before letting the calculation proceed.

**Notes**:

- Any character created "on-the-fly" with the PC Creator component is intended to start at level 1 with 0 XP. It is quite conceivable that the template system will later be extended with more capabilities, including modularity and a set of higher-level builds (some of which could actually be reserved for buyers of a "full version"), but for now, the sole intent is to allow DMs to kick off a game in record time and with minimum stress.