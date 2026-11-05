"use client";

import { useEffect, useRef, useState } from "react";
import type { DawClip, DawDocument, DawProject } from "@/lib/daw";

const STEPS = 16;
const PITCHES = [60, 62, 64, 67, 69, 72];
const PITCH_NAMES = ["C", "D", "E", "G", "A", "C"];

type DawStudioProps = {
  initialProjects: DawProject[];
};

function noteAt(notes: DawDocument["notes"], step: number) {
  return notes.find((note) => note.step === step) ?? null;
}

export function DawStudio({ initialProjects }: DawStudioProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [project, setProject] = useState<DawProject | null>(initialProjects[0] ?? null);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const projectRef = useRef(project);
  const bedRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => () => stop(), []);

  function context() {
    if (!audioRef.current) audioRef.current = new AudioContext();
    return audioRef.current;
  }

  function blip(frequency: number, duration: number, type: OscillatorType, gainValue: number) {
    const ctx = context();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  function hat() {
    const ctx = context();
    const length = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }

  function playStep(index: number, document: DawDocument) {
    for (const channel of document.channels) {
      if (!channel.steps[index]) continue;
      if (channel.id === "kick") blip(90, 0.18, "sine", 0.9);
      else if (channel.id === "snare") blip(220, 0.08, "triangle", 0.35);
      else hat();
    }
    const note = noteAt(document.notes, index);
    if (note) blip(440 * 2 ** ((note.pitch - 69) / 12), 0.22, "triangle", 0.25);
  }

  function stop() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    bedRef.current?.pause();
    setPlaying(false);
  }

  function play() {
    const current = projectRef.current;
    if (!current) return;
    void context().resume();
    const clip = current.document.clips.find((item) => item.id === current.document.activeClipId);
    if (clip) {
      const bed = bedRef.current ?? new Audio();
      bed.src = clip.url;
      bed.loop = true;
      bedRef.current = bed;
      void bed.play().catch(() => undefined);
    }
    stepRef.current = 0;
    setStep(0);
    playStep(0, current.document);
    const ms = (60_000 / current.bpm) / 4;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const live = projectRef.current;
      if (!live) return;
      const next = (stepRef.current + 1) % STEPS;
      stepRef.current = next;
      setStep(next);
      playStep(next, live.document);
    }, ms);
    setPlaying(true);
  }

  function update(next: DawProject) {
    setProject(next);
    setProjects((list) => list.map((item) => (item.id === next.id ? next : item)));
  }

  function toggleStep(channelId: string, index: number) {
    if (!project) return;
    update({
      ...project,
      document: {
        ...project.document,
        channels: project.document.channels.map((channel) => {
          if (channel.id !== channelId) return channel;
          const steps = [...channel.steps];
          steps[index] = !steps[index];
          return { ...channel, steps };
        }),
      },
    });
  }

  function cycleNote(index: number) {
    if (!project) return;
    const existing = noteAt(project.document.notes, index);
    const notes = project.document.notes.filter((note) => note.step !== index);
    if (!existing) notes.push({ step: index, pitch: PITCHES[0] });
    else {
      const at = PITCHES.indexOf(existing.pitch);
      if (at >= 0 && at < PITCHES.length - 1) notes.push({ step: index, pitch: PITCHES[at + 1] });
    }
    update({ ...project, document: { ...project.document, notes } });
  }

  async function createProject() {
    setPending(true);
    const response = await fetch("/api/daw/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Untitled beat" }),
    });
    const data = (await response.json()) as { project?: DawProject };
    setPending(false);
    if (!data.project) return;
    setProjects((list) => [data.project!, ...list]);
    setProject(data.project);
    setStatus("Cloud project created");
  }

  async function save() {
    if (!project) return;
    setPending(true);
    setStatus("");
    const response = await fetch(`/api/daw/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    const data = (await response.json()) as { revision?: number; project?: DawProject; error?: string };
    setPending(false);
    if (response.status === 409 && data.project) {
      update(data.project);
      setStatus("Pulled a newer version from another device");
      return;
    }
    if (!response.ok || !data.revision) {
      setStatus(data.error ?? "Could not save");
      return;
    }
    update({ ...project, revision: data.revision });
    setStatus(`Synced · rev ${data.revision}`);
  }

  async function upload(file: File) {
    if (!project) return;
    setPending(true);
    const body = new FormData();
    body.set("audio", file);
    const response = await fetch("/api/daw/upload", { method: "POST", body });
    const data = (await response.json()) as { clip?: DawClip; error?: string };
    setPending(false);
    if (!data.clip) {
      setStatus(data.error ?? "Upload failed");
      return;
    }
    update({
      ...project,
      document: {
        ...project.document,
        clips: [...project.document.clips, data.clip],
        activeClipId: data.clip.id,
      },
    });
    setStatus("Uploaded to the cloud project");
  }

  function downloadSync() {
    if (!project) return;
    const blob = new Blob([JSON.stringify({ veltaDaw: 1, ...project }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.velta.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-sky-400">Velta Web DAW</p>
          <h1 className="text-2xl font-bold tracking-tight">Finish the beat</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-zinc-950" onClick={() => (playing ? stop() : play())} disabled={!project}>
            {playing ? "Stop" : "Play"}
          </button>
          <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-sm" onClick={save} disabled={!project || pending}>
            {pending ? "Working" : "Save cloud"}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1 text-sm">
          <span className="text-muted-foreground">Cloud projects</span>
          <select
            className="mt-1 h-11 w-full rounded-md border border-white/10 bg-zinc-900 px-3"
            value={project?.id ?? ""}
            onChange={(event) => {
              stop();
              setProject(projects.find((item) => item.id === event.target.value) ?? null);
            }}
          >
            {projects.length === 0 ? <option value="">No projects yet</option> : null}
            {projects.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="h-11 rounded-lg border border-white/10 px-4 text-sm" onClick={createProject} disabled={pending}>
          New
        </button>
        {project ? (
          <>
            <label className="block text-sm">
              <span className="text-muted-foreground">Name</span>
              <input
                className="mt-1 h-11 w-full rounded-md border border-white/10 bg-zinc-900 px-3 sm:w-48"
                value={project.name}
                onChange={(event) => update({ ...project, name: event.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">BPM</span>
              <input
                type="number"
                min={60}
                max={200}
                className="mt-1 h-11 w-24 rounded-md border border-white/10 bg-zinc-900 px-3"
                value={project.bpm}
                onChange={(event) => update({ ...project, bpm: Number(event.target.value) })}
              />
            </label>
          </>
        ) : null}
      </div>

      {project ? (
        <>
          <section className="space-y-3 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/50 p-3">
            {project.document.channels.map((channel) => (
              <div key={channel.id} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs text-muted-foreground">{channel.name}</span>
                <div className="flex gap-1">
                  {channel.steps.map((on, index) => (
                    <button
                      key={`${channel.id}-${index}`}
                      type="button"
                      aria-label={`${channel.name} step ${index + 1}`}
                      onClick={() => toggleStep(channel.id, index)}
                      className={`h-11 w-8 rounded-md border sm:w-9 ${
                        on
                          ? "border-sky-400 bg-sky-500"
                          : index === step && playing
                            ? "border-white/30 bg-white/10"
                            : "border-white/10 bg-zinc-950"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-xs text-muted-foreground">Melody</span>
              <div className="flex gap-1">
                {Array.from({ length: STEPS }, (_, index) => {
                  const note = noteAt(project.document.notes, index);
                  const label = note ? PITCH_NAMES[PITCHES.indexOf(note.pitch)] ?? "•" : "·";
                  return (
                    <button
                      key={`melody-${index}`}
                      type="button"
                      onClick={() => cycleNote(index)}
                      className={`h-11 w-8 rounded-md border text-[10px] font-semibold sm:w-9 ${
                        note ? "border-sky-400 bg-sky-500/20 text-sky-200" : "border-white/10 bg-zinc-950 text-zinc-500"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Phone upload</h2>
                <p className="text-xs text-muted-foreground">Record or pick a voice note, loop, or stem. It stays on this cloud project.</p>
              </div>
              <label className="inline-flex h-11 cursor-pointer items-center rounded-lg bg-white px-4 text-sm font-semibold text-zinc-950">
                Upload audio
                <input
                  type="file"
                  accept="audio/*"
                  capture
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <ul className="mt-3 space-y-2">
              {project.document.clips.map((clip) => (
                <li key={clip.id} className="flex items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    className={clip.id === project.document.activeClipId ? "text-sky-300" : "text-muted-foreground"}
                    onClick={() => update({ ...project, document: { ...project.document, activeClipId: clip.id } })}
                  >
                    {clip.name}
                  </button>
                  <audio src={clip.url} controls preload="none" className="h-8 max-w-[180px]" />
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <button type="button" className="underline" onClick={downloadSync}>Download sync file</button>
            <span>Rev {project.revision}. The same login sees this project in the browser and on a phone.</span>
            {status ? <span className="text-sky-300">{status}</span> : null}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Create a cloud project to start a beat.</p>
      )}
    </div>
  );
}
