import { NextRequest, NextResponse } from "next/server";

export interface ContactPayload {
  nom: string;
  contact: string;
  projet: string;
  budget?: string;
  message: string;
  website?: string; // honeypot invisible
  source?: string;
}

export interface ApiResponseSuccess {
  success: true;
  message: string;
}

export interface ApiResponseError {
  error: string;
}

const ALLOWED_PROJECTS = [
  "Site web",
  "Application web",
  "Application mobile",
  "Automatisation IA",
  "Invitation web",
  "Graphisme",
] as const;

// Vérification email RFC standard simple ou numéro international/national (+242, 06, etc.)
function isValidContact(value: string): boolean {
  const trimmed = value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Numéro de téléphone autorisant indicatif +, espaces, tirets, points et au moins 8 chiffres
  const phoneDigits = trimmed.replace(/\D/g, "");
  const isPhone = phoneDigits.length >= 8 && phoneDigits.length <= 15;
  return emailRegex.test(trimmed) || isPhone;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<ApiResponseError>(
        { error: "Format JSON invalide." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json<ApiResponseError>(
        { error: "Requête invalide." },
        { status: 400 }
      );
    }

    const {
      nom = "",
      contact = "",
      projet = "",
      budget = "",
      message = "",
      website = "",
    } = body as Record<string, unknown>;

    // Protection anti-spam : si le champ honeypot "website" est rempli, répondre 200 sans rien transmettre
    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json<ApiResponseSuccess>(
        { success: true, message: "Message reçu." },
        { status: 200 }
      );
    }

    // Vérification des types
    if (
      typeof nom !== "string" ||
      typeof contact !== "string" ||
      typeof projet !== "string" ||
      typeof message !== "string" ||
      (budget !== undefined && typeof budget !== "string")
    ) {
      return NextResponse.json<ApiResponseError>(
        { error: "Types de données invalides." },
        { status: 400 }
      );
    }

    const cleanNom = nom.trim();
    const cleanContact = contact.trim();
    const cleanProjet = projet.trim();
    const cleanBudget = typeof budget === "string" ? budget.trim() : "";
    const cleanMessage = message.trim();

    // Limites de taille pour protection contre abus de payload
    if (cleanNom.length > 120) {
      return NextResponse.json<ApiResponseError>(
        { error: "Le nom ne doit pas dépasser 120 caractères." },
        { status: 400 }
      );
    }
    if (cleanContact.length > 150) {
      return NextResponse.json<ApiResponseError>(
        { error: "Le contact ne doit pas dépasser 150 caractères." },
        { status: 400 }
      );
    }
    if (cleanMessage.length > 2000) {
      return NextResponse.json<ApiResponseError>(
        { error: "Le message ne doit pas dépasser 2000 caractères." },
        { status: 400 }
      );
    }

    // Règles de validation identiques au client
    if (cleanNom.length < 2) {
      return NextResponse.json<ApiResponseError>(
        { error: "Entrez votre nom." },
        { status: 400 }
      );
    }

    if (!isValidContact(cleanContact)) {
      return NextResponse.json<ApiResponseError>(
        {
          error:
            "Entrez une adresse email valide ou un numéro, par exemple +242 06 123 45 67.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_PROJECTS.includes(cleanProjet as (typeof ALLOWED_PROJECTS)[number])) {
      return NextResponse.json<ApiResponseError>(
        { error: "Choisissez un type de projet." },
        { status: 400 }
      );
    }

    if (cleanMessage.length < 10) {
      return NextResponse.json<ApiResponseError>(
        {
          error:
            "Décrivez votre projet en quelques mots (10 caractères minimum).",
        },
        { status: 400 }
      );
    }

    // Payload nettoyé pour le webhook n8n
    const webhookPayload: ContactPayload = {
      nom: cleanNom,
      contact: cleanContact,
      projet: cleanProjet,
      budget: cleanBudget || "Non spécifié",
      message: cleanMessage,
      source: "portfolio-konigdev",
    };

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    // Si le webhook n8n est configuré, on transmet la payload
    if (!webhookUrl) {
      console.warn("Variable N8N_WEBHOOK_URL non configurée.");
      return NextResponse.json<ApiResponseError>(
        {
          error:
            "Le service d'automatisation n8n n'est pas configuré sur le serveur.",
        },
        { status: 500 }
      );
    }

    try {
      const n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!n8nResponse.ok) {
        console.error(
          "Erreur retournée par le webhook n8n :",
          n8nResponse.status,
          n8nResponse.statusText
        );
        return NextResponse.json<ApiResponseError>(
          { error: "Erreur lors de la transmission au webhook n8n." },
          { status: 500 }
        );
      }
    } catch (webhookError) {
      console.error("Échec de connexion au webhook n8n :", webhookError);
      return NextResponse.json<ApiResponseError>(
        { error: "Impossible de joindre le webhook n8n." },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponseSuccess>(
      {
        success: true,
        message: "Message reçu. Je vous réponds sous 24 heures.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur serveur inattendue dans /api/contact :", error);
    return NextResponse.json<ApiResponseError>(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}

