import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'vite',
  buildCommand: 'pnpm build',
  headers: [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, nofollow',
        },
      ],
    },
  ],
}

