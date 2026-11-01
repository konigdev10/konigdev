import SmoothScroll from "@/components/SmoothScroll";
import PreloaderProvider from "@/components/PreloaderProvider";
import CustomCursor from "@/components/CustomCursor";

/**
 * Habillage du site public : rideau d'intro, défilement doux, curseur personnalisé.
 *
 * Ces trois composants écrivent dans le DOM global (overflow: hidden, position:
 * fixed sur le body, portail à z-index maximal). Ils sont volontairement ici et
 * non dans la racine : /admin doit rester un document ordinaire, où un champ de
 * formulaire n'est jamais masqué ni verrouillé par une animation d'accueil.
 */
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PreloaderProvider>
      <SmoothScroll />
      {children}
      <CustomCursor />
    </PreloaderProvider>
  );
}
