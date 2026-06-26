
// "use client"
// import { createCatalog } from "@copilotkit/a2ui-renderer";
// import { myDefinitions } from "./definitions";
// import { myRenderers } from "./renderers";
// export const myCatalog = createCatalog(myDefinitions, myRenderers, {
//     catalogId: "declarative-gen-ui-catalog",
//     includeBasicCatalog: true,
// });
"use client"
import { createCatalog } from "@copilotkit/a2ui-renderer";

import { definitions } from "./definitions";
import { renderers } from "./renderers";

export const CATALOG_ID = "copilotkit://flight-fixed-catalog";

export const catalog = createCatalog(definitions, renderers, {
  catalogId: CATALOG_ID,
  includeBasicCatalog: true,
});