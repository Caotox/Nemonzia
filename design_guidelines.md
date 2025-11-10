# Design Guidelines: League of Legends Team Management Platform

## Design Approach

**Selected Approach**: Design System (Material Design adapted for gaming applications)

**Rationale**: This is a data-dense productivity tool requiring efficient information display, complex tables, forms, and dashboard functionality. Material Design provides the structured component patterns needed while allowing customization for gaming aesthetics.

**Key Principles**:
- Information hierarchy for quick scanning
- Efficient data entry and manipulation
- Clear visual separation between functional areas
- Gaming-inspired polish without sacrificing usability

---

## Typography

**Font Stack**:
- Primary: 'Inter' (Google Fonts) - Clean, highly legible for UI and data
- Accent: 'Rajdhani' (Google Fonts) - Angular, gaming feel for headers
- Monospace: 'Roboto Mono' - For stats and numerical data

**Hierarchy**:
- Page Titles: Rajdhani, 32px, 700 weight, uppercase, letter-spacing 0.05em
- Section Headers: Rajdhani, 24px, 600 weight
- Subsection Headers: Inter, 18px, 600 weight
- Body Text: Inter, 14px, 400 weight
- Table Headers: Inter, 12px, 600 weight, uppercase, letter-spacing 0.03em
- Champion Names: Inter, 14px, 500 weight
- Stats/Numbers: Roboto Mono, 14px, 500 weight

---

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, and 16 consistently
- Component padding: p-4 or p-6
- Section spacing: gap-8 or gap-12
- Card padding: p-6
- Table cell padding: p-4
- Button padding: px-6 py-3
- Input fields: px-4 py-3

**Grid Structure**:
- Main container: max-w-7xl mx-auto
- Sidebar navigation: Fixed 280px width
- Content area: flex-1 with p-8
- Champion grid: grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4

---

## Component Library

### Navigation
**Sidebar Navigation** (Fixed Left, 280px):
- Logo/Team Name at top (h-16)
- Navigation items with icons (Heroicons)
  - Dashboard
  - Champions Database
  - Drafting Tool
  - Scrim Results
  - Player Availability
- Active state: border-l-4 with pl-6
- Hover state: subtle background shift
- Icons: 20px size, aligned left with 12px gap to text

### Champion Database Components

**Champion Card** (Grid Display):
- Aspect ratio: square (1:1)
- Champion portrait: Full card background
- Name overlay: Absolute bottom with gradient overlay
- Hover state: Scale 1.05 with smooth transition
- Selected state: Border-4 with glow effect

**Champion Evaluation Table**:
- Fixed header row with sticky positioning
- Columns: Champion Portrait (60px) | Name (150px) | 8 Characteristics (each 100px)
- Rating system: 5-star display using star icons
- Editable inline: Click to edit with dropdown (1-5 scale)
- Row hover: Subtle highlight for entire row
- Alternating row treatment for easier scanning

### Drafting Tool Components

**Draft Board Layout**:
- Two-column layout: Team Draft (left) | Enemy Draft (right)
- Each side: 5 position slots (TOP, JGL, MID, ADC, SUP)
- Champion slot: 120px × 120px with position label above
- B/R indicators: Badge positioned top-right corner
- Drag-and-drop zones with dotted border when empty
- Selected champion shows full portrait with name below

**Variants Section** (Below main draft):
- Horizontal scrollable cards
- Each variant card: 200px width, shows mini-composition
- Add variant button: Dashed border card

### Scrim Results Components

**Result Entry Form**:
- Two-column layout for desktop
- Left column: Date picker, Opponent input, Score input (W/L toggle)
- Right column: Large textarea for comments (min-height: 200px)
- Submit button: Full-width below form
- Recent results list below with edit/delete actions

**Results Table**:
- Columns: Date (100px) | Opponent (200px) | Score (80px) | Comments (flex) | Actions (80px)
- Sort by date (most recent first)
- Comments truncated with "Read more" expansion
- Edit inline or modal for detailed comments

### Player Availability Components

**Availability Calendar**:
- Weekly grid view: Days as columns, Time slots as rows
- Player names in leftmost column (120px)
- Checkbox grid for each player/time intersection
- Color-coded cells for visual quick-scan
- Summary row at bottom showing total available per slot
- Add player button above table

### Core UI Elements

**Buttons**:
- Primary: px-6 py-3, rounded-lg, font-medium
- Secondary: Similar padding, border-2
- Icon buttons: 40px × 40px, rounded-lg, centered icon
- Add/Create buttons: Include "+" icon (left of text)

**Forms & Inputs**:
- Text inputs: w-full px-4 py-3, rounded-lg, border-2
- Select dropdowns: Match input styling with chevron-down icon
- Textareas: min-h-32, same padding as inputs
- Labels: Block, mb-2, font-medium, 14px
- Required asterisk: Positioned after label text

**Cards**:
- Standard card: rounded-xl, p-6, shadow-lg
- Hover elevation: shadow-xl with smooth transition
- Header inside card: pb-4 border-b-2 mb-4

**Tables**:
- Container: Overflow-x-auto for responsive scrolling
- Table: w-full with border-collapse
- Header: Sticky top-0, font-semibold, border-b-2
- Cells: p-4, border-b
- Row hover: Transition all

**Modals/Overlays**:
- Backdrop: Fixed inset-0, backdrop-blur-sm
- Modal container: Fixed centered, max-w-2xl, rounded-xl, p-8
- Close button: Absolute top-4 right-4, 32px × 32px

**Data Visualization**:
- Star ratings: Row of 5 star icons (16px each), filled/outline states
- Progress bars: h-2, rounded-full, relative with filled portion
- Stat badges: Inline-flex, px-3 py-1, rounded-full, text-xs, font-bold

---

## Icons

**Library**: Heroicons (via CDN)

**Usage**:
- Navigation: 20px icons
- Buttons: 18px icons  
- Table actions: 16px icons
- Champion characteristics: 20px icons for each trait

**Key Icons**:
- Dashboard: ChartBarIcon
- Champions: UserGroupIcon
- Drafting: ClipboardListIcon
- Scrims: TrophyIcon
- Availability: CalendarIcon
- Add: PlusIcon
- Edit: PencilIcon
- Delete: TrashIcon
- Star rating: StarIcon (solid/outline variants)

---

## Champion Images

**Source**: Riot Games Data Dragon API
- Base URL pattern: `https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{championName}.png`
- Fetch latest version first, then populate all 170+ champions
- Implement lazy loading for performance
- Cache images locally after first load
- Fallback placeholder for failed loads

**Implementation**: Complete champion roster including: Aatrox, Ahri, Akali, Akshan, Alistar, Amumu, Anivia, Annie, Aphelios, Ashe, Aurelion Sol, Azir, Bard, Bel'Veth, Blitzcrank, Brand, Braum, Caitlyn, Camille, Cassiopeia, Cho'Gath, Corki, Darius, Diana, Dr. Mundo, Draven, Ekko, Elise, Evelynn, Ezreal, Fiddlesticks, Fiora, Fizz, Galio, Gangplank, Garen, Gnar, Gragas, Graves, Gwen, Hecarim, Heimerdinger, Illaoi, Irelia, Ivern, Janna, Jarvan IV, Jax, Jayce, Jhin, Jinx, K'Sante, Kai'Sa, Kalista, Karma, Karthus, Kassadin, Katarina, Kayle, Kayn, Kennen, Kha'Zix, Kindred, Kled, Kog'Maw, LeBlanc, Lee Sin, Leona, Lillia, Lissandra, Lucian, Lulu, Lux, Malphite, Malzahar, Maokai, Master Yi, Milio, Miss Fortune, Mordekaiser, Morgana, Naafiri, Nami, Nasus, Nautilus, Neeko, Nidalee, Nilah, Nocturne, Nunu & Willump, Olaf, Orianna, Ornn, Pantheon, Poppy, Pyke, Qiyana, Quinn, Rakan, Rammus, Rek'Sai, Rell, Renata Glasc, Renekton, Rengar, Riven, Rumble, Ryze, Samira, Sejuani, Senna, Seraphine, Sett, Shaco, Shen, Shyvana, Singed, Sion, Sivir, Skarner, Smolder, Sona, Soraka, Swain, Sylas, Syndra, Tahm Kench, Taliyah, Talon, Taric, Teemo, Thresh, Tristana, Trundle, Tryndamere, Twisted Fate, Twitch, Udyr, Urgot, Varus, Vayne, Veigar, Vel'Koz, Vex, Vi, Viego, Viktor, Vladimir, Volibear, Warwick, Wukong, Xayah, Xerath, Xin Zhao, Yasuo, Yone, Yorick, Yuumi, Zac, Zed, Zeri, Ziggs, Zilean, Zoe, Zyra (complete list as of 2025).

---

## Animations

**Minimal, Purposeful Only**:
- Hover scale on champion cards: scale-105, duration-200
- Button press feedback: scale-95, duration-100  
- Modal entry: fade + scale from 95% to 100%, duration-300
- Sidebar navigation: Border slide-in, duration-200
- No scroll animations, no page transitions, no decorative motion