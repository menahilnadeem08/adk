"use client";

import React, { useState } from "react";

// Local self-contained UI components
function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
        padding: "20px",
        color: "#1e293b",
        fontFamily: "sans-serif",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} style={{ marginBottom: "16px", ...props.style }} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={className}
      style={{
        margin: 0,
        fontSize: "18px",
        fontWeight: 600,
        color: "#0f172a",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={className}
      style={{
        margin: "4px 0 0 0",
        fontSize: "13px",
        color: "#64748b",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}

function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "ghost";
  size?: "sm";
}

function Button({ className, variant, size, children, ...props }: ButtonProps) {
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  
  const baseStyle: React.CSSProperties = {
    padding: size === "sm" ? "6px 12px" : "10px 16px",
    fontSize: size === "sm" ? "12px" : "14px",
    borderRadius: "10px",
    fontWeight: 500,
    cursor: props.disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left" as const,
  };

  const outlineStyle: React.CSSProperties = {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
  };

  const ghostStyle: React.CSSProperties = {
    color: "#64748b",
    textAlign: "center" as const,
  };

  const combinedStyle = {
    ...baseStyle,
    ...(isOutline ? outlineStyle : {}),
    ...(isGhost ? ghostStyle : {}),
    ...props.style,
  };

  return (
    <button className={className} style={combinedStyle} {...props}>
      {children}
    </button>
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "destructive" | "success" | "outline";
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const isDestructive = variant === "destructive";
  const isSuccess = variant === "success";
  
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 600,
    lineHeight: 1,
    border: "1px solid #cbd5e1",
    background: "#f1f5f9",
    color: "#475569",
    width: "fit-content",
  };

  const destructiveStyle: React.CSSProperties = {
    background: "#fee2e2",
    color: "#ef4444",
    border: "1px solid #fca5a5",
  };

  const successStyle: React.CSSProperties = {
    background: "#dcfce7",
    color: "#22c55e",
    border: "1px solid #86efac",
  };

  const combinedStyle = {
    ...baseStyle,
    ...(isDestructive ? destructiveStyle : {}),
    ...(isSuccess ? successStyle : {}),
    ...props.style,
  };

  return (
    <span className={className} style={combinedStyle} {...props}>
      {children}
    </span>
  );
}

export interface TimeSlot {
  label: string;
  iso: string;
}

export interface TimePickerCardProps {
  topic: string;
  attendee?: string;
  slots?: TimeSlot[];
  onSubmit: (
    result: { chosen_time: string; chosen_label: string } | { cancelled: true },
  ) => void;
}

const DEFAULT_SLOTS: TimeSlot[] = [
  { label: "Monday, 10:00 AM", iso: "2026-06-29T10:00:00Z" },
  { label: "Monday, 2:00 PM", iso: "2026-06-29T14:00:00Z" },
  { label: "Tuesday, 11:00 AM", iso: "2026-06-30T11:00:00Z" },
  { label: "Wednesday, 3:00 PM", iso: "2026-07-01T15:00:00Z" },
];

export function TimePickerCard({
  topic,
  attendee,
  slots = DEFAULT_SLOTS,
  onSubmit,
}: TimePickerCardProps) {
  const [picked, setPicked] = useState<TimeSlot | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const disabled = picked !== null || cancelled;

  if (cancelled) {
    return (
      <Card className="max-w-md" data-testid="time-picker-cancelled">
        <CardContent className="flex items-center gap-2 p-4 pt-4">
          <Badge variant="destructive">Cancelled</Badge>
          <span className="text-sm text-neutral-600">No time picked.</span>
        </CardContent>
      </Card>
    );
  }

  if (picked) {
    return (
      <Card
        className="max-w-md border-emerald-200 bg-emerald-50/40"
        data-testid="time-picker-picked"
      >
        <CardContent className="flex items-center gap-2 p-4 pt-4">
          <Badge variant="success">Booked</Badge>
          <span className="text-sm text-neutral-800">
            <span className="font-semibold">{picked.label}</span>
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md" data-testid="time-picker-card">
      <CardHeader>
        <div className="flex items-center justify-between" style={{ display: "flex", justifyContent: "space-between" }}>
          <Badge variant="outline">Book a call</Badge>
          {attendee && (
            <span className="text-xs text-neutral-500">With {attendee}</span>
          )}
        </div>
        <CardTitle className="pt-1">{topic}</CardTitle>
        <CardDescription>Pick a time that works for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {slots.map((s) => (
            <Button
              key={s.iso}
              variant="outline"
              disabled={disabled}
              data-testid="time-picker-slot"
              onClick={() => {
                setPicked(s);
                onSubmit({ chosen_time: s.iso, chosen_label: s.label });
              }}
              className="justify-start"
            >
              {s.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => {
            setCancelled(true);
            onSubmit({ cancelled: true });
          }}
          className="mt-3 w-full text-neutral-500"
          data-testid="time-picker-cancel"
        >
          None of these work
        </Button>
      </CardContent>
    </Card>
  );
}
