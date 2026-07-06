# Message Template Editor

A message template editor for a multi-channel messaging platform. Author a
template, insert variables, preview what the customer will actually receive per channel,
validate the content, and review the payload that would be submitted. Frontend only: no
backend, mock data.

Live demo: https://mte.jialin00.com

## How to run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # Vitest (validation unit tests)
pnpm test:e2e   # Playwright (browser end-to-end tests)
pnpm lint       # ESLint (Vue + TypeScript)
pnpm build      # type-check (vue-tsc) + production build
```

Requires Node 22+ and pnpm 10 (pinned via the `packageManager` field).

## On a branch

Two backlog items are built on `feat/localstorage-template-library`, kept off `main` so the
core submission stays focused. Check it out to run them:

```bash
git checkout feat/localstorage-template-library
pnpm test:e2e   # Playwright
```

- **localStorage template library** — submitting saves the template; a selector re-loads saved
  ones (overwrite by id, or append a new one).
- **Playwright E2E** — the real browser flow: validation focus, channel switch, Tab-to-fill,
  variable insert + substitution, submit-saves-and-clears.

## Testing

Two layers: Vitest for the pure logic, Playwright for the browser flow.

| Command | What it does |
|---|---|
| `pnpm test` | Vitest once (validation unit tests) |
| `pnpm test:watch` | Vitest in watch mode while editing |
| `pnpm test:e2e` | Playwright headless, the fast default |
| `pnpm test:e2e:watch` | Playwright headed + slowed (`PW_SLOWMO=1000`) so you can watch it click through |

You don't need to start the dev server first: Playwright's `webServer` boots `pnpm dev` on
:5173 and reuses one that's already running.

More knobs on the e2e run:

```bash
PW_SLOWMO=500 pnpm test:e2e --headed   # watch it, at your own pace (ms per action)
pnpm test:e2e --ui                     # Playwright's interactive runner (time-travel, picker)
pnpm test:e2e --debug                  # step through with the inspector
pnpm test:e2e -g "switching channel"   # run one test by title (matches the test name)
```

## Tech stack

- **Vue 3** (`<script setup lang="ts">`, Composition API) + **TypeScript**
- **Vite** build
- **Tailwind CSS v4** + **shadcn-vue** components
- **unplugin-icons** (brand channel icons from Simple Icons)
- **Vitest** unit tests + **Playwright** end-to-end tests
- **ESLint** (`@vue/eslint-config-typescript`, flat config)

## Architecture

Layered so the logic stays pure and testable, the reactive layer is thin, and components
only render:

```
src/
├── types.ts                    domain types + enum-like const arrays
├── lib/                        pure, framework-free logic (unit-tested)
│   ├── validation.ts           validateTemplate(form) → ValidationError[]
│   ├── variables.ts            {{ }} parsing helpers
│   ├── payload.ts              buildPayload(form) → SubmitPayload
│   └── submit.ts               fake async submit (stands in for a backend)
├── i18n/                       preview strings per language (en / ja / zh-TW)
│   ├── types.ts                Locale shape (mock values, example, receipt words)
│   └── locales/                one file per language
├── composables/
│   ├── useTemplateForm.ts      form state + live validation + submit round-trip
│   ├── useVariablePreview.ts   mock substitution for the preview
│   ├── useChatSounds.ts        Web Audio send sound (synthesised, no assets)
│   └── useTemplateLibrary.ts   saved templates in localStorage (save/overwrite)
└── components/
    ├── MessageTemplateEditor.vue   container, owns the state
    ├── TemplateLibrarySelect.vue   load a saved template into the form
    ├── TemplateBasicForm.vue       name / channel / language / title
    ├── MessageContentEditor.vue    textarea, cursor insertion, Tab-to-fill example
    ├── VariableInsertToolbar.vue   variable buttons
    ├── MessagePreviewCard.vue      per-channel chat preview
    ├── TypingStickman.vue          live composing text + blinking caret
    ├── ValidationErrorList.vue     clickable errors
    ├── PayloadPreview.vue          submitted payload
    └── AppFooter.vue
```

**Data flow:** editing the form recomputes validation and the preview live. Submit
re-validates, then builds and displays the payload.

## Validation design

A single pure function, `validateTemplate(form): ValidationError[]`, accumulates every
error (it never bails early) so the UI can show the full list at once. It is the most
heavily tested part of the app.

- **Required:** name, channel, content
- **Length:** content ≤ 500 characters (counts the raw template)
- **Variables:** every `{{ … }}`-shaped brace cluster is classified
- **Channel-specific:** a `Record<Channel, Rule[]>` table (WhatsApp: no 6+ consecutive
  spaces) so new channels extend without touching the core flow

Variable parsing scans brace clusters (`/\{+[^{}]*\}+|\{+|\}+/`) and classifies each one:

| Cluster | Result |
|---|---|
| `{{ customer_name }}` (supported) | valid |
| `{{ user_name }}` (unknown) | `Unknown variable: user_name` |
| `{{ dsada.com }}` (balanced, bad name) | `Invalid variable name: dsada.com` |
| `{{ x }` / `{ x }}` (stray brace) | `Invalid variable syntax` |

Every error is clickable and jumps to its field; a brace error additionally carries a
character `range`, so clicking it focuses the textarea and selects the offending span.
Generic syntax errors also show a short context snippet (clipped at brace boundaries so it
never bleeds into a neighbouring token), keeping a long message locatable without exposing
raw indices. Classification checks brace count first: anything other than exactly `{{ … }}`
is a syntax error, which takes priority over interpreting the inner text.

## Design decisions & trade-offs

- **shadcn-vue over plain CSS or a heavy UI kit.** shadcn components are copied into the
  repo, so I own and can explain them, and the component structure stays visible rather than
  hidden inside a library.
- **Cursor-position variable insertion, not append.** Appending to the end would be allowed,
  but I did the harder version instead, inserting at the caret where the
  user is typing. Appending would be simpler but forces the user to move the token manually.
- **Hand-written pure function, not vee-validate/zod.** The rules are custom (variable
  parsing, malformed-region location, channel rules), so a schema library would add weight
  without removing the hard part. A pure function is trivially unit-testable.
- **Payload keeps the raw content** (with `{{ }}`). Substitution belongs on the send side,
  per recipient; the frontend should not bake in values at authoring time.
- **Language has no validation.** The requirements list it but attach no behaviour to it. It
  goes into the payload as metadata. Beyond that, `src/i18n` localizes everything the recipient
  would see by language: the preview mock values, the placeholder/Tab example, and the
  read-receipt wording (`Read` / `已讀` / `既読`). The editor UI itself stays English.
- **Read receipts are per-channel, matched to each app.** WhatsApp shows a blue double-tick,
  LINE a read label beside the time, Messenger a "seen" line under the bubble. A custom
  structured `src/i18n` is enough for three preview strings; vue-i18n would be overkill.
- **Plain `<textarea>`, not a rich text editor.** The suggested anatomy specifies a textarea;
  syntax highlighting inside it would need a contenteditable/overlay and isn't required.
- **The preview is one persistent bubble, not swapped elements.** While editing it shows the
  live text with a blinking caret; 700ms after the last keystroke the message "sends" (the
  caret drops, a timestamp appears, one send sound plays, consistent across channels). Early
  versions swapped a composing element for a settled one and flashed on the handoff, so the
  bubble now stays mounted and only toggles the caret and timestamp in place. Per-channel
  detail matches each app: WhatsApp shows a "typing…" status and in-bubble time, LINE puts the
  time beside the bubble, Messenger shows neither. Sounds are synthesised with the Web Audio
  API (no audio files) and default-on with a mute toggle.
- **The template library saves by id, not by append-only.** A submitted template is stored in
  localStorage with a `crypto.randomUUID()`. Loading one back into the form carries its id, so
  re-submitting overwrites that entry instead of duplicating it; a fresh template appends. A
  successful submit clears the form for the next entry while the payload panel keeps showing
  what was just saved.
- **Validation lives in the preview column and only appears after the first edit.** The
  reference tree puts errors under the editor; moving them balances the two columns. Showing
  them on an untouched form would blame the user before they've done anything, so a `dirty`
  flag gates them (a `Draft` state until then).
- **Channel defaults to LINE.** A template almost always targets a channel, so preselecting
  one lets the preview render immediately instead of showing an empty "no channel" state. The
  `Channel is required` rule stays in `validateTemplate` as a defensive guard, even though the
  UI no longer lets a user clear the selection to reach it.
- **Stray brace is always invalid syntax**, including a lone `{` the user meant literally.
- **500 characters counts the raw content**, including `{{ }}`, not the substituted output.
- **Language required conflict:** the anatomy table marks Language required, but the
  Validation Rules section does not. I followed the Validation Rules section (optional,
  default `en`) since that is where validation is actually defined.

## AI usage

**Which AI tools:** Claude Code (Opus 4.8), used throughout as a pair.

**How I used it:** requirement breakdown and scoping, architecture and component design,
the validation logic and regex, unit tests, this README, and heavy iterative UX refinement
driven by screenshots (channel-accurate previews, the composing animation, send sounds).

**Key prompts that shaped the result:**

1. *"What is the minimum this project requires, and which extras are worth doing?"*
   — set the scope and the build plan before any code.
2. *"Deploy it as a subdomain like sibling.jialin00.com."* — shaped the GitHub Pages + subdomain
   deploy, and ruled out a live backend as fragile/out of scope.
3. *"Validation errors should only appear after I start editing — blaming an untouched form
   is bad."* — led to the `dirty`-gated validation and the `Draft` state.
4. *"Each error should state its cause; for an unknown variable just name the key, otherwise
   show a few characters of context. And `{{{ customer_name }}}` should read as a syntax
   problem, not a mis-named variable."* — led to the classified errors, context snippets that
   stop at brace boundaries, and classifying by brace count before inspecting the inner text.
5. *"Customize the preview per channel (LINE, WhatsApp, Messenger), make the typing animation
   follow what I actually type, and add a send sound."* (with reference screenshots) — led to
   the channel-accurate chat preview, the caret-driven composing bubble, and the Web Audio
   send sound. Fixing the flicker on send drove the single-persistent-bubble design.

**AI suggestions I did not adopt:**

- AI suggested plain scoped CSS with no UI library; I chose shadcn-vue instead.
- AI's first validation grouped two malformed tokens into one error; I pointed out they
  should be separate, so it now reports one error per brace cluster.
- AI said the brief only needs to display the payload on submit; I added a localStorage
  template library on top, so submitted templates can be reloaded, edited, and overwritten.
- AI's Messenger preview used a grey background; I corrected it to white with grey bubbles.
- AI's first send animation re-mounted the bubble and flashed on every send; I switched to a
  single persistent bubble that only toggles the caret and timestamp in place.

**How I verified AI output:**

- Vitest unit tests (19 cases) against the pure validation function, covering the seven
  validation rules and malformed-syntax edge cases.
- TypeScript type-checking (`vue-tsc --noEmit`) after every change; zero errors before commit.
- ESLint (`@vue/eslint-config-typescript`) with zero warnings.
- Playwright end-to-end tests (7) in a real browser: validation + error-click focus, channel
  switch, Tab-to-fill, variable insert + live substitution, and the submit/save/import flow.
- Manual edge-case testing in the dev server (missing braces, unknown variables, consecutive
  spaces) watching the preview and error reactions.
- A section-by-section cross-check against the requirements.

## Known limitations

- No backend. `submitTemplate` is a fake async that echoes the payload after a short delay.
- Persistence is localStorage-only (this branch). Templates survive a reload but live in the
  browser, not a server.
- The channel preview is identity-level, not pixel-level: palette, layout landmarks, and read
  receipts match each app, but it does not clone exact fonts, bubble tails, or the full
  sent/delivered/read progression.
- Preview sounds are synthesised approximations, not the real (copyrighted) branded sounds.
- Variable names accept `\w+` only (no Unicode identifiers).
- Cursor insertion depends on the shadcn Textarea's internal `$el`; a shadcn refactor could
  break it.

## What I'd improve with more time

- Message-state progression in the preview (sent vs delivered vs read), not just the read state.
- Component tests with `@vue/test-utils`, on top of the pure-function unit tests.
- Localize the editor UI itself, not just the preview mock data.

See `plan.md` for the original build plan and the deferred backlog.
