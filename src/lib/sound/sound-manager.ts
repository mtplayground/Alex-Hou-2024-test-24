import { Howl, Howler } from "howler";

import { soundFeatureEnabled } from "@/lib/sound/sound-config";
import { useAppStore } from "@/store/use-app-store";

type Note = {
  frequency: number;
  duration: number;
  volume?: number;
};

type SoundBank = {
  click: Howl;
  ropeCreak: Howl;
  successChime: Howl;
};

const SAMPLE_RATE = 22_050;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function encodeWav(samples: number[]) {
  const bytesPerSample = 2;
  const dataLength = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  function writeString(offset: number, value: string) {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  samples.forEach((sample, index) => {
    view.setInt16(44 + index * bytesPerSample, sample, true);
  });

  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

function createWavDataUri(buildSamples: () => number[]) {
  return `data:audio/wav;base64,${arrayBufferToBase64(
    encodeWav(buildSamples()),
  )}`;
}

function createEnvelope(sampleCount: number, attack: number, release: number) {
  return (index: number) => {
    const attackSamples = Math.max(1, Math.floor(sampleCount * attack));
    const releaseSamples = Math.max(1, Math.floor(sampleCount * release));

    if (index < attackSamples) {
      return index / attackSamples;
    }

    if (index > sampleCount - releaseSamples) {
      return Math.max(0, (sampleCount - index) / releaseSamples);
    }

    return 1;
  };
}

function createClickSamples() {
  const duration = 0.09;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const envelope = createEnvelope(sampleCount, 0.08, 0.5);

  return Array.from({ length: sampleCount }, (_, index) => {
    const time = index / SAMPLE_RATE;
    const tone =
      Math.sin(2 * Math.PI * 880 * time) * 0.65 +
      Math.sin(2 * Math.PI * 1320 * time) * 0.22;

    return Math.round(tone * envelope(index) * 18_000);
  });
}

function createRopeCreakSamples() {
  const duration = 0.24;
  const sampleCount = Math.floor(SAMPLE_RATE * duration);
  const envelope = createEnvelope(sampleCount, 0.12, 0.38);

  return Array.from({ length: sampleCount }, (_, index) => {
    const time = index / SAMPLE_RATE;
    const wobble = Math.sin(2 * Math.PI * 2.6 * time);
    const frequency = 155 + wobble * 32;
    const primary = Math.sin(2 * Math.PI * frequency * time);
    const harmonic = Math.sin(2 * Math.PI * frequency * 2.2 * time) * 0.24;
    const rasp = Math.sin(2 * Math.PI * 46 * time) * 0.08;

    return Math.round(
      (primary * 0.55 + harmonic + rasp) * envelope(index) * 16_500,
    );
  });
}

function createSuccessChimeSamples() {
  const notes: Note[] = [
    { frequency: 523.25, duration: 0.11, volume: 0.6 },
    { frequency: 659.25, duration: 0.11, volume: 0.68 },
    { frequency: 783.99, duration: 0.16, volume: 0.72 },
  ];

  return notes.flatMap((note) => {
    const sampleCount = Math.floor(SAMPLE_RATE * note.duration);
    const envelope = createEnvelope(sampleCount, 0.12, 0.42);

    return Array.from({ length: sampleCount }, (_, index) => {
      const time = index / SAMPLE_RATE;
      const overtone =
        Math.sin(2 * Math.PI * note.frequency * time) * 0.7 +
        Math.sin(2 * Math.PI * note.frequency * 2 * time) * 0.2;

      return Math.round(
        overtone * envelope(index) * (note.volume ?? 0.65) * 16_500,
      );
    });
  });
}

class SoundManager {
  private readonly canUseAudio =
    soundFeatureEnabled && typeof window !== "undefined";

  private lastRopeCreakAt = 0;
  private readonly sounds: SoundBank | null;

  constructor() {
    this.sounds = this.canUseAudio
      ? {
          click: new Howl({
            preload: true,
            src: [createWavDataUri(createClickSamples)],
            volume: 0.2,
          }),
          ropeCreak: new Howl({
            preload: true,
            src: [createWavDataUri(createRopeCreakSamples)],
            volume: 0.22,
          }),
          successChime: new Howl({
            preload: true,
            src: [createWavDataUri(createSuccessChimeSamples)],
            volume: 0.24,
          }),
        }
      : null;

    this.syncMuteState();

    useAppStore.subscribe(() => {
      this.syncMuteState();
    });
  }

  isEnabled() {
    return this.canUseAudio && useAppStore.getState().soundEnabled;
  }

  private syncMuteState() {
    Howler.mute(!this.isEnabled());
  }

  playClick() {
    if (this.sounds === null || !this.isEnabled()) {
      return;
    }

    this.sounds.click.play();
  }

  playRopeCreak(intensity = 0.5) {
    if (this.sounds === null || !this.isEnabled()) {
      return;
    }

    const now = window.performance.now();

    if (now - this.lastRopeCreakAt < 140) {
      return;
    }

    const playbackId = this.sounds.ropeCreak.play();
    const normalizedIntensity = clamp(intensity, 0.15, 1);

    this.sounds.ropeCreak.rate(0.88 + normalizedIntensity * 0.24, playbackId);
    this.sounds.ropeCreak.volume(0.15 + normalizedIntensity * 0.15, playbackId);
    this.lastRopeCreakAt = now;
  }

  playSuccessChime() {
    if (this.sounds === null || !this.isEnabled()) {
      return;
    }

    this.sounds.successChime.play();
  }
}

export const soundManager = new SoundManager();
