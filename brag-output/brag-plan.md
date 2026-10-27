# Brag Plan: Namma Pavagada (nammapavagada.in)

## Step 1: 9-Question Planning Rubric

1. **What is the app?**  
   Namma Pavagada (`nammapavagada.in`) is a modern, decoupled digital community portal and cultural explorer for Pavagada Taluk in Tumakuru District, Karnataka, uniting authentic 16th-century hill fortifications, the world's 3rd largest solar park, transit corridors, and civic directory services.

2. **What is the funniest or most impressive claim?**  
   "From 1000 BCE prehistoric megalithic stone cists to the 2,050 MW Shakti Sthala solar park spanning 13,000 acres across 5 villages."

3. **What is the visual hook?**  
   The rich editorial color palette: Deep Forest Green (`#1F3A2E`), Terracotta (`#C65D3A`), Soft Sand (`#E8DDCC`), and Warm Cream (`#F7F3EA`), coupled with classical serif typography (*Newsreader*) and bold modern sans (*Plus Jakarta Sans*), against panoramic imagery of the 846m historic Pavagada Betta hill fortress.

4. **What should be shown from the actual UI?**  
   - Hero header with the coordinates badge (`14.10° N, 77.28° E`) and headline `DISCOVER PAVAGADA`.
   - The Three Pillars Quick-Navigation Hub (`HERITAGE`, `EXPLORER`, `COMMUNITY`).
   - The Key Taluk Metrics (`2,050 MW Shakti Sthala`, `7 Rings Fort Enclosures`, `1586 CE Paleygar Grant`).
   - The Civic & Transit Explorer elements with simulated interaction and the final launch seal.

5. **What is the shortest satisfying video?**  
   24.5 seconds — comfortably under the 25.0s maximum gate, perfectly accommodating the full 23.9s Kokoro voiceover without rushing.

6. **What tone fits best?**  
   - Preset: `polished` / `cinematic`
   - Creative direction: "Majestic heritage meets world-class clean energy — a stately, authentic civic and explorer launch."

7. **What should the audio feel like?**  
   - Music bed: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (steady, clean, and elegant) at volume 0.28, ducking to 0.14 during active voiceover.
   - SFX: Soft UI drops (`interface/drop_001.ogg`) on card reveals, mouse clicks (`ui/mouseclick1.ogg`) on simulated user interactions, and a warm bell impact (`impact/impactBell_heavy_000.ogg`) on the final seal reveal.
   - Voiceover: Clear, warm, conversational narration generated via Kokoro-82M (`af_heart`).

8. **What should the share caption say?**  
   "From 16th-century hill fortresses to the world's 3rd largest solar park. Discover Pavagada — its stories, its places, its people. Now live at nammapavagada.in."

9. **What's the user flow worth showing?**  
   Entry: Discover Pavagada hero coordinates (`14.10° N, 77.28° E`)  
   Key Action: Interactive Three Pillars Hub selecting Heritage & Clean Energy metrics  
   Result: Community directory & interactive spatial map, settling on `nammapavagada.in`.

---

## Music Cue Guidance

- **Track**: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- **Tempo**: 109.96 BPM
- **Strong Cue Targets**:
  - `8.74s` (0.99, strong beat) -> Lock for the Shakti Sthala 2,050 MW power reveal
  - `13.11s` (0.98, strong beat) -> Lock for the Community pillar card drop
  - `18.56s` (0.99, strong beat) -> Lock for the Outro title and seal impact
- **Beat-grid sequence**:
  - Sequential pillar cards revealed across beat intervals (~0.55s cadence).

---

## Storyboard (24.5s Total)

### Scene 1: The Hook & Geographic Grounding (0.0s – 5.5s)
- **Duration**: 5.5s
- **Narration**: "Deep in Karnataka's Tumakuru district lies a land of ancient granite and modern energy."
- **Visuals**:
  - Forest green background with subtle topo grid lines.
  - Geographic badge pulses in: `14.10° N, 77.28° E · Pavagada Taluk`.
  - Massive Newsreader serif typography slams in: `DISCOVER PAVAGADA`.
  - Subtitle: *Its stories. Its places. Its people.*
  - Subtle background photograph of Pavagada Betta hill fortress (846m).
- **Audio/SFX**:
  - Music fades up at 0.0s.
  - Voiceover starts at 0.3s.
  - SFX: Sub low atmospheric hit at 0.2s.

### Scene 2: The Two Monuments — 1586 CE Fort & 2,050 MW Solar (5.5s – 11.2s)
- **Duration**: 5.7s
- **Narration**: "From sixteenth-century hill fortifications to the world's third largest solar park."
- **Visuals**:
  - Two contrasting monument cards drop into place:
    - Card Left (Terracotta accent): `1586 CE · 7 STONE RINGS` | Pavagada Betta Citadel
    - Card Right (Solar Gold accent): `2,050 MW · SHAKTI STHALA` | 13,000 Acres Clean Energy Corridor
  - Numeric counters animate and settle with high readability.
- **Audio/SFX**:
  - SFX: `interface/drop_001.ogg` at 5.7s (Fort card).
  - SFX: `interface/drop_001.ogg` at 7.2s (Solar card).
  - Beat-locked: 8.74s strong cue lands on the 2,050 MW highlight glow.

### Scene 3: The Living Taluk — Three Pillars in Action (11.2s – 18.2s)
- **Duration**: 7.0s
- **Narration**: "Namma Pavagada brings the entire taluk together: verified heritage, transit schedules, and vital civic services."
- **Visuals**:
  - Editorial header: `Heritage × Explorer × Community`.
  - Three authentic interactive cards stagger into view:
    1. **HERITAGE**: 1586 Fort, 8 Paleygars, Megalithic Cists.
    2. **EXPLORER**: Interactive Spatial Map, 158 km Trail to BLR.
    3. **COMMUNITY**: Hospitals & PHCs, KSRTC Bus Timetables, Emergency 112.
  - A simulated cursor clicks the Explorer button with responsive hover feedback.
- **Audio/SFX**:
  - SFX: Sequential card drop `interface/drop_001.ogg` at 11.5s, 12.3s, 13.1s.
  - Beat-locked: 13.11s strong cue on Community card arrival.
  - SFX: `ui/mouseclick1.ogg` at 15.2s on simulated click.

### Scene 4: Outro & Official Launch (18.2s – 24.5s)
- **Duration**: 6.3s
- **Narration**: "Its stories. Its places. Its people. Explore it now at namma pavagada dot in."
- **Visuals**:
  - Elegant framed seal with gold and terracotta accents.
  - Headline: `NAMMA PAVAGADA`
  - Kannada typography: `ನಮ್ಮ ಪಾವಗಡ`
  - Tagline: `Heritage · Explorer · Community`
  - Primary CTA pill: `nammapavagada.in`
  - Subtle glowing border and settled celebratory stillness.
- **Audio/SFX**:
  - Beat-locked: 18.56s strong cue lands on the final seal reveal.
  - SFX: `impact/impactBell_heavy_000.ogg` at 18.5s.
  - Music bed gracefully swells and fades out at 24.5s.
