# ayudafema.org

Free, open-source, bilingual tool that helps Puerto Rico disaster survivors appeal FEMA denials.

**Status:** v0 prototype — UI shell only, no backend yet.

## Run locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`.

## What's in the prototype

8-screen flow, Spanish default with English toggle:

1. **Landing** — "¿FEMA te negó ayuda?"
2. **Upload** — photo or PDF of denial letter
3. **Processing** — simulated 20s parse
4. **Diagnosis** — parsed case, denial reason, deadline
5. **Evidence** — checklist with "¿por qué?" context
6. **Draft** — attorney-reviewed appeal letter, bilingual preview
7. **Submit** — three filing methods (online, mail, fax)
8. **Tracking** — case status, SMS reminders, next steps

Demo data is a realistic Hurricane Fiona case: `DR-4671-PR`, Yabucoa municipio, ownership-verification denial (the #1 denial type in PR — ~35% of homes have no formal title).

## Stack

- Vite + React 18
- Tailwind CSS (core only, no plugins)
- lucide-react for icons
- Instrument Serif + IBM Plex Sans/Mono via Google Fonts
- Zero backend — hardcoded demo data, simulated flows

## Project structure

```
ayudafema/
├── index.html            # Font preloads + meta
├── src/
│   ├── main.jsx          # React entry
│   ├── App.jsx           # Full 8-screen prototype
│   └── index.css         # Tailwind + design tokens
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── CLAUDE.md             # Context for Claude Code
└── package.json
```

## What's next

See `CLAUDE.md` for the full context and roadmap.

Short version: this prototype is the UI shell. Real production needs letter parsing (Sonnet/Haiku with vision), appeal drafting (Opus for legal reasoning), attorney review queue, SMS infrastructure (Twilio), document storage (Supabase), and deployment under the Ayuda Legal PR fiscal sponsor.

## License

MIT. Fork it. Deploy it. Donate it to a steward org in your country.

## Not affiliated

This is an independent tool. Not affiliated with FEMA or the U.S. federal government.
