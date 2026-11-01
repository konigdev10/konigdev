# SPEC — Animations au scroll et footer KoniGDeV

## Objectif
Faire apparaître progressivement les contenus des sections du portfolio pendant le défilement, dans le style sombre et éditorial déjà en place. Remplacer le footer actuel par une signature typographique grand format « KoniGDeV » et des liens vers les réseaux sociaux.

## Périmètre UI
- Conserver l’ordre et le contenu des sections de la page d’accueil (`app/page.tsx`).
- Ajouter des révélations discrètes aux éléments de contenu encore statiques des sections Services, Projets, À propos et Contact : opacité et faible translation verticale, avec un décalage léger et ordonné pour les groupes. Réutiliser Framer Motion et la courbe éditoriale existante (`[0.22, 1, 0.36, 1]`).
- Déclencher chaque révélation une seule fois à l’entrée dans la zone visible. Conserver les animations `whileInView` déjà présentes sur les cartes et éviter les animations imbriquées redondantes. Ne pas ajouter de défilement forcé ni animer le contenu du Hero une seconde fois : il possède déjà ses animations d’entrée et de parallaxe.
- Respecter `prefers-reduced-motion` : aucun déplacement/parallaxe/révélation animée lorsque cette préférence est active; le contenu reste immédiatement visible. Les animations au survol des lettres doivent aussi être désactivées ou ramenées à un état statique.
- Remplacer le footer par une composition responsive comprenant uniquement :
  1. le mot-symbole visible « KoniGDeV », très grand, sur une ligne si l’espace le permet et pouvant se replier proprement sur petit écran ;
  2. les liens sociaux GitHub, LinkedIn et TikTok déjà référencés dans `components/Footer.tsx`.
- Animer les lettres individuellement au survol (petit rebond/rotation ou changement de couleur, sans déplacement durable de la mise en page). Rendre l’interaction accessible au clavier avec un focus visible et des libellés accessibles; elle ne doit pas nécessiter un pointeur sur écran tactile.
- Préserver la palette et les jetons CSS en place. Les liens externes conservent `target="_blank"` et `rel="noopener noreferrer"`.
- Retirer du footer la navigation, les canaux directs (WhatsApp, email, GitHub en doublon), la localisation, le texte de présentation et la ligne de copyright : le contrat « réseaux sociaux uniquement » réserve le footer au mot-symbole et aux réseaux sociaux.

## Stack et conventions vérifiées
- Next.js 14 App Router, React 18, TypeScript strict, Tailwind CSS.
- Framer Motion est déjà installé et utilisé par les composants interactifs; Lenis gère le scroll fluide. Ne pas ajouter de dépendance.
- Les sections et le footer sont assemblés dans `app/page.tsx`. Les composants interactifs existants utilisent `"use client"`, `motion`, la courbe `EDITORIAL_EASE` et, pour les révélations, `viewport={{ once: true, margin: ... }}`.
- Les styles partagés et couleurs sont définis dans `app/globals.css` et `tailwind.config.ts`. `components/SmoothScroll.tsx` désactive déjà Lenis pour la préférence de mouvement réduit; `Hero.tsx` la prend également en compte. Les nouvelles révélations doivent respecter cette même préférence.
- Les URL source sociales sont dans `components/Footer.tsx`; GitHub est également disponible via `SITE_CONFIG.github.url` dans `lib/constants.ts`.

## Fichiers concernés
- `components/Services.tsx`, `components/PortfolioProject.tsx`, `components/About.tsx`, `components/Contact.tsx` : compléter les révélations des titres et contenus statiques sans doubler celles déjà présentes.
- `components/Footer.tsx` : remplacer la structure et le contenu actuels par le mot-symbole animé et les trois réseaux sociaux.
- Éventuellement `components/ScrollReveal.tsx` : petit composant partagé si cela réduit la duplication; rester dans les conventions Framer Motion et TypeScript existantes.
- `app/globals.css` : uniquement si un style responsive ou une règle de mouvement réduit ne peut pas être exprimé proprement avec les utilitaires/conventions actuels.
- `SPEC.md` : contrat de la fonctionnalité.

## Plan court
1. **Frontend** — Ajouter les révélations manquantes aux sections de la page d’accueil, en conservant le comportement déjà présent et en couvrant le mouvement réduit.
2. **Frontend** — Refaire `Footer.tsx` selon le contrat : wordmark KoniGDeV, animation des lettres accessible et uniquement les liens GitHub, LinkedIn et TikTok.
3. **Vérification** — Contrôler le rendu responsive, clavier/focus, préférences de mouvement réduit, déclenchement au scroll unique, et exécuter `npx tsc --noEmit`, `npm run lint` et `npm run build`.

## Critères d’acceptation
- Les éléments statiques visés apparaissent au premier passage dans la zone visible; les cartes déjà animées ne connaissent ni double transition ni flash caché avant hydratation.
- Tout le contenu reste visible avec mouvement réduit, et Lenis conserve son comportement actuel.
- Le footer n’affiche que « KoniGDeV » et les trois liens sociaux, avec des cibles facilement activables au clavier et sur mobile.
- Le rendu reste lisible et sans débordement à 360 px; les lettres ne provoquent pas de déplacement de mise en page.
- TypeScript, lint et build passent.

## Addendum proposé — Mode clair et Hero éditorial KoniGDeV

### Objectif
Faire évoluer la page d’accueil vers un mode clair cohérent sur l’ensemble du site, puis réorganiser le Hero selon la référence décrite : fond blanc chaud, nom XXL bordeaux, portrait détouré au centre, accroche à gauche, services à droite, navigation discrète en haut et technologies en bas. Adapter l’ensemble à l’identité KoniGDeV sans changer le contenu fonctionnel ni supprimer les animations/accessibilités déjà prévues dans le contrat initial.

### Direction visuelle et périmètre
- Palette proposée : fond ivoire chaud `#FBF8F7`, surfaces `#FFFFFF` / `#F5F0F0`, texte `#201A1B` / `#6B5E60`, garnet `#7A1F2B`, survol garnet `#5E1721`, contours brun-gris à faible opacité.
- `Hero.tsx` : composition responsive en trois zones autour du portrait; nom « Esdras Thychel MBOULOUKOUE » en typographie très grande garnet, accroche et CTA à gauche, résumé des services à droite, technologies existantes conservées en bas. Réutiliser et vérifier en priorité `public/user-avatar-cutout.jpeg` ou `public/hero-avatar.jpeg`; ne pas inventer ni générer un portrait.
- Conserver la navigation existante (`Navbar.tsx`), les sections et leur ordre (`app/page.tsx`), le footer et le système d’animations; harmoniser leurs couleurs avec les nouveaux jetons.
- Préserver le mouvement réduit, les contrastes lisibles, les états sémantiques (notamment succès/erreur et WhatsApp) et le comportement responsive.

### Fichiers à couvrir
- `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx` : jetons clairs, ombres, sélection, focus et styles globaux.
- `components/Hero.tsx` : nouvelle composition et choix du portrait existant.
- `components/Navbar.tsx`, `components/Services.tsx`, `components/PortfolioProject.tsx`, `components/About.tsx`, `components/Contact.tsx`, `components/Footer.tsx` : cohérence de surface et de couleur.
- `app/page.tsx` : vérifier seulement que l’assemblage existant fournit les zones attendues; ne modifier que si la composition l’exige.
- Écarter de ce périmètre les composants non montés par la page active (`Header.tsx`, `Method.tsx`, `Stack.tsx`, `ProjectEstimator.tsx`), sauf décision explicite de les réactiver.

### Critères d’acceptation proposés
- Toutes les sections actives, contrôles et footer sont lisibles sur fond clair; le garnet sert d’accent de marque avec contraste suffisant.
- Le Hero présente les six éléments demandés, sans collision ni débordement à 360 px, et s’adapte aux écrans larges et mobiles.
- Le portrait central est un asset local existant effectivement détouré; les technologies restent lisibles en bas du Hero.
- Navigation, ancres, CTA, animations existantes et préférence `prefers-reduced-motion` restent fonctionnels.
- Aucun changement de contenu ou de comportement métier n’est introduit; TypeScript, lint et build passent.

## Addendum — Préchargeur temporaire et révélation du Hero

### Objectif et identité visuelle
Afficher à la première visite de la session un préchargeur temporaire sombre, puis révéler le site dans son thème clair existant et présenter le Hero dans le premier viewport. Le préchargeur est un écran transitoire, et non un changement de thème du site.

- Fond `#0a0a0a`, texte `#f5f5f5`, accent vert `#4ade80`.
- Employer JetBrains Mono pour le terminal. `next/font/google` et la variable `--font-mono` étant déjà configurés dans `app/layout.tsx`, les réutiliser sans redéclarer la police ni ajouter de dépendance.
- Utiliser Framer Motion déjà installé, notamment `AnimatePresence` pour la sortie du préchargeur.
- Le préchargeur est réutilisable sous `components/` et monté depuis le layout racine; il ne remplace ni le contenu ni les sections de la page.

### Contrat de comportement
- À la première visite de la session, montrer une séquence de terminal à frappe progressive et un compteur de progression. Ils doivent être pilotés par une même progression afin de rester synchronisés.
- La séquence complète, délai inclus, dure au plus 2,8 secondes; aucune voie de sortie ne doit dépasser 3 secondes. Prévoir un bouton « Passer » qui termine immédiatement et de façon idempotente la séquence.
- Mémoriser l’affichage avec `sessionStorage` : ne pas réafficher le préchargeur lors des visites suivantes dans le même onglet/session. Si le stockage est indisponible ou lève une exception, continuer sans bloquer le rendu ni la sortie.
- La sortie du préchargeur ouvre le rideau et déclenche alors l’animation d’entrée du Hero, une seule fois. Faire transiter cet état via une propriété, un contexte ou un callback explicite; ne pas déclencher l’animation du Hero avant l’ouverture ni rejouer ses animations de défilement/parallaxe.
- Verrouiller le défilement de la page pendant le préchargement, y compris le comportement Lenis, puis restaurer le comportement antérieur à la sortie, au skip et au démontage.
- Avec `prefers-reduced-motion: reduce`, supprimer la frappe et les déplacements non essentiels, puis effectuer une simple disparition de moins de 300 ms. Le contenu ne doit pas rester bloqué en attente d’animation.

### Accessibilité et robustesse
- Le contenu essentiel de la page, en particulier le Hero, reste présent dans le HTML rendu côté serveur et accessible avant hydratation; ne pas le rendre dépendant d’un état client pour exister.
- Annoncer la progression/étape dans une région de statut (`role="status"` ou équivalent `aria-live`) sans annoncer chaque caractère ni saturer les lecteurs d’écran.
- Fournir un bouton « Passer » visible, nommé et activable au clavier; maintenir un indicateur de focus visible et éviter que le préchargeur piège le focus.
- Nettoyer timers, callbacks et animations au démontage. Gérer sans erreur l’hydratation, les doubles appels d’effets en développement, un skip très précoce et la préférence de mouvement réduit.
- À la fermeture du rideau, le fond clair du site et le Hero sont visibles dans le premier viewport, sans flash de contenu caché avant hydratation.

### Fichiers réellement concernés
- `components/Preloader.tsx` : écran, séquence terminal/compteur, action de skip et transitions d’entrée/sortie.
- `components/PreloaderProvider.tsx` (ou un mécanisme d’état équivalent si cela évite une abstraction superflue) : état d’affichage/ouverture et coordination avec la page.
- `app/layout.tsx` : montage du mécanisme réutilisable autour du contenu existant, sans retirer le chargement actuel de `JetBrains_Mono` ni `SmoothScroll`.
- `components/Hero.tsx` : attendre le signal d’ouverture du rideau pour démarrer uniquement l’animation d’entrée.
- `components/SmoothScroll.tsx` : suspendre puis reprendre Lenis pendant le verrouillage, sans altérer la gestion déjà en place de `prefers-reduced-motion`.
- `app/globals.css` : uniquement si les styles du rideau, du verrouillage ou du mouvement réduit ne peuvent pas être exprimés dans le composant.
- `SPEC.md` et `PLAN.md` : contrat et suivi de cette fonctionnalité; préserver leur contenu antérieur.

### Critères d’acceptation
- Première visite : préchargeur aux couleurs spécifiées, terminal et compteur synchronisés, « Passer » opérationnel; durée totale ≤2,8 s et jamais >3 s.
- Visite suivante dans la même session : aucun préchargeur; le site clair s’affiche normalement.
- La fermeture automatique et le skip ouvrent le rideau et démarrent l’entrée du Hero une seule fois; le Hero essentiel est déjà rendu et accessible avant hydratation.
- Pendant l’écran, le scroll utilisateur et Lenis sont bloqués; après toute sortie ou démontage, ils sont restaurés sans modifier leur état antérieur.
- Mouvement réduit : aucune attente inutile et disparition de moins de 300 ms.
- Le statut est accessible sans annonces caractère par caractère; skip, clavier et focus sont vérifiables.
- Aucun flash, blocage ou erreur si `sessionStorage` est indisponible; timers et abonnements sont nettoyés.
- Aucun nouveau paquet; TypeScript, lint et build passent, et les vérifications ciblées couvrent première visite, session déjà vue, skip, mouvement réduit, synchronisation du Hero et verrouillage du scroll.
