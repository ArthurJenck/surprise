# surprise

Expérience 3D mobile-first conçue pour les rencontres de la Three.js Conf.

## Développement

```bash
pnpm install
pnpm dev
```

## Vérification

```bash
pnpm test
pnpm build
```

La page utilise Vue 3 et Three.js. Un fallback HTML natif reste accessible si JavaScript est désactivé. Les erreurs WebGL ou de chargement affichent une relance qui ne révèle pas le cadeau. Vercel Web Analytics est injecté uniquement sur le build de production et doit être activé dans le dashboard Vercel après le premier déploiement.

## Crédit du modèle 3D

Le modèle [gift loot box thing wip](https://sketchfab.com/3d-models/gift-loot-box-thing-wip-d634252e1a254057ad8861b6e7786f1f) a été créé par [Damco](https://sketchfab.com/jondameron5) et est utilisé sous licence [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

Modifications apportées pour ce projet : suppression de la texture bleue inutilisée, remplacement du matériau par un matériau PBR jaune kraft, adaptation de l’échelle et du rythme de l’animation, ajout d’un intérieur sombre, d’un ruban rouge animé, de lumières et d’effets de révélation.

La copie optimisée utilisée par la page peut être régénérée avec `pnpm optimize:model`.
