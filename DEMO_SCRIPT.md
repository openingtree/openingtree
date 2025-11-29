# ScoutTree 5-Minute Demo Script

## Setup (Before Demo)
1. Have backend running with demo data loaded
2. Have frontend at http://localhost:3000
3. Browser open to landing page
4. Sample username ready: "DrNykterstein" or your test account

---

## 🎬 Demo Flow

### **Part 1: Landing Page** (60 seconds)

**Script:**
> "Welcome to ScoutTree - the opponent scouting tool for chess players. Let me show you how you can go from knowing nothing about an opponent to having a complete tactical playbook in under 2 minutes."

**Actions:**
1. Point to hero section
   - "Enter any chess username from Lichess or Chess.com"

2. Scroll to features
   - "ScoutTree fetches public games, runs Stockfish analysis, and identifies patterns"

3. Scroll to "What You Get" section
   - "You get an interactive opening tree, weakness detection, preparation lines, and a 60-second pre-game checklist"

4. Scroll to pricing
   - "Free tier gives you 3 reports per month to try it out. Pro gives unlimited with full engine analysis."

**Click**: "Try Free Demo" button

---

### **Part 2: Scout Page** (45 seconds)

**Script:**
> "Let's create a scout report. I'll use Magnus Carlsen's Lichess account as an example."

**Actions:**
1. Type "DrNykterstein" in username field

2. Select platform: "Lichess"

3. Select color: "White"
   > "I'm preparing to play White against this opponent"

4. Select time control: "Blitz"
   > "We'll focus on blitz games since that's our tournament format"

5. Max games: "500" (default)

6. Check "Include Stockfish analysis"

7. **Click**: "Generate Report"

**Progress bar appears:**
> "The system is now fetching games from Lichess, building an opening tree, and analyzing with Stockfish. This typically takes 1-2 minutes for 500 games, but we've cached this report for the demo."

---

### **Part 3: Report Page** (3 minutes 15 seconds)

**Script:**
> "Here's our complete scout report. Let me walk you through the key sections."

#### A. Pre-Game Checklist (45 seconds)

**Point to left panel:**

1. **60-Second Summary**
   > "First, you get a human-readable summary. Here it tells us: 'You're facing a 3200-rated GM who excels in sharp tactical positions but shows weakness around the f7 square in Italian Game setups.'"

2. **Key Points** (read 2-3)
   - "Target f7 square - vulnerable to knight forks"
   - "Prepare Italian Game/Fried Liver lines to move 12"
   - "Avoid Queen's Gambit - opponent's specialty"

3. **Avoid List**
   > "It also tells you what NOT to do - like avoiding slow maneuvering where opponent excels"

4. **Priority Prep**
   > "And most importantly, your single priority: memorize Fried Liver Attack critical lines."

**Script:**
> "You can print this checklist and review it in the 5 minutes before your game starts."

---

#### B. Opening Tree (45 seconds)

**Scroll to right panel, point to opening tree:**

**Script:**
> "Now let's see the data behind these recommendations."

**Actions:**
1. Point to "e4" node
   > "Opponent plays e4 in 80.8% of games with White - 198 out of 245 games"

2. Show win percentages
   > "Notice the color-coded stats: 56.6% wins, 22.7% draws, 20.7% losses"

3. Click to expand "e5" node
   > "When Black responds e5, we can drill down further. This is fully interactive and goes 10 moves deep."

4. Collapse it
   > "You can explore different lines and see exactly what your opponent plays and how they perform."

---

#### C. Weaknesses (45 seconds)

**Scroll to weaknesses section:**

**Script:**
> "This is where it gets tactical. ScoutTree has identified specific weaknesses with confidence ratings."

**Point to first weakness card:**

1. Read weakness
   > "Vulnerable to knight forks on f7 square in Italian Game variations - HIGH confidence, HIGH severity"

2. Show occurrence rate
   > "This pattern appears in 18.5% of games, based on 54-game sample size"

3. Click evidence link
   > "And here's the proof - links back to actual games where this happened, with the specific move number and position."

**Scroll to second weakness:**
> "There's also a time management weakness - frequently enters time trouble in complex middlegames. This is important because we can steer toward complex positions to exploit this."

---

#### D. Recommended Lines (45 seconds)

**Scroll to recommended lines:**

**Script:**
> "Based on these weaknesses, ScoutTree recommends three specific preparation lines."

**Point to first recommendation:**

1. **Name & Type**
   > "Italian Game - Aggressive Fried Liver Setup. This is marked as 'exploitation' because it directly targets the f7 weakness we found."

2. **Moves** (point to monospace box)
   > "Here are the exact moves in standard notation. Click copy to add them to your analysis board."

3. **Click copy button**
   > "57% success rate against this opponent based on similar patterns in the database."

4. **Explanation**
   > "Read the explanation: 'Opponent shows tactical weakness around f7. The Fried Liver exploits this directly. In 4 out of 7 similar games, opponent struggled.'"

5. **Follow-up plan**
   > "And crucially, it tells you what to do after the opening: 'After Kxf7, continue with Qf3+ Ke6, then Nc3 targeting the exposed king.'"

**Scroll to second line:**
> "We also get a 'solid' backup option in case opponent deviates - the Scotch Game, which they have limited experience with."

---

#### E. Training Drill (30 seconds)

**Scroll to training drill:**

**Script:**
> "Before your game, warm up with these 3 positions - all focused on the f7 weakness theme."

**Point to Position 1:**
> "Question: How does White exploit the f7 weakness?"
> "Answer: Ng5 attacking f7..."

**Point to time limit:**
> "You get 30 seconds total to solve all three. It's a rapid-fire warm-up to get your tactics sharp before the game."

---

#### F. Download & Share (15 seconds)

**Scroll back to top:**

**Click download JSON button:**
> "Finally, you can download the complete report as JSON to analyze with your own tools, or share it with your coach."

**Show JSON file:**
> "This is the full structured data - every stat, every analysis, ready for programmatic access if you're building training tools."

---

### **Closing** (15 seconds)

**Script:**
> "So in under 2 minutes, we went from a username to a complete tactical playbook: opening tree, weaknesses with evidence, three preparation lines, and a pre-game checklist. Whether you're a tournament player, a coach, or just facing a tough opponent in an online league, ScoutTree gives you the edge."

> "Try it free with 3 reports per month, or upgrade to Pro for unlimited reports with full Stockfish analysis. Thanks for watching!"

---

## 📋 Demo Checklist

- [ ] Backend running (API + Worker)
- [ ] Frontend running on localhost:3000
- [ ] Demo report pre-generated for speed
- [ ] Browser window maximized
- [ ] Sample username ready
- [ ] Practice transitions between sections
- [ ] Know the key stats to call out
- [ ] Time yourself - stay under 5 minutes!

## 🎯 Key Points to Emphasize

1. **Speed**: Under 2 minutes from username to actionable prep
2. **Evidence-based**: Every claim backed by actual game links
3. **Actionable**: Not just stats, but "what to do about it"
4. **Complete**: Opening + middlegame + endgame + time management
5. **Professional**: Confidence scoring, sample sizes, data limitations

## 🚨 Common Demo Pitfalls

- Don't get lost in the opening tree - expand 1-2 nodes max
- Don't read every weakness - pick 1-2 with best evidence
- Don't skip the pre-game checklist - it's the "money shot"
- Don't forget to show the download feature
- Time management: 1min landing, 1min scout, 3min report

---

**Total Time: 5 minutes**
**Wow Factor: High** ✨
