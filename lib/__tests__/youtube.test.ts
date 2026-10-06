import { describe, expect, it, vi } from "vitest";

// jsdom (dipendenza transitiva di lib/extract via lib/youtube) non è
// caricabile nell'ambiente Vite/SSR: si mocka perché i test qui coprono
// solo funzioni pure che non toccano il DOM.
vi.mock("jsdom", () => ({ JSDOM: class MockJSDOM {} }));

import { detectYouTubeKind } from "@/lib/youtube";

describe("youtube", () => {
  it("detectYouTubeKind classifica video, playlist e canali", () => {
    expect(detectYouTubeKind("https://www.youtube.com/watch?v=abcdefghijk")).toBe("video");
    expect(detectYouTubeKind("https://youtu.be/abcdefghijk")).toBe("video");
    expect(detectYouTubeKind("https://www.youtube.com/playlist?list=PL123")).toBe("playlist");
    expect(
      detectYouTubeKind("https://www.youtube.com/watch?v=abcdefghijk&list=PL123")
    ).toBe("playlist");
    expect(detectYouTubeKind("https://www.youtube.com/@canale")).toBe("channel");
    expect(detectYouTubeKind("https://www.youtube.com/channel/UC123")).toBe("channel");
  });
});
