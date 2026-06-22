"use client";

import React from "react";

export type CatchallToolStatus = "executing" | "complete" | "error";

interface CustomCatchallRendererProps {
  name: string;
  parameters: any;
  status: CatchallToolStatus;
  result: any;
}

export function CustomCatchallRenderer({
  name,
  parameters,
  status,
  result,
}: CustomCatchallRendererProps) {
  // Format parameters and result as pretty JSON strings
  const formattedParams = typeof parameters === "object" ? JSON.stringify(parameters, null, 2) : String(parameters);
  
  let formattedResult = "";
  if (result) {
    try {
      // If result is a JSON string of a dictionary or array, parse and format it nicely
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      formattedResult = JSON.stringify(parsed, null, 2);
    } catch {
      formattedResult = String(result);
    }
  }

  // Determine status color/styling
  let statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  let statusLabel = "Running";
  if (status === "complete") {
    statusColor = "bg-green-500/10 text-green-500 border-green-500/20";
    statusLabel = "Completed";
  } else if (status === "error") {
    statusColor = "bg-red-500/10 text-red-500 border-red-500/20";
    statusLabel = "Error";
  }

  return (
    <div style={{
      width: "100%",
      maxWidth: "400px",
      margin: "1rem auto",
      padding: "1rem",
      borderRadius: "0.75rem",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(8px)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255, 255, 255, 0.5)" }}>
            Tool Execution
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: "600", fontFamily: "monospace", color: "#22d3ee" }}>
            {name}
          </span>
        </div>
        <span style={{
          fontSize: "0.75rem",
          fontWeight: "500",
          padding: "0.125rem 0.625rem",
          borderRadius: "9999px",
          border: "1px solid",
          background: status === "complete" ? "rgba(34, 197, 94, 0.1)" : status === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(234, 179, 8, 0.1)",
          borderColor: status === "complete" ? "rgba(34, 197, 94, 0.2)" : status === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(234, 179, 8, 0.2)",
          color: status === "complete" ? "#22c55e" : status === "error" ? "#ef4444" : "#eab308",
        }}>
          {statusLabel}
        </span>
      </div>

      {parameters && Object.keys(parameters).length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.7)", display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
            Input Arguments
          </span>
          <pre style={{
            fontSize: "0.75rem",
            background: "rgba(0, 0, 0, 0.4)",
            padding: "0.625rem",
            borderRadius: "0.5rem",
            overflowX: "auto",
            fontFamily: "monospace",
            color: "#6ee7b7",
            maxHeight: "128px",
            margin: 0,
          }}>
            {formattedParams}
          </pre>
        </div>
      )}

      {result && (
        <div>
          <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.7)", display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
            Result / Output
          </span>
          <pre style={{
            fontSize: "0.75rem",
            background: "rgba(0, 0, 0, 0.4)",
            padding: "0.625rem",
            borderRadius: "0.5rem",
            overflowX: "auto",
            fontFamily: "monospace",
            color: "#c084fc",
            maxHeight: "192px",
            margin: 0,
          }}>
            {formattedResult}
          </pre>
        </div>
      )}
    </div>
  );
}
