import type { ContentConfig } from './types'

export const contentConfig = {
    languageSelection: {
        ariaLabel: 'Choisir votre langue / Choose your language',
        options: [
            { locale: 'fr', label: 'Français', compactLabel: 'FR' },
            { locale: 'en', label: 'English', compactLabel: 'EN' },
        ],
    },
    locales: {
        fr: {
            overlay: {
                signature: 'Arthur Jenck - Développeur créatif',
                availability:
                    'En recherche d’une alternance pour mon mastère Expert en Création Numérique Interactive à Gobelins - rythme 2 semaines / 2 semaines.',
                contact: {
                    label: 'Restons en contact',
                    email: 'contact@arthurjenck.com',
                },
                links: [
                    {
                        label: 'arthurjenck.com',
                        href: 'https://arthurjenck.com',
                    },
                    { label: 'GitHub', href: 'https://github.com/ArthurJenck' },
                    {
                        label: 'LinkedIn',
                        href: 'https://www.linkedin.com/in/arthurjenck/?skipRedirect=true',
                    },
                ],
                professionalLinksLabel: 'Liens professionnels',
            },
            revealText: {
                lines: ['FÉLICITATIONS,', 'VOUS AVEZ GAGNÉ', 'UN SUPER ALTERNANT !'],
            },
            loading: {
                message: 'Chargement...',
                failureMessage: 'Échec du chargement.',
                failureDetail: 'Vérifiez votre connexion, puis relancez la page.',
                retryLabel: 'Réessayer',
                reloadLabel: 'Recharger',
            },
            accessibility: {
                closedCanvasLabel: 'Scène 3D de cadeau, appuyez pour l’ouvrir.',
                openedCanvasLabel:
                    'Cadeau ouvert. Les liens professionnels sont affichés sous la scène.',
                languageSwitcherLabel: 'Changer de langue',
            },
            document: {
                title: 'Ouvrez pour une surprise !',
                description: 'Ouvrez pour une surprise !',
            },
        },
        en: {
            overlay: {
                signature: 'Arthur Jenck - Creative Developer',
                availability:
                    "Looking for a work-study position as part of my Master's degree in Interactive Digital Creation at Gobelins, alternating two weeks at school and two weeks at work.",
                contact: {
                    label: "Let's keep in touch",
                    email: 'contact@arthurjenck.com',
                },
                links: [
                    {
                        label: 'arthurjenck.com',
                        href: 'https://arthurjenck.com',
                    },
                    { label: 'GitHub', href: 'https://github.com/ArthurJenck' },
                    {
                        label: 'LinkedIn',
                        href: 'https://www.linkedin.com/in/arthurjenck/?skipRedirect=true',
                    },
                ],
                professionalLinksLabel: 'Professional links',
            },
            revealText: {
                lines: [
                    'CONGRATULATIONS,',
                    "YOU'VE WON A GREAT",
                    'WORK-STUDY STUDENT!',
                ],
                maximumWidth: 4.7,
            },
            loading: {
                message: 'Loading...',
                failureMessage: 'Loading failed.',
                failureDetail: 'Check your connection, then reload the page.',
                retryLabel: 'Try again',
                reloadLabel: 'Reload',
            },
            accessibility: {
                closedCanvasLabel: '3D gift scene, press to open.',
                openedCanvasLabel:
                    'Gift opened. Professional links are displayed below the scene.',
                languageSwitcherLabel: 'Change language',
            },
            document: {
                title: 'Open for a surprise!',
                description: 'Open for a surprise!',
            },
        },
    },
} as const satisfies ContentConfig
