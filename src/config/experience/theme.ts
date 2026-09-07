import type { ThemeConfig } from './types'

export const themeConfig = {
  cssVariables: {
    '--cream': '#fff8e8',
    '--ink': '#38265e',
  },
  scene: {
    hemisphereSky: 0xfff7e6,
    hemisphereGround: 0x5a3c82,
    keyLight: 0xfff0cc,
    redRimLight: 0xff5b65,
    violetFillLight: 0x8f81ff,
    giftKraft: 0xd9a64c,
    shadowCenter: 'rgba(44, 27, 85, 0.58)',
    shadowMiddle: 'rgba(44, 27, 85, 0.28)',
    shadowEdge: 'rgba(44, 27, 85, 0)',
    revealFront: 0xfff8e8,
    revealSide: 0xa9333a,
    confetti: [0xfff8e8, 0xc9413a, 0xe8b94f, 0xa99ff3, 0x7f65dd],
  },
} as const satisfies ThemeConfig
