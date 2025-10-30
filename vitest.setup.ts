/// <reference types="vitest" />
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

// Clean up DOM after each test
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Ensure API key is set for services that expect it during tests
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

// Mocks
// ----------

// matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// IntersectionObserver
class IntersectionObserverMock {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(private cb?: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

// Storage mocks
const storageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, value: string) => { store[key] = String(value); }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    get length() { return Object.keys(store).length; },
  } as Storage;
})();

Object.defineProperty(window, 'localStorage', { value: storageMock });
Object.defineProperty(window, 'sessionStorage', { value: storageMock });

// URL.createObjectURL
if (typeof window.URL?.createObjectURL === 'undefined') {
  // @ts-ignore
  Object.defineProperty(window.URL, 'createObjectURL', { value: vi.fn() });
}

// navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  configurable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
});

// MediaRecorder (simplified)
const MediaRecorderMock = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  requestData: vi.fn(),
  state: 'inactive' as any,
  ondataavailable: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onstart: null,
  onstop: null,
}));

Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  configurable: true,
  value: MediaRecorderMock,
});

export {};