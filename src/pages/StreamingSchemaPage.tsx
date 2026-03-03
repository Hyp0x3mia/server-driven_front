import React, { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { StreamingSchemaRenderer } from "../renderer/StreamingSchemaRenderer";
import { Navbar } from "../components/layout/Navbar";
import { useStreamingGeneration } from "../lib/useStreamingGeneration";

export default function StreamingSchemaPage() {
  const { topic } = useParams();

  // Build request from URL params (memoized to prevent re-renders)
  const request = useMemo(() => ({
    topic: topic || "Introduction to Machine Learning",
    target_audience: "general learners",
    difficulty: "intermediate" as const,
    max_sections: 6,
    include_interactive: true
  }), [topic]);

  const { state, startStreaming, cancel } = useStreamingGeneration(request);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Only start once
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startStreaming();
    }

    return () => {
      cancel();
    };
  }, [startStreaming, cancel]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#1e40af44,transparent)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          title={request.topic}
          isEditing={false}
          onToggleEdit={() => {}}
        />

        <main className="w-full px-6 pt-8 pb-24 flex-grow">
          <StreamingSchemaRenderer
            skeleton={state.skeleton}
            blocks={state.blocks}
            isComplete={state.isComplete}
            currentStage={state.currentStage}
            error={state.error}
            metadata={state.metadata}
            lastHeartbeat={state.lastHeartbeat}
            progress={state.progress}
          />
        </main>
      </div>
    </div>
  );
}
