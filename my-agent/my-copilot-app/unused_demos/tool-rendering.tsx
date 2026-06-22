import React from "react";
import {
    CopilotKit,
    CopilotChat,
    useRenderTool,
    useDefaultRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { WeatherCard } from "./weather-card";
import { FlightListCard, type Flight } from "./flight-list-card";
import { StockCard } from "./stock-card";
import { D20Card } from "./d20-card";
import {
    CustomCatchallRenderer,
    type CatchallToolStatus,
} from "./custom-catchall-renderer";
import { parseJsonResult } from "../_shared/parse-json-result";
import { useSuggestions } from "./suggestions";

interface WeatherResult {
    city?: string;
    temperature?: number;
    humidity?: number;
    wind_speed?: number;
    conditions?: string;
}

interface FlightSearchResult {
    origin?: string;
    destination?: string;
    flights?: Flight[];
}

interface StockResult {
    ticker?: string;
    price_usd?: number;
    change_pct?: number;
}

interface D20Result {
    value?: number;
    result?: number;
    sides?: number;
}

export default function ToolRenderingDemo() {
    return (
        <CopilotKit runtimeUrl="/api/copilotkit" agent="tool-rendering">
            <div className="flex justify-center items-center h-screen w-full">
                <div className="h-full w-full max-w-4xl">
                    <Chat />
                </div>
            </div>
        </CopilotKit>
    );
}

function Chat() {
    // Per-tool renderer #1: get_weather → branded WeatherCard.
    useRenderTool(
        {
            name: "get_weather",
            parameters: z.object({
                location: z.string(),
            }),
            render: ({ parameters, result, status }) => {
                const loading = status !== "complete";
                const parsed = parseJsonResult<WeatherResult>(result);
                return (
                    <WeatherCard
                        loading={loading}
                        location={parameters?.location ?? parsed.city ?? ""}
                        temperature={parsed.temperature}
                        humidity={parsed.humidity}
                        windSpeed={parsed.wind_speed}
                        conditions={parsed.conditions}
                    />
                );
            },
        },
        [],
    );
}