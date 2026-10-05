# 🚀 Marco Cristofari — Personal Portfolio Website

Sito web di presentazione professionale e portfolio interattivo di **Marco Cristofari**, Junior Software Developer. Il progetto è stato sviluppato con approccio frontend moderno senza framework pesanti (Vanilla Web), ponendo forte enfasi su prestazioni, accessibilità, UX curata e responsive design.

---

## 💻 Tech Stack & Architettura

| Livello | Tecnologie / Strumenti |
|---|---|
| **Markup & Struttura** | HTML5 Semantico, Accessibility (ARIA compliance) |
| **Stili & UI/UX** | CSS3 Moderno (Custom Properties, Flexbox, CSS Grid, Glassmorphism, Keyframe Animations) |
| **Logica Client-Side** | Vanilla JavaScript (ES6+), LocalStorage API, IntersectionObserver API |
| **Integrazioni API** | [Web3Forms API](https://web3forms.com/) per l'invio diretto del form contatti via email |
| **Strumenti di Sviluppo** | VS Code, Git, GitHub Pages |

---

## ✨ Funzionalità Principali

* 🎨 **Design System con Temi Dark/Light**: Toggle del tema cromatico con persistenza della preferenza dell'utente tramite `LocalStorage`.
* ⚡ **Command Palette Rapida (`Ctrl + K` / `⌘K`)**: Sistema di ricerca rapida da tastiera per navigare istantaneamente tra le pagine del sito e le azioni principali.
* 🏆 **Showcase Progetti Completati**: Sezione dedicata ai 3 principali progetti conclusi (Pizzeria da Gino, L'Eredità, ElecWork Manager) con schede dettagliate, feature, tag tecnologici e visualizzatore di snippet di codice con funzione di copia rapida.
* 🔮 **Roadmap & Sviluppi Futuri**: Schede compatte espandibili per tracciare lo stato dei progetti in lavorazione (scripting Python, Bot Telegram, Dashboard Analytics).
* 📜 **Timeline Professionale & Soft Skills**: Sezione dedicata all'esperienza lavorativa (da Caposquadra Preposto nel settore elettrico/fotovoltaico a sviluppatore software) con focus sulle competenze trasversali (problem solving, leadership, gestione clienti).
* 📩 **Form di Contatto Senza Backend**: Modulo di contatto integrato con Web3Forms che invia i messaggi del form direttamente alla casella di posta elettronica, con protezione anti-bot e feedback tramite notifica toast.

---

## 📂 Struttura del Progetto

```text
Sito personale/
├── index.html            # Home page (Hero, bio, timeline carriera, soft skills, roadmap obiettivi)
├── progetti.html         # Portfolio progetti (Showcase 3 progetti completati + Roadmap sviluppi futuri)
├── contatti.html         # Canali di contatto rapidi (telefono, email, LinkedIn) + Form Web3Forms
├── gioco.html            # Web App interattiva della demo "L'Eredità — TV Game Show"
├── gestionale.html       # Demo interattiva dell'applicazione "ElecWork Manager"
├── styles.css            # Design system globale (variabili CSS, temi, layout responsive e animazioni)
├── global.js             # Funzionalità condivise (Command Palette ⌘K, scroll progress, reveal)
├── transitions.js        # Gestione transizioni di pagina fluide
├── cv.pdf                # Curriculum Vitae ufficiale scaricabile
└── favicon.png / foto.jpg # Asset grafici del sito
```

---

## 🚀 Avvio Locale e Configurazione

Non è richiesto alcun processo di build o installazione di pacchetti (`npm`).

1. **Clona o scarica la repository**:
   ```bash
   git clone <URL-repository>
   ```
2. **Apri il file `index.html`** in qualsiasi browser moderno (o utilizza l'estensione *Live Server* di VS Code).

```

---

## 📄 Licenza & Contatti

© 2026 **Marco Cristofari** — Junior Software Developer. Roma, Italia.  
- **LinkedIn**: [Marco Cristofari](https://www.linkedin.com/in/marco-cristofari-15001b422/)  
