import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * 1. Icône Automatisation et IA :
 * Schéma de circuit logique avec nœuds interconnectés (trait fin 1.5px).
 */
export function AutomationIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Nœud central processeur / intelligence */}
      <rect x="7.5" y="7.5" width="9" height="9" rx="2" />
      {/* Nœuds et connexions de flux */}
      <path d="M12 3v4.5" />
      <path d="M12 16.5v4.5" />
      <path d="M3 12h4.5" />
      <path d="M16.5 12h4.5" />
      {/* Petits points aux extrémités */}
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
      <circle cx="3" cy="12" r="1" fill="currentColor" />
      <circle cx="21" cy="12" r="1" fill="currentColor" />
      {/* Impulsion interne */}
      <path d="M10 12h4" />
      <path d="M12 10v4" />
    </svg>
  );
}

/**
 * 2. Icône Présence en ligne :
 * Fenêtre de navigateur épurée avec barre d'URL et mise en page (trait fin 1.5px).
 */
export function WebPresenceIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Contour écran / navigateur */}
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      {/* Ligne d'en-tête */}
      <line x1="3" y1="9" x2="21" y2="9" />
      {/* Trois points discrets de navigation */}
      <circle cx="6" cy="6.5" r="0.75" fill="currentColor" />
      <circle cx="8.5" cy="6.5" r="0.75" fill="currentColor" />
      <circle cx="11" cy="6.5" r="0.75" fill="currentColor" />
      {/* Éléments de page */}
      <rect x="6" y="12" width="5" height="5" rx="1" />
      <line x1="14" y1="13" x2="18" y2="13" />
      <line x1="14" y1="16" x2="17" y2="16" />
    </svg>
  );
}

/**
 * 3. Icône Applications sur mesure :
 * Cubes isométriques superposés représentant une pile logicielle robuste (trait fin 1.5px).
 */
export function CustomAppsIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Module supérieur */}
      <path d="M12 2.5l7 3.8-7 3.8-7-3.8z" />
      {/* Module intermédiaire */}
      <path d="M5 10.3l7 3.8 7-3.8" />
      {/* Module inférieur */}
      <path d="M5 14.5l7 3.8 7-3.8" />
      {/* Arêtes verticales de structure */}
      <line x1="12" y1="18.3" x2="12" y2="21.5" />
      <line x1="5" y1="6.3" x2="5" y2="14.5" />
      <line x1="19" y1="6.3" x2="19" y2="14.5" />
    </svg>
  );
}

/**
 * 4. Icône Design :
 * Compas de précision et équerre d'architecte / designer (trait fin 1.5px).
 */
export function DesignIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Tête de compas */}
      <circle cx="12" cy="5" r="2" />
      {/* Branches du compas */}
      <path d="M10.5 6.8L5 20.5" />
      <path d="M13.5 6.8L19 20.5" />
      {/* Arc de réglage */}
      <path d="M7.8 14.5c2.6-1.2 5.8-1.2 8.4 0" />
      {/* Pointe centrale de repère */}
      <circle cx="12" cy="13.2" r="0.75" fill="currentColor" />
    </svg>
  );
}

