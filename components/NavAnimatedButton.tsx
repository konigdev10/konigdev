"use client";

import React from "react";
import styles from "./NavAnimatedButton.module.css";
import { SITE_CONFIG } from "@/lib/constants";

interface NavAnimatedButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

const STATE_1_LETTERS = ["P", "A", "R", "L", "O", "N", "S", "-", "E", "N"];
const STATE_2_LETTERS = ["D", "I", "S", "C", "U", "T", "E", "R"];

export default function NavAnimatedButton({
  href = SITE_CONFIG.whatsapp.url,
  onClick,
  className = "",
}: NavAnimatedButtonProps) {
  const isExternal = href.startsWith("http") || href.startsWith("https");

  const content = (
    <div className={styles.button}>
      <div className={styles.bg} />

      {/* SVG Splash Effect */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 342 208"
        height={208}
        width={342}
        className={styles.splash}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeWidth={3}
          d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          strokeOpacity="0.3"
          d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          strokeOpacity="0.3"
          d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          strokeOpacity="0.3"
          d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          strokeOpacity="0.3"
          d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          strokeOpacity="0.3"
          d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272"
        />
        <path
          strokeLinecap="round"
          strokeWidth={3}
          strokeOpacity="0.3"
          d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449"
        />
      </svg>

      {/* Wrap avec contour animé et contenu */}
      <div className={styles.wrap}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 221 42"
          height={42}
          width={221}
          className={styles.path}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeWidth={3}
            d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"
          />
        </svg>

        <div className={styles.outline} aria-hidden="true" />

        <div className={styles.content}>
          {/* État 1 : PARLONS-EN */}
          <span className={`${styles.char} ${styles.state1}`} aria-label="PARLONS-EN">
            {STATE_1_LETTERS.map((letter, idx) => (
              <span
                key={`s1-${idx}`}
                data-label={letter}
                style={{ "--i": idx + 1 } as React.CSSProperties}
              >
                {letter}
              </span>
            ))}
          </span>

          {/* Icône flèche animée */}
          <div className={styles.icon} aria-hidden="true">
            <div />
          </div>

          {/* État 2 : DISCUTER */}
          <span className={`${styles.char} ${styles.state2}`} aria-label="DISCUTER">
            {STATE_2_LETTERS.map((letter, idx) => (
              <span
                key={`s2-${idx}`}
                data-label={letter}
                style={{ "--i": idx + 1 } as React.CSSProperties}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${styles.buttonWrapper} ${className}`}>
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onClick={onClick}
        aria-label="Contacter Konigdev sur WhatsApp pour parler d'un projet"
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22252A] rounded-2xl"
      >
        {content}
      </a>
    </div>
  );
}

