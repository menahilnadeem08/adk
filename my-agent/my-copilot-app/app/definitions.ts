// import { z } from "zod";
// import type { CatalogDefinitions } from "@copilotkit/a2ui-renderer";

// export  const myDefinitions = {
//   // Override the basic catalog's Row/Column so `gap` is honoured — the
//   // built-in versions ignore it, which makes composed dashboards cramped.
//   Row: {
//     description:
//       "Horizontal layout container. Children share the width evenly. Use `gap` (px) to space dashboard tiles.",
//     props: z.object({
//       gap: z.number().optional(),
//       // Enum mirrors the keys the renderer actually maps to CSS. Anything
//       // outside this set silently falls back at render time, so we reject
//       // it at schema-parse time to surface LLM typos early.
//       align: z
//         .enum(["start", "center", "end", "stretch", "baseline"])
//         .optional(),
//       justify: z.enum(["start", "center", "end", "spaceBetween"]).optional(),
//       children: z.array(z.string()),
//     }),
//   },

//   Column: {
//     description:
//       "Vertical layout container. Use `gap` (px) to space stacked sections.",
//     props: z.object({
//       gap: z.number().optional(),
//       align: z
//         .enum(["start", "center", "end", "stretch", "baseline"])
//         .optional(),
//       children: z.array(z.string()),
//     }),
//   },

//   // Override the basic catalog's Text so it aligns flush with sibling
//   // components (the built-in version carries an 8px outer margin).
//   Text: {
//     description: "A plain text line. Use for short explanations inside cards.",
//     props: z.object({
//       text: z.string(),
//     }),
//   },

//   Card: {
//     description:
//       "A titled card container with an optional subtitle and a single child slot. Use it to group related content (metrics, rows, buttons).",
//     props: z.object({
//       title: z.string(),
//       subtitle: z.string().optional(),
//       child: z.string().optional(),
//     }),
//   },

//   StatusBadge: {
//     description:
//       "A small coloured pill communicating the state of something (healthy/degraded/at-risk, on-track/behind). Choose `variant` to match the intent.",
//     props: z.object({
//       text: z.string(),
//       variant: z.enum(["success", "warning", "error", "info"]).optional(),
//     }),
//   },

//   Metric: {
//     description:
//       "A key/value KPI tile with an optional trend indicator and trend delta. Ideal for dashboard KPI rows (e.g. 'Revenue • $4.2M • up 12%').",
//     props: z.object({
//       label: z.string(),
//       value: z.string(),
//       trend: z.enum(["up", "down", "neutral"]).optional(),
//       trendValue: z.string().optional(),
//     }),
//   },

//   InfoRow: {
//     description:
//       "A compact two-column 'label: value' row. Good for stacks of facts inside a Card (owner, region, ARR, renewal date, etc.).",
//     props: z.object({
//       label: z.string(),
//       value: z.string(),
//     }),
//   },

//   DataTable: {
//     description:
//       "A data table with column headers and rows. Ideal for rankings and per-person/per-item breakdowns (rep performance vs quota, deal lists). Each row's keys MUST appear in `columns[].key`; unknown row keys render as blank cells and indicate model/schema drift.",
//     // NOTE on B12 (row-keys ⊆ columns[].key): we'd normally enforce this
//     // with `z.object(...).refine(...)`, but the host catalog package's
//     // `CatalogComponentDefinition` type requires `props: ZodObject<…>`
//     // (it inspects `.shape` at runtime), and `.refine` returns a
//     // `ZodEffects` that breaks both the `satisfies CatalogDefinitions`
//     // type assertion and the runtime `.shape` access. Until the host
//     // type is broadened, we encode the constraint in the description
//     // above so the LLM sees the rule, and leave hard enforcement to
//     // the rendering pipeline (which already shows the empty cell —
//     // detection is the gap, not behaviour).
//     props: z.object({
//       columns: z.array(z.object({ key: z.string(), label: z.string() })),
//       // Cells may be strings or numbers — the renderer stringifies at
//       // render time, but accepting both lets the LLM emit raw numerics
//       // (e.g. attainment 124) instead of being forced to stringify.
//       rows: z.array(z.record(z.union([z.string(), z.number()]))),
//     }),
//   },

//   PrimaryButton: {
//     description:
//       "A styled primary call-to-action button. Attach an optional `action` that will be dispatched back to the agent when the user clicks it.",
//     props: z.object({
//       label: z.string(),
//       // The renderer hands `action` opaquely to the A2UI `dispatch` helper,
//       // which forwards it back to the agent. We don't constrain the shape
//       // (different demos use different action payloads), but `z.unknown()`
//       // is strictly better than `z.any()` here because it forces any
//       // consumer that touches the value to narrow it explicitly.
//       action: z.unknown().optional(),
//     }),
//   },

//   PieChart: {
//     description:
//       "A pie/donut chart with a brand-coloured legend. Provide `title`, `description`, and `data` as an array of `{ label, value }` objects. Great for part-of-whole breakdowns (revenue by region, pipeline by stage).",
//     props: z.object({
//       title: z.string(),
//       description: z.string(),
//       data: z.array(
//         z.object({
//           label: z.string(),
//           value: z.number(),
//         }),
//       ),
//     }),
//   },

//   BarChart: {
//     description:
//       "A vertical bar chart built on Recharts. Provide `title`, `description`, and `data` as an array of `{ label, value }` objects. Great for comparing series across categories or time (monthly revenue, signups per month).",
//     props: z.object({
//       title: z.string(),
//       description: z.string(),
//       data: z.array(
//         z.object({
//           label: z.string(),
//           value: z.number(),
//         }),
//       ),
//     }),
//   },
// } satisfies CatalogDefinitions;
import { z } from "zod";
import type { CatalogDefinitions } from "@copilotkit/a2ui-renderer";

/**
 * Dynamic string: literal OR a data-model path binding. The GenericBinder
 * resolves path bindings to the actual value at render time.
 */
const DynString = z.union([z.string(), z.object({ path: z.string() })]);

export const definitions = {
  /**
   * Card override: gives the outer flight-card container a ShadCN look
   * (rounded-xl, neutral-200 border, soft shadow). The basic catalog's
   * Card uses inline styles; overriding here lets the demo's renderer
   * adopt the demo's Tailwind aesthetic without touching the schema JSON.
   */
  Card: {
    description: "A container card with a single child.",
    props: z.object({
      child: z.string(),
    }),
  },
  Title: {
    description: "A prominent heading for the flight card.",
    props: z.object({
      text: DynString,
    }),
  },
  Airport: {
    description: "A 3-letter airport code, displayed large.",
    props: z.object({
      code: DynString,
    }),
  },
  Arrow: {
    description: "A right-pointing arrow used between airports.",
    props: z.object({}),
  },
  AirlineBadge: {
    description: "A pill-styled airline name tag.",
    props: z.object({
      name: DynString,
    }),
  },
  PriceTag: {
    description: "A stylized price display (e.g. '$289').",
    props: z.object({
      amount: DynString,
    }),
  },
  /**
   * Button override: swaps in an ActionButton renderer that tracks
   * its own `done` state so clicking "Book flight" visually updates to
   * a "Booked ✓" confirmation. The basic catalog's Button is stateless,
   * so without this override the click fires the action but the button
   * looks unchanged. Mirrors the pattern in beautiful-chat
   * (src/app/demos/beautiful-chat/declarative-generative-ui/renderers.tsx).
   */
  Button: {
    description:
      "An interactive button with an action event. Use 'child' with a Text component ID for the label. After click, the button shows a confirmation state.",
    props: z.object({
      child: z
        .string()
        .describe(
          "The ID of the child component (e.g. a Text component for the label).",
        ),
      variant: z.enum(["primary", "secondary", "ghost"]).optional(),
      // Union with { event } so GenericBinder resolves this as ACTION → callable () => void.
      action: z
        .union([
          z.object({
            event: z.object({
              name: z.string(),
              context: z.record(z.any()).optional(),
            }),
          }),
          z.null(),
        ])
        .optional(),
    }),
  },
} satisfies CatalogDefinitions;