import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import rw from "./locales/rw.json";

const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    fr: {
      translation: fr,
    },
    rw: {
      translation: rw,
    },
  },

  lng: savedLanguage,

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },

  returnNull: false,
});

export default i18n;
