"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";

export type ProjectType =
  | "Site web"
  | "Application web"
  | "Application mobile"
  | "Automatisation IA"
  | "Invitation web"
  | "Graphisme";

export interface FormDataState {
  nom: string;
  contact: string;
  projet: ProjectType | "";
  budget: string;
  message: string;
  website: string; // Honeypot
}

export interface FormErrorsState {
  nom?: string;
  contact?: string;
  projet?: string;
  message?: string;
}

const PROJECT_OPTIONS: ProjectType[] = [
  "Site web",
  "Application web",
  "Application mobile",
  "Automatisation IA",
  "Invitation web",
  "Graphisme",
];

const BUDGET_OPTIONS = [
  "Je ne sais pas encore",
  "Moins de 100 000 FCFA",
  "100 000 à 300 000 FCFA",
  "300 000 à 700 000 FCFA",
  "Plus de 700 000 FCFA",
];

// Vérification email valide OU numéro de téléphone valide
function validateContactValue(value: string): boolean {
  const trimmed = value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneDigits = trimmed.replace(/\D/g, "");
  const isPhone = phoneDigits.length >= 8 && phoneDigits.length <= 15;
  return emailRegex.test(trimmed) || isPhone;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormDataState>({
    nom: "",
    contact: "",
    projet: "",
    budget: "Je ne sais pas encore",
    message: "",
    website: "",
  });

  const [errors, setErrors] = useState<FormErrorsState>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  // Références pour autofocus sur le premier champ invalide
  const nomInputRef = useRef<HTMLInputElement>(null);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const projetFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "242061062936";

  // Préremplissage du type de projet via les paramètres d'URL (ex: ?projet=site-web)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const projParam = params.get("projet");
      if (projParam) {
        const mapping: Record<string, ProjectType> = {
          "site-web": "Site web",
          "application-web": "Application web",
          "application-mobile": "Application mobile",
          "automatisation-ia": "Automatisation IA",
          "graphisme": "Graphisme",
          "invitation-web": "Invitation web",
        };
        const found = mapping[projParam.toLowerCase()];
        if (found) {
          setFormData((prev) => ({ ...prev, projet: found }));
        }
      }
    }
  }, []);

  // Mise à jour des valeurs et effacement de l'erreur dès correction
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrorsState]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name as keyof FormErrorsState];
        return updated;
      });
    }

    if (feedback.type) {
      setFeedback({ type: null, message: "" });
    }
  };

  const handleProjetSelect = (type: ProjectType) => {
    setFormData((prev) => ({ ...prev, projet: type }));
    if (errors.projet) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.projet;
        return updated;
      });
    }
    if (feedback.type) {
      setFeedback({ type: null, message: "" });
    }
  };

  // Validation formulaire
  const validateForm = (): boolean => {
    const newErrors: FormErrorsState = {};

    if (formData.nom.trim().length < 2) {
      newErrors.nom = "Entrez votre nom.";
    }

    if (!validateContactValue(formData.contact)) {
      newErrors.contact =
        "Entrez une adresse email valide ou un numéro, par exemple +242 06 123 45 67.";
    }

    if (!formData.projet) {
      newErrors.projet = "Choisissez un type de projet.";
    }

    if (formData.message.trim().length < 10) {
      newErrors.message =
        "Décrivez votre projet en quelques mots (10 caractères minimum).";
    }

    setErrors(newErrors);

    // Focus sur le premier champ en erreur
    if (newErrors.nom) {
      nomInputRef.current?.focus();
    } else if (newErrors.contact) {
      contactInputRef.current?.focus();
    } else if (newErrors.projet) {
      const firstRadio = projetFieldsetRef.current?.querySelector("input");
      firstRadio?.focus();
    } else if (newErrors.message) {
      messageInputRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFeedback({
          type: "success",
          message: "Message reçu. Je vous réponds sous 24 heures.",
        });
        setFormData({
          nom: "",
          contact: "",
          projet: "",
          budget: "Je ne sais pas encore",
          message: "",
          website: "",
        });
        setErrors({});
      } else {
        setFeedback({
          type: "error",
          message:
            "Le message n'a pas pu être envoyé. Réessayez, ou écrivez-moi sur WhatsApp.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message:
          "Le message n'a pas pu être envoyé. Réessayez, ou écrivez-moi sur WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Génération du lien WhatsApp avec message prérempli
  const buildWhatsAppLink = (): string => {
    const parts: string[] = [];
    if (formData.nom.trim()) {
      parts.push(`Bonjour Konigdev, je suis ${formData.nom.trim()}.`);
    } else {
      parts.push("Bonjour Konigdev.");
    }
    if (formData.projet) {
      parts.push(`Type de projet : ${formData.projet}.`);
    }
    if (formData.message.trim()) {
      parts.push(`Message : ${formData.message.trim()}`);
    } else {
      parts.push("Je souhaiterais échanger avec vous au sujet d'un projet.");
    }
    const textEncoded = encodeURIComponent(parts.join("\n\n"));
    return `https://wa.me/${whatsappNumber}?text=${textEncoded}`;
  };

  return (
    <article
      className="w-full max-w-[860px] mx-auto rounded-[28px] bg-gradient-to-br from-[#F4F7FA] to-[#EDF1F6] p-6 sm:p-10 md:p-[52px_56px] shadow-contact-card border border-white/95 animate-fade-slide-up motion-reduce:transform-none motion-reduce:opacity-100"
      aria-labelledby="contact-heading"
    >
      {/* En-tête du formulaire */}
      <div className="mb-8 sm:mb-10 text-center sm:text-left">
        <h2
          id="contact-heading"
          className="font-display font-extrabold text-[30px] sm:text-[38px] text-[#22252A] tracking-tight leading-[1.1] mb-3"
        >
          Parlons de votre projet
        </h2>
        <p className="font-text text-sm text-[#4A5663] max-w-[52ch] leading-relaxed">
          Décrivez ce dont vous avez besoin. Je vous réponds sous 24 heures, par
          email ou sur WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {/* Champ Honeypot invisible pour contrer les spams */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website">Ne pas remplir ce champ si vous êtes humain</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>

        {/* Grille 2 colonnes desktop, 1 colonne sous 700px */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Nom */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="nom"
              className="font-text text-xs font-semibold text-[#22252A] tracking-wide"
            >
              Nom <span className="text-[#B3261E]">*</span>
            </label>
            <input
              ref={nomInputRef}
              type="text"
              id="nom"
              name="nom"
              required
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Votre nom complet"
              aria-required="true"
              aria-invalid={errors.nom ? "true" : "false"}
              aria-describedby={errors.nom ? "nom-error" : undefined}
              className={`w-full h-12 px-4 rounded-[14px] bg-[#EEF2F7] text-[#22252A] font-text text-sm placeholder-[#6B7480] shadow-inset-field border transition-all duration-200 focus:bg-white focus:outline-none focus:border-[#22252A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 ${
                errors.nom ? "border-[#B3261E]" : "border-transparent"
              }`}
            />
            {errors.nom && (
              <span id="nom-error" className="font-text text-xs text-[#B3261E] mt-0.5">
                {errors.nom}
              </span>
            )}
          </div>

          {/* 2. Email ou WhatsApp */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact"
              className="font-text text-xs font-semibold text-[#22252A] tracking-wide"
            >
              Email ou numéro WhatsApp <span className="text-[#B3261E]">*</span>
            </label>
            <input
              ref={contactInputRef}
              type="text"
              id="contact"
              name="contact"
              required
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="nom@exemple.com ou +242 ..."
              aria-required="true"
              aria-invalid={errors.contact ? "true" : "false"}
              aria-describedby={errors.contact ? "contact-error" : undefined}
              className={`w-full h-12 px-4 rounded-[14px] bg-[#EEF2F7] text-[#22252A] font-text text-sm placeholder-[#6B7480] shadow-inset-field border transition-all duration-200 focus:bg-white focus:outline-none focus:border-[#22252A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 ${
                errors.contact ? "border-[#B3261E]" : "border-transparent"
              }`}
            />
            {errors.contact && (
              <span id="contact-error" className="font-text text-xs text-[#B3261E] mt-0.5">
                {errors.contact}
              </span>
            )}
          </div>
        </div>

        {/* 3. Type de projet (Pleine largeur, pastilles radio) */}
        <fieldset ref={projetFieldsetRef} className="flex flex-col gap-3">
          <legend className="font-text text-xs font-semibold text-[#22252A] tracking-wide mb-1">
            Type de projet <span className="text-[#B3261E]">*</span>
          </legend>

          <div
            className="flex flex-wrap gap-2.5"
            role="radiogroup"
            aria-required="true"
            aria-invalid={errors.projet ? "true" : "false"}
            aria-describedby={errors.projet ? "projet-error" : undefined}
          >
            {PROJECT_OPTIONS.map((type) => {
              const isSelected = formData.projet === type;
              const inputId = `projet-${type.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <label
                  key={type}
                  htmlFor={inputId}
                  className={`cursor-pointer inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 select-none ${
                    isSelected
                      ? "bg-[#22252A] text-white shadow-md"
                      : "bg-white text-[#22252A] shadow-pill-relief border border-white/95 hover:-translate-y-0.5"
                  }`}
                >
                  <input
                    type="radio"
                    id={inputId}
                    name="projet"
                    value={type}
                    checked={isSelected}
                    onChange={() => handleProjetSelect(type)}
                    className="sr-only"
                  />
                  <span>{type}</span>
                </label>
              );
            })}
          </div>

          {errors.projet && (
            <span id="projet-error" className="font-text text-xs text-[#B3261E] mt-0.5">
              {errors.projet}
            </span>
          )}
        </fieldset>

        {/* 4. Budget indicatif */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="budget"
            className="font-text text-xs font-semibold text-[#22252A] tracking-wide"
          >
            Budget indicatif (facultatif)
          </label>
          <div className="relative">
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full h-12 px-4 pr-10 rounded-[14px] bg-[#EEF2F7] text-[#22252A] font-text text-sm shadow-inset-field border border-transparent appearance-none transition-all duration-200 focus:bg-white focus:outline-none focus:border-[#22252A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 cursor-pointer"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-white text-[#22252A]">
                  {opt}
                </option>
              ))}
            </select>
            {/* Flèche SVG personnalisée écrite à la main */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#22252A]">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* 5. Votre message */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="message"
            className="font-text text-xs font-semibold text-[#22252A] tracking-wide"
          >
            Votre message <span className="text-[#B3261E]">*</span>
          </label>
          <textarea
            ref={messageInputRef}
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Que voulez-vous réaliser ? Pour qui ? Pour quelle date ?"
            aria-required="true"
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`w-full min-h-[140px] p-4 rounded-[14px] bg-[#EEF2F7] text-[#22252A] font-text text-sm placeholder-[#6B7480] shadow-inset-field border transition-all duration-200 resize-y focus:bg-white focus:outline-none focus:border-[#22252A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2 ${
              errors.message ? "border-[#B3261E]" : "border-transparent"
            }`}
          />
          {errors.message && (
            <span id="message-error" className="font-text text-xs text-[#B3261E] mt-0.5">
              {errors.message}
            </span>
          )}
        </div>

        {/* 6. Boutons d'action */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
          {/* Bouton 1 : Envoyer le message */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 h-12 px-6 rounded-[12px] bg-gradient-to-r from-[#3A3F46] to-[#14161A] hover:from-[#2D3238] hover:to-[#0D0E10] text-white font-text text-[13px] font-bold tracking-wide shadow-btn-submit transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
          </button>

          {/* Bouton 2 : Écrire sur WhatsApp */}
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 h-12 px-6 rounded-[12px] bg-white text-[#22252A] font-text text-[13px] font-semibold tracking-wide shadow-pill-relief border border-white/95 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22252A] focus-visible:outline-offset-2"
          >
            {/* Icône WhatsApp SVG écrite à la main */}
            <svg
              className="w-4 h-4 text-[#22252A]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Écrire sur WhatsApp</span>
          </a>
        </div>

        {/* Zone de statut accessible */}
        <div role="status" aria-live="polite" className="text-center min-h-[22px]">
          {feedback.message && (
            <p
              className={`font-text text-xs font-semibold ${
                feedback.type === "success" ? "text-[#22252A]" : "text-[#B3261E]"
              }`}
            >
              {feedback.message}
            </p>
          )}
        </div>

        {/* Note de confidentialité sous le formulaire */}
        <p className="font-text text-xs text-[#6B7480] text-center pt-1">
          Vos informations servent uniquement à vous répondre.
        </p>
      </form>
    </article>
  );
}

