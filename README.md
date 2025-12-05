# AI ROI & Roadmap Canvas Agent

A Next.js-based AI agent that helps users build an AI ROI and Roadmap Canvas. The system guides users through capturing AI use cases, computing ROI metrics, selecting a portfolio, generating a roadmap, and exporting a complete single-page canvas.

## Features

### 1. AI-Powered Interview
- Conversational interface powered by OpenAI GPT-5.1
- Guided flow through company context, use case capture, and strategic planning
- Real-time streaming responses

### 2. ROI Computation
- **Basic ROI**: (Benefit - Cost) / Cost
- **NPV**: Net Present Value at 10% discount rate
- **Payback Period**: Months to recover investment
- **Risk-Adjusted Value**: NPV weighted by risk and effort/impact ratio

### 3. Portfolio Selection
- Interactive Impact-Effort matrix with four quadrants:
  - Quick Wins (High Impact, Low Effort)
  - Strategic Projects (High Impact, High Effort)
  - Fill-Ins (Low Impact, Low Effort)
  - Reconsider (Low Impact, High Effort)
- Budget-constrained auto-selection
- Manual selection and deselection

### 4. Roadmap Generation
- Three-horizon planning (Q1, 1-Year, 3-Year)
- Auto-assignment based on effort and impact scores
- Dependency tracking
- Milestone visualization

### 5. Canvas Export
- **JSON**: Structured data export
- **Markdown**: Human-readable document
- **PDF**: Print-friendly single-page canvas

## Canvas Sections

The generated canvas includes all required sections:
- Header (Title, Name, DesignedBy, DesignedFor, Date, Version)
- Objectives (Primary Goal, Strategic Focus)
- Inputs (Resources, Personnel, External Support)
- Impacts (Hard Benefits, Soft Benefits)
- Timeline (AI Initiative, Start Date, End Date, Milestones)
- Risks (Name, Likelihood, Impact, Mitigation)
- Capabilities (Skills Needed, Technology)
- Costs (Near-Term, Long-Term, Annual Maintenance)
- Benefits (Near-Term, Long-Term, Soft Benefits)
- Portfolio ROI (Near-Term ROI%, Long-Term ROI%, Portfolio Note)
- Footer (Credit Line)

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API Key

### Installation

1. Clone the repository and navigate to the project:
```bash
cd ai-roi-canvas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-5.1
- **State Management**: Zustand (with persistence)
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
ai-roi-canvas/
├── app/
│   ├── page.tsx              # Landing page
│   ├── interview/page.tsx    # AI chat interview
│   ├── dashboard/page.tsx    # ROI metrics & portfolio
│   ├── portfolio/page.tsx    # Impact-Effort matrix
│   ├── roadmap/page.tsx      # Timeline visualization
│   ├── canvas/page.tsx       # Export & preview
│   ├── api/
│   │   ├── chat/route.ts     # OpenAI streaming endpoint
│   │   └── extract/route.ts  # Data extraction endpoint
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn components
│   ├── chat/                 # Chat interface
│   └── Navigation.tsx
├── lib/
│   ├── openai.ts             # OpenAI client
│   ├── calculations.ts       # ROI formulas
│   ├── canvas-schema.ts      # Type definitions
│   ├── prompts.ts            # System prompts
│   └── export.ts             # Export utilities
├── store/
│   └── canvas-store.ts       # Zustand store
└── public/
```

## Usage Flow

1. **Home**: Overview of the tool and its capabilities
2. **Interview**: Chat with the AI to capture company context and use cases
3. **Dashboard**: Review ROI metrics and adjust selections
4. **Portfolio**: Use the Impact-Effort matrix to prioritize
5. **Roadmap**: Assign timeframes and view the timeline
6. **Export**: Preview and download the canvas in multiple formats

## Demo Mode

Each page includes a "Load Demo Data" button that populates the system with 5 sample AI use cases for demonstration purposes.

## ROI Formulas

### Basic ROI
```
ROI = (Annual Benefits - Total Costs) / Total Costs × 100
```

### Net Present Value (NPV)
```
NPV = Σ (Cash Flow / (1 + 0.10)^t) - Initial Investment
```
Where t = years (1 to 3)

### Payback Period
```
Payback (months) = Implementation Cost / Monthly Net Benefit
```

### Risk-Adjusted Value
```
Value = NPV × Risk Multiplier × (Impact Score / Effort Score)
```
Risk Multipliers: Low = 1.0, Medium = 0.8, High = 0.6

## License

MIT
