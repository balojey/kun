'use client';

import { useCallback, useMemo } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import { useTheme } from 'next-themes';

export function ParticleBackground() {
  const { theme } = useTheme();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(() => ({
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: false,
        },
        onHover: {
          enable: true,
          mode: 'repulse',
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: theme === 'dark' ? '#60A5FA' : '#3B82F6',
      },
      links: {
        color: theme === 'dark' ? '#60A5FA' : '#3B82F6',
        distance: 150,
        enable: true,
        opacity: theme === 'dark' ? 0.2 : 0.1,
        width: 1,
      },
      move: {
        direction: 'none' as const,
        enable: true,
        outModes: {
          default: 'bounce' as const,
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 50,
      },
      opacity: {
        value: theme === 'dark' ? 0.3 : 0.2,
      },
      shape: {
        type: 'circle' as const,
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  }), [theme]);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={options}
      className="absolute inset-0 -z-10"
    />
  );
}