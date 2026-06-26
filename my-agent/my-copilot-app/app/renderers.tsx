// import React from "react";
// import {
//   PieChart as RechartsPieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   BarChart as RechartsBarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";
// import type { CatalogRenderers } from "@copilotkit/a2ui-renderer";
// import { TriangleAlert, CircleAlert, CircleCheck, Info } from "lucide-react";
// import { myDefinitions } from "./definitions";

// type MyDefinitions = typeof myDefinitions;

// // Theme configuration mapping to local CSS variables
// const c = {
//   cardFg: "var(--foreground, #0f172a)",
//   muted: "var(--muted-foreground, #64748b)",
//   divider: "var(--border, #e2e8f0)",
// };

// // Default chart colors palette
// const CHART_COLORS = [
//   "#3b82f6",
//   "#10b981",
//   "#f59e0b",
//   "#ef4444",
//   "#8b5cf6",
//   "#ec4899",
// ];

// // Inline Badge component
// interface BadgeProps {
//   variant?: "success" | "warning" | "error" | "info";
//   style?: React.CSSProperties;
//   "data-testid"?: string;
//   children: React.ReactNode;
// }

// const Badge: React.FC<BadgeProps> = ({
//   variant = "info",
//   style,
//   "data-testid": testId,
//   children,
// }) => {
//   const styles: Record<string, React.CSSProperties> = {
//     success: {
//       backgroundColor: "rgba(34, 197, 94, 0.1)",
//       color: "#22c55e",
//       borderColor: "rgba(34, 197, 94, 0.2)",
//     },
//     warning: {
//       backgroundColor: "rgba(234, 179, 8, 0.1)",
//       color: "#eab308",
//       borderColor: "rgba(234, 179, 8, 0.2)",
//     },
//     error: {
//       backgroundColor: "rgba(239, 68, 68, 0.1)",
//       color: "#ef4444",
//       borderColor: "rgba(239, 68, 68, 0.2)",
//     },
//     info: {
//       backgroundColor: "rgba(59, 130, 246, 0.1)",
//       color: "#3b82f6",
//       borderColor: "rgba(59, 130, 246, 0.2)",
//     },
//   };

//   const variantStyle = styles[variant] || styles.info;

//   return (
//     <span
//       data-testid={testId}
//       style={{
//         display: "inline-flex",
//         alignItems: "center",
//         padding: "4px 8px",
//         borderRadius: "9999px",
//         fontSize: "0.75rem",
//         fontWeight: 600,
//         border: "1px solid",
//         ...variantStyle,
//         ...style,
//       }}
//     >
//       {children}
//     </span>
//   );
// };

// // Inline Button component
// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

// const Button: React.FC<ButtonProps> = ({ children, style, ...props }) => {
//   return (
//     <button
//       {...props}
//       style={{
//         padding: "8px 16px",
//         borderRadius: "6px",
//         backgroundColor: "var(--primary, #3b82f6)",
//         color: "var(--primary-foreground, #fff)",
//         fontSize: "0.85rem",
//         fontWeight: 600,
//         border: "none",
//         cursor: "pointer",
//         transition: "opacity 0.2s",
//         ...style,
//       }}
//     >
//       {children}
//     </button>
//   );
// };

// // Inline CardShell component
// interface CardShellProps {
//   title?: string;
//   subtitle?: string;
//   testid?: string;
//   cardId?: string;
//   children: React.ReactNode;
// }

// const CardShell: React.FC<CardShellProps> = ({
//   title,
//   subtitle,
//   testid,
//   cardId,
//   children,
// }) => {
//   return (
//     <div
//       data-testid={testid}
//       data-card-id={cardId}
//       style={{
//         borderRadius: "12px",
//         border: "1px solid var(--border, #e2e8f0)",
//         background: "var(--background, #fff)",
//         padding: "16px",
//         display: "flex",
//         flexDirection: "column",
//         gap: "12px",
//         boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
//         width: "100%",
//       }}
//     >
//       {(title || subtitle) && (
//         <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
//           {title && (
//             <h3
//               style={{
//                 fontSize: "0.95rem",
//                 fontWeight: 600,
//                 color: "var(--foreground, #0f172a)",
//                 margin: 0,
//               }}
//             >
//               {title}
//             </h3>
//           )}
//           {subtitle && (
//             <p
//               style={{
//                 fontSize: "0.8rem",
//                 color: "var(--muted-foreground, #64748b)",
//                 margin: 0,
//               }}
//             >
//               {subtitle}
//             </p>
//           )}
//         </div>
//       )}
//       <div style={{ flex: 1 }}>{children}</div>
//     </div>
//   );
// };
// export const myRenderers: CatalogRenderers<MyDefinitions> = {
//   Row: ({ props, children }) => {
//     const justifyMap: Record<string, string> = {
//       start: "flex-start",
//       center: "center",
//       end: "flex-end",
//       spaceBetween: "space-between",
//     };
//     const items = Array.isArray(props.children) ? props.children : [];
//     return (
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           gap: `${props.gap ?? 16}px`,
//           alignItems: props.align ?? "stretch",
//           justifyContent: justifyMap[props.justify ?? "start"] ?? "flex-start",
//           flexWrap: "wrap",
//           width: "100%",
//         }}
//       >
//         {items.map((id, i) => (
//           <div key={`${id}-${i}`} style={{ flex: "1 1 0", minWidth: 0 }}>
//             {children(id)}
//           </div>
//         ))}
//       </div>
//     );
//   },

//   Column: ({ props, children }) => {
//     const items = Array.isArray(props.children) ? props.children : [];
//     return (
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: `${props.gap ?? 12}px`,
//           width: "100%",
//         }}
//       >
//         {items.map((id, i) => (
//           <React.Fragment key={`${id}-${i}`}>{children(id)}</React.Fragment>
//         ))}
//       </div>
//     );
//   },

//   Text: ({ props }) => (
//     <span style={{ fontSize: "0.85rem", color: c.cardFg, lineHeight: 1.5 }}>
//       {props.text}
//     </span>
//   ),

//   Card: ({ props, children }) => (
//     // `data-testid="declarative-card"` stays shared so existing e2e selectors
//     // still find every card; `data-card-id={props.title}` disambiguates
//     // sibling cards (e.g. the at-risk pill's 3 severity cards) so test
//     // assertions can target a specific card by title.
//     <CardShell
//       title={props.title}
//       subtitle={props.subtitle}
//       testid="declarative-card"
//       cardId={props.title}
//     >
//       {props.child && children(props.child)}
//     </CardShell>
//   ),

//   StatusBadge: ({ props }) => {
//     const variant = props.variant ?? "info";
//     const Icon = {
//       error: TriangleAlert,
//       warning: CircleAlert,
//       success: CircleCheck,
//       info: Info,
//     }[variant];
//     return (
//       // `alignSelf: flex-start` keeps the pill content-sized — flex parents
//       // (our Column override) default to stretch, which inflates it into a
//       // full-width banner.
//       <Badge
//         variant={variant}
//         style={{ alignSelf: "flex-start" }}
//         data-testid="declarative-status-badge"
//       >
//         <Icon size={12} strokeWidth={2.5} style={{ marginRight: 4 }} />
//         {props.text}
//       </Badge>
//     );
//   },

//   Metric: ({ props }) => {
//     const trendColors: Record<string, string> = {
//       up: "#059669",
//       down: "#dc2626",
//       neutral: c.muted,
//     };
//     const trendIcons: Record<string, string> = {
//       up: "↑",
//       down: "↓",
//       neutral: "→",
//     };
//     return (
//       <div
//         data-testid="declarative-metric"
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: "4px",
//           minWidth: "120px",
//         }}
//       >
//         <span
//           style={{
//             fontSize: "0.75rem",
//             color: c.muted,
//             fontWeight: 500,
//             textTransform: "uppercase",
//             letterSpacing: "0.05em",
//           }}
//         >
//           {props.label}
//         </span>
//         <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
//           <span
//             style={{
//               fontSize: "1.5rem",
//               fontWeight: 700,
//               color: c.cardFg,
//               letterSpacing: "-0.02em",
//             }}
//           >
//             {props.value}
//           </span>
//           {props.trend && (
//             <span
//               style={{
//                 fontSize: "0.8rem",
//                 fontWeight: 500,
//                 color: trendColors[props.trend] ?? c.muted,
//               }}
//             >
//               {trendIcons[props.trend]}
//               {props.trendValue ? ` ${props.trendValue}` : ""}
//             </span>
//           )}
//         </div>
//       </div>
//     );
//   },

//   InfoRow: ({ props }) => (
//     // Divider via `border-b last:border-b-0` so the final row doesn't dangle
//     // a trailing line, regardless of whether the agent wraps these in a
//     // Column or drops them directly into a Card's child slot.
//     <div
//       data-testid="declarative-info-row"
//       className="flex items-baseline justify-between gap-4 py-2 border-b border-[var(--border)] last:border-b-0 last:pb-0 first:pt-0"
//     >
//       <span className="text-sm text-[var(--muted-foreground)]">
//         {props.label}
//       </span>
//       <span className="text-sm font-medium text-[var(--foreground)] text-right tabular-nums">
//         {props.value}
//       </span>
//     </div>
//   ),

//   DataTable: ({ props }) => {
//     const cols = Array.isArray(props.columns) ? props.columns : [];
//     const rows = Array.isArray(props.rows) ? props.rows : [];
//     return (
//       <div
//         data-testid="declarative-data-table"
//         className="w-full overflow-x-auto"
//       >
//         <table className="w-full border-collapse text-sm">
//           <thead>
//             <tr>
//               {cols.map((col) => (
//                 <th
//                   key={col.key}
//                   className="border-b-2 border-[var(--border)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
//                 >
//                   {col.label}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, i) => {
//               // Stable row key: prefer the first column's value (primary-key-ish),
//               // suffix with index in case values repeat, fall back to a JSON
//               // stringify of the row when columns is empty. Stable keys prevent
//               // React from re-mounting every row when the agent re-emits a
//               // slightly different table.
//               const pk = cols.length > 0 ? row[cols[0].key] : undefined;
//               const rowKey =
//                 pk !== undefined ? `${pk}-${i}` : JSON.stringify(row);
//               return (
//                 <tr
//                   key={rowKey}
//                   className="border-b border-[var(--border)] last:border-b-0"
//                 >
//                   {cols.map((col) => (
//                     <td
//                       key={col.key}
//                       className="px-3 py-2 tabular-nums text-[var(--foreground)]"
//                     >
//                       {String(row[col.key] ?? "")}
//                     </td>
//                   ))}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     );
//   },

//   PrimaryButton: ({ props, dispatch }) => (
//     <Button
//       onClick={() => {
//         if (props.action && dispatch) dispatch(props.action);
//       }}
//     >
//       {props.label}
//     </Button>
//   ),

//   PieChart: ({ props }) => {
//     // Coerce values to numbers — the LLM sometimes emits them as strings.
//     // Use a strict finite check so null/undefined/NaN/non-numeric strings are
//     // surfaced via console.warn rather than silently collapsed to 0 (which
//     // masks schema/data drift). Recharts requires a numeric value to render,
//     // so we fall back to 0 only after logging.
//     const data = (Array.isArray(props.data) ? props.data : []).map((d) => {
//       const raw = (d as { value?: unknown }).value;
//       const n = typeof raw === "number" ? raw : parseFloat(raw as string);
//       let value: number;
//       if (Number.isFinite(n)) {
//         value = n;
//       } else {
//         console.warn("Invalid chart value", {
//           component: "PieChart",
//           key: "value",
//           raw,
//         });
//         value = 0;
//       }
//       return { ...d, value };
//     });
//     return (
//       <CardShell
//         title={props.title}
//         subtitle={props.description}
//         testid="declarative-pie-chart"
//       >
//         {data.length === 0 ? (
//           <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
//             No data available
//           </div>
//         ) : (
//           <div style={{ width: "100%", height: 200 }}>
//             <ResponsiveContainer>
//               <RechartsPieChart>
//                 <Pie
//                   data={data}
//                   dataKey="value"
//                   nameKey="label"
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={40}
//                   outerRadius={80}
//                   paddingAngle={2}
//                 >
//                   {data.map((_, i) => (
//                     <Cell
//                       key={i}
//                       fill={CHART_COLORS[i % CHART_COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </RechartsPieChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </CardShell>
//     );
//   },

//   BarChart: ({ props }) => {
//     // Coerce values to numbers — the LLM sometimes emits them as strings,
//     // which recharts treats as categorical (unordered Y-axis ticks). Use a
//     // strict finite check so null/undefined/NaN/non-numeric strings are
//     // surfaced via console.warn rather than silently collapsed to 0 (which
//     // masks schema/data drift). Recharts requires a numeric value to render,
//     // so we fall back to 0 only after logging.
//     const data = (Array.isArray(props.data) ? props.data : []).map((d) => {
//       const raw = (d as { value?: unknown }).value;
//       const n = typeof raw === "number" ? raw : parseFloat(raw as string);
//       let value: number;
//       if (Number.isFinite(n)) {
//         value = n;
//       } else {
//         console.warn("Invalid chart value", {
//           component: "BarChart",
//           key: "value",
//           raw,
//         });
//         value = 0;
//       }
//       return { ...d, value };
//     });
//     return (
//       <CardShell
//         title={props.title}
//         subtitle={props.description}
//         testid="declarative-bar-chart"
//       >
//         {data.length === 0 ? (
//           <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
//             No data available
//           </div>
//         ) : (
//           <div style={{ width: "100%", height: 200 }}>
//             <ResponsiveContainer>
//               <RechartsBarChart data={data}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={c.divider} />
//                 <XAxis dataKey="label" tick={{ fontSize: 11, fill: c.muted }} />
//                 <YAxis tick={{ fontSize: 11, fill: c.muted }} />
//                 <Tooltip />
//                 <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
//               </RechartsBarChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </CardShell>
//     );
//   },
// };


"use client";

/**
 * A2UI catalog RENDERERS — React implementations for the custom components
 * declared in ./definitions. TypeScript enforces that the renderer map's
 * keys and prop shapes match the definitions exactly.
 *
 * Visual style: ShadCN aesthetic (neutral palette, rounded-xl, subtle
 * borders, clean typography). Tailwind utility classes only — no cn() /
 * cva helpers, no shadcn CLI install. Inline-cloned primitives live in
 * ../_components/.
 */
import React from "react";
import type { CatalogRenderers } from "@copilotkit/a2ui-renderer";

import type { Definitions } from "./definitions";
import { Card } from "./components/card.tsx";
import { Badge } from "./components/badge.tsx";
import { Button as UIButton } from "./components/button";
import { Separator } from "./components/separator";


// DynString props are typed as string | { path } (see definitions.ts), but
// the A2UI binder resolves path bindings before render — renderers only ever
// see resolved strings. One shared helper keeps that narrowing in one place.
const s = (v: unknown): string => (typeof v === "string" ? v : "");

export const renderers: CatalogRenderers<Definitions> = {
    /**
     * Card override: ShadCN-style outer container. The basic catalog's Card
     * uses inline styles; overriding here keeps the demo's tailwind aesthetic.
     * The flight schema renders Card > Column > [Title, Row, …]; the inner
     * Column adds the vertical spacing.
     */
    Card: ({ props, children }) => (
        <Card className="w-full max-w-md p-5" data-testid="a2ui-fixed-card">
            {props.child ? children(props.child) : null}
        </Card>
    ),
    Title: ({ props }) => (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                    Itinerary
                </p>
                <h3 className="text-base font-semibold leading-none tracking-tight text-neutral-900">
                    {s(props.text)}
                </h3>
            </div>
            <Badge variant="outline" className="font-mono">
                1-stop · economy
            </Badge>
        </div>
    ),
    Airport: ({ props }) => (
        <div className="flex flex-col items-center">
            <span className="font-mono text-2xl font-semibold tracking-wider text-neutral-900">
                {s(props.code)}
            </span>
        </div>
    ),
    Arrow: () => (
        <div className="flex flex-1 items-center px-3">
            <Separator className="flex-1 bg-neutral-200" />
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-1 text-neutral-400"
                aria-hidden
            >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </svg>
            <Separator className="flex-1 bg-neutral-200" />
        </div>
    ),
    AirlineBadge: ({ props }) => (
        <Badge variant="secondary" className="uppercase tracking-[0.08em]">
            {s(props.name)}
        </Badge>
    ),
    PriceTag: ({ props }) => (
        <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Total
            </span>
            <span className="font-mono text-base font-semibold text-neutral-900">
                {s(props.amount)}
            </span>
        </div>
    ),
    /**
     * Button override: this is a pure-presentation demo, so the button just
     * renders its label. The schema declares an action for visual fidelity,
     * but the click handler is inert until the Python SDK exposes
     * action_handlers= on a2ui.render (see src/agents/a2ui_fixed.py).
     */
    Button: ({ props, children }) => (
        <UIButton className="w-full">
            {props.child ? children(props.child) : null}
        </UIButton>
    ),
};