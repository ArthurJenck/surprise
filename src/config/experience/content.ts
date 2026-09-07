import type { ContentConfig } from './types'

export const contentConfig = {
    overlay: {
        signature: 'Arthur Jenck - Développeur créatif',
        links: [
            { label: 'arthurjenck.com', href: 'https://arthurjenck.com' },
            { label: 'GitHub', href: 'https://github.com/ArthurJenck' },
            {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/arthurjenck/?skipRedirect=true',
            },
        ],
    },
    revealText: {
        lines: ['FÉLICITATIONS,', 'VOUS AVEZ GAGNÉ', 'UN SUPER ALTERNANT !'],
    },
} as const satisfies ContentConfig
