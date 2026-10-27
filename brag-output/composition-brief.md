# Composition Brief: Namma Pavagada Launch Video

## Project & Source Material
- **Product**: Namma Pavagada (`nammapavagada.in`)
- **Category**: Civic Information Portal & Heritage Explorer for Pavagada Taluk, Karnataka
- **Format**: `landscape` (1920x1080, 30fps)
- **Total Duration**: 24.5 seconds
- **Tone**: `polished` / `cinematic`

## Brand Identity & Design Tokens
- **Background Color**: `#1F3A2E` (Deep Forest Green) and `#F7F3EA` (Warm Cream)
- **Primary Text**: `#1C1C1C` (Dark Charcoal) and `#FFFFFF` (White)
- **Accent Brand Color**: `#C65D3A` (Terracotta) and `#D97653` (Terracotta Light)
- **Secondary Accent**: `#E8DDCC` (Soft Sand), `#7A5135` (Earth Brown), `#FBBF24` (Solar Amber)
- **Display Font**: `Newsreader`, Georgia, serif
- **Body Font**: `Plus Jakarta Sans`, Inter, sans-serif
- **Regional Font**: `Noto Sans Kannada`, system-ui, sans-serif

## Audio Configuration
- **Voiceover**: `assets/voiceover.wav` (Duration: 23.9s)
  - Generated via Kokoro-82M (`af_heart`)
  - Track Index: `3`
  - Volume: `1.0`
- **Background Music**: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
  - Track Index: `10`
  - Normal Volume: `0.28`
  - Ducked Volume during Voiceover: `0.14`
- **Sound Effects**:
  - `assets/sfx/interface/drop_001.ogg` (UI card entrances)
  - `assets/sfx/ui/mouseclick1.ogg` (Simulated interaction click)
  - `assets/sfx/impact/impactBell_heavy_000.ogg` (Outro final brand seal reveal)

## Beat and Cue Synchronization
- **8.74s** (`strong_beat`, 0.99) -> Shakti Sthala 2,050 MW power metric highlight (beat-locked: 8.74s)
- **13.11s** (`strong_beat`, 0.98) -> Community Services card arrival (beat-locked: 13.11s)
- **18.56s** (`strong_beat`, 0.99) -> Final brand seal reveal & impact bell (beat-locked: 18.56s)
- **Beat Grid Reveals**: Staggered cards revealed across ~0.55s cadence (`beats[]` timestamps: 11.46s, 12.02s, 12.55s, 13.11s)

## Scenes Breakdown
1. **Scene 1 (0.0s – 5.5s)**: Hook — `DISCOVER PAVAGADA`, GPS Coordinates `14.10° N, 77.28° E`, Pavagada Betta backdrop, subtitle triad.
2. **Scene 2 (5.5s – 11.2s)**: The Two Extremes — `1586 CE · 7 Stone Enclosures` & `2,050 MW · Shakti Sthala Solar Park`.
3. **Scene 3 (11.2s – 18.2s)**: Three Pillars Explorer — Heritage · Explorer · Community interactive card showcase with simulated cursor click.
4. **Scene 4 (18.2s – 24.5s)**: Outro Seal — `NAMMA PAVAGADA` (`ನಮ್ಮ ಪಾವಗಡ`), `nammapavagada.in`, rich golden border seal and final bell impact.

## Factual Grounding
Every fact displayed is sourced verbatim from the project codebase (`README.md`, `src/components/home/HeroSection.tsx`, `QuickFactsBar.tsx`):
- 14.10° N, 77.28° E (Exact GPS coordinates)
- 2,050 MW Shakti Sthala (World's 3rd largest solar park, 13,000 acres, 5 villages)
- 1586 CE Paleygar Grant & 7 Rings Fort Enclosures (5 on hill, 2 in town)
- 158 km distance to Bengaluru, 846m elevation
- KSRTC bus schedules, hospital directory, emergency 112
