// import { CopilotKit } from "@copilotkit/react-core/v2";
// import "@copilotkit/react-ui/v2/styles.css";
// import './globals.css';

// // ...

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <CopilotKit runtimeUrl="/api/copilotkit-voice"
//           agent="voice-demo"
//           useSingleEndpoint={false}
//           // The dev-only `<cpk-web-inspector>` overlay (auto-enabled on
//           // localhost via shouldShowDevConsole) intercepts pointer events
//           // on top of the voice sample-audio button, so dev/D5 probe runs
//           // can't click it through Playwright. Production isn't localhost
//           // so the inspector never mounts there — voice is D5 in prod and
//           // D4 locally for this reason alone. Disable explicitly here so
//           // the demo behaves the same in both environments.
//           enableInspector={false}
//         >
//           {children}
//         </CopilotKit>
//       </body>
//     </html>
//   );
// }
import { CopilotKit } from "@copilotkit/react-core/v2"; 
import "@copilotkit/react-ui/v2/styles.css";
import './globals.css';

// ...

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}