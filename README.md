# Message Template Editor

A message template editor for a multi-channel messaging platform (Omnichat). Author a
template, insert variables, preview what the customer will actually receive per channel,
validate the content, and review the payload that would be submitted. Frontend only: no
backend, mock data.

Live demo: https://mte.jialin00.com

## How to run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # Vitest (validation unit tests)
pnpm build      # type-check (vue-tsc) + production build
```

Requires Node 22+ and pnpm 10 (pinned via the `packageManager` field).

## Tech stack

- **Vue 3** (`<script setup lang="ts">`, Composition API) + **TypeScript**
- **Vite** build
- **Tailwind CSS v4** + **shadcn-vue** components
- **Vitest** unit tests
- **ESLint + Prettier**

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
│   ├── submit.ts               fake async submit (stands in for a backend)
│   ├── mock.ts                 preview mock values, per language
│   └── examples.ts             placeholder / Tab example, per language
├── composables/
│   ├── useTemplateForm.ts      form state + live validation + submit round-trip
│   └── useVariablePreview.ts   mock substitution for the preview
└── components/
    ├── MessageTemplateEditor.vue   container, owns the state
    ├── TemplateBasicForm.vue       name / channel / language / title
    ├── MessageContentEditor.vue    textarea, cursor insertion, Tab-to-fill example
    ├── VariableInsertToolbar.vue   variable buttons
    ├── MessagePreviewCard.vue      per-channel chat preview
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

Each variable error carries a character `range`, so clicking it focuses the textarea and
selects the offending span. Generic syntax errors also show a short context snippet, so a
long message stays locatable without exposing raw indices.

## Design decisions & trade-offs

- **shadcn-vue over plain CSS or a heavy UI kit.** shadcn components are copied into the
  repo, so I own and can explain them, and the component structure stays visible (a graded
  criterion) rather than hidden inside a library.
- **Cursor-position variable insertion, not append.** The spec allows appending to the end
  but asks to justify it; I did the harder version instead, inserting at the caret where the
  user is typing. Appending would be simpler but forces the user to move the token manually.
- **Hand-written pure function, not vee-validate/zod.** The rules are custom (variable
  parsing, malformed-region location, channel rules), so a schema library would add weight
  without removing the hard part. A pure function is trivially unit-testable.
- **Payload keeps the raw content** (with `{{ }}`). Substitution belongs on the send side,
  per recipient; the frontend should not bake in values at authoring time.
- **Language has no validation.** The spec lists it but attaches no behaviour to it. It goes
  into the payload as metadata. Beyond the spec, I let it localize the preview mock values
  and the placeholder/Tab example (e.g. `ja` shows a Japanese name).
- **Plain `<textarea>`, not a rich text editor.** The spec's anatomy specifies a textarea;
  syntax highlighting inside it would need a contenteditable/overlay and isn't required.
- **Validation lives in the preview column and only appears after the first edit.** The
  reference tree puts errors under the editor; moving them balances the two columns. Showing
  them on an untouched form would blame the user before they've done anything, so a `dirty`
  flag gates them (a `Draft` state until then).
- **Stray brace is always invalid syntax**, including a lone `{` the user meant literally.
- **500 characters counts the raw content**, including `{{ }}`, not the substituted output.
- **Language required conflict:** the anatomy table marks Language required, but the
  Validation Rules section does not. I followed the Validation Rules section (optional,
  default `en`) since that is where validation is actually defined.

## AI usage

**Which AI tools:** Claude Code (Opus 4.8), used throughout as a pair.

**How I used it:** requirement breakdown and scoping, architecture and component design,
the validation logic and regex, unit tests, this README, and iterative UX refinement driven
by screenshots.

**Key prompts that shaped the result:**

1. *"What is the minimum this assignment requires, and which bonus items are worth doing?"*
   — set the scope and the build plan before any code.
2. *"Deploy it as a subdomain like sdg.jialin00.com."* — shaped the GitHub Pages + subdomain
   deploy, and ruled out a live backend as fragile/out of scope.
3. *"Validation errors should only appear after I start editing — blaming an untouched form
   is bad."* — led to the `dirty`-gated validation and the `Draft` state.
4. *"Each error should state its cause; for an unknown variable just name the key, otherwise
   show a few characters of context."* — led to the classified errors and context snippets.
5. *"Customize the preview per channel — LINE, WhatsApp, Messenger"* (with reference
   screenshots) — led to the channel-accurate chat preview.

**AI suggestions I did not adopt:**

- AI suggested plain scoped CSS with no UI library; I chose shadcn-vue instead.
- AI's first validation grouped two malformed tokens into one error; I pointed out they
  should be separate, so it now reports one error per brace cluster.
- AI said the spec only needs to display the payload on submit; I want a localStorage
  template library (parked as a backlog item).
- AI's Messenger preview used a grey background; I corrected it to white with grey bubbles.

**How I verified AI output:**

- Vitest unit tests (18 cases) against the pure validation function, covering the seven spec
  rules and malformed-syntax edge cases.
- TypeScript type-checking (`vue-tsc --noEmit`) after every change; zero errors before commit.
- Manual edge-case testing in the dev server (missing braces, unknown variables, consecutive
  spaces) watching the preview and error reactions.
- A section-by-section cross-check against the assignment PDF.

## Known limitations

- No backend. `submitTemplate` is a fake async that echoes the payload after a short delay.
- No persistence; submitted templates are not saved (see backlog).
- The channel preview is stylised, not pixel-accurate to each app.
- Variable names accept `\w+` only (no Unicode identifiers).
- Cursor insertion reaches the textarea via the shadcn component's `$el`.

## What I'd improve with more time

- Save templates to localStorage with a re-loadable template list.
- Higher-fidelity channel previews (rounded LINE bubbles, timestamps, read receipts).
- Component tests with `@vue/test-utils`, on top of the pure-function unit tests.
- Debounced validation for very long content.
- Localize the editor UI itself, not just the preview mock data.

See `plan.md` for the original build plan and the deferred backlog.
