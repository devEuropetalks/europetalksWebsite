// Import all your existing JSON files to create initial translations
import { TranslationObject } from "@/types/translations";

export const initialTranslations: Record<string, Record<string, TranslationObject>> = {
  en: {
    home: {
      hero: {
        title: "Welcome to EuropeTalks",
        subtitle: "Join our community of Europeans sharing ideas, culture, and creating connections across borders."
      },
      features: {
        cultural: {
          title: "Cultural Exchange",
          description: "Experience diverse European cultures through our events and workshops."
        },
        community: {
          title: "Community",
          description: "Connect with like-minded Europeans and build lasting relationships."
        },
        knowledge: {
          title: "Share knowledge",
          description: "Share and expand your knowledge through interactive discussions, workshops and learn from others."
        }
      },
      cta: {
        title: "Ready to join?",
        buttons: {
          explore: "Explore Events",
          learnMore: "Learn More"
        },
        description: "Become a member and get access to exclusive events and features."
      }
    },
    auth: {
      signIn: {
        title: "Sign In",
        subtitle: "Welcome back",
        success: "Successfully signed in",
        error: "Failed to sign in"
      },
      signOut: {
        success: "Successfully signed out",
        error: "Failed to sign out"
      }
    },
    header: {
      navigation: {
        home: "Home",
        about: "About",
        events: "Events",
        gallery: "Gallery",
        contact: "Contact",
        admin: "Admin",
        cloud: "Cloud",
        translations: "Translations"
      },
      other: {
        signIn: "Sign In",
        signOut: "Sign Out",
        menu: "Menu"
      }
    },
    components: {
      languageSelector: {
        label: "Select language"
      },
      theme: {
        toggleTheme: "Toggle theme"
      },
      events: {
        eventEnded: "Event Ended",
        signUp: "Sign Up"
      }
    },
    about: {
      title: "About EuropeTalks",
      whoWeAre: {
        title: "Who We Are",
        intro: "We are a group of activists from all over Europe who are united in one goal – to boost European cooperation and solidarity!",
        mission: "Our main goal is to provide a platform for European democrats, to connect like-minded people from all over Europe and beyond and to work together for a common European vision, based on social democratic and socialist values. We want to enable people to share their values and visions on how to further develop and shape the European Union."
      },
      leadership: {
        title: "Leadership",
        intro: "Mainly responsible for EuropeTalks is:",
        name: "Vivien Costanzo",
        role: {
          title: "Member of the European Parliament",
          party: "Social Democratic Party of Germany"
        }
      },
      background: {
        title: "Background",
        conference: "It all started after the \"Europe, we need to talk!\" – conference in 2018, which was organized by the Jusos and SPD Hessen-Süd in Germany. This was supported by Udo Bullmann, MEP and Michael Roth, German Minister Of State For Europe In The Foreign Ministry."
      }
    },
    gallery: {
      title: "Gallery"
    },
    other: {}
  }
}; 