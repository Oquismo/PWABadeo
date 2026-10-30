import { act, createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HeroSection from '../HeroSection';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    refreshAvatar: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'common.greetings.morning': 'Buenos días',
        'common.greetings.afternoon': 'Buenas tardes',
        'common.greetings.evening': 'Buenas noches',
      })[key] ?? '',
    language: 'es',
  }),
}));

vi.mock('@/components/home/NotificationsPanel', () => ({
  default: () => null,
}));

describe('HeroSection hydration', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('hydrates without text mismatch when build time and client time are in different parts of the day', async () => {
    vi.useFakeTimers();

    // Server/build prerenders at 09:00 ("Buenos días")
    vi.setSystemTime(new Date('2026-10-30T09:00:00'));
    const serverHtml = renderToString(createElement(HeroSection));

    // Client hydrates at 15:00 ("Buenas tardes")
    vi.setSystemTime(new Date('2026-10-30T15:00:00'));
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    const hydrationErrors: string[] = [];
    const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      const msg = args.map(String).join(' ');
      if (msg.includes('did not match') || msg.includes('Hydration') || msg.includes('hydrat')) {
        hydrationErrors.push(msg);
      }
    });

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, createElement(HeroSection));
    });

    expect(hydrationErrors).toEqual([]);
    expect(container.querySelector('h1')?.textContent).toBe('Buenas tardes');

    await act(async () => {
      root?.unmount();
    });
    container.remove();
    errorSpy.mockRestore();
  });
});
