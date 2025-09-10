// enums/languages.enum.ts
export enum Languages {
  ES = 'es',
  EN = 'en',
  PT = 'pt',
  DE = 'de',
}

export const LanguageNames: Record<Languages, Record<Languages, string>> = {
  [Languages.ES]: {
    [Languages.ES]: 'Español',
    [Languages.EN]: 'Inglés',
    [Languages.PT]: 'Portugués',
    [Languages.DE]: 'Alemán',
  },
  [Languages.EN]: {
    [Languages.ES]: 'Spanish',
    [Languages.EN]: 'English',
    [Languages.PT]: 'Portuguese',
    [Languages.DE]: 'German',
  },
  [Languages.PT]: {
    [Languages.ES]: 'Espanhol',
    [Languages.EN]: 'Inglês',
    [Languages.PT]: 'Português',
    [Languages.DE]: 'Alemão',
  },
  [Languages.DE]: {
    [Languages.ES]: 'Spanisch',
    [Languages.EN]: 'Englisch',
    [Languages.PT]: 'Portugiesisch',
    [Languages.DE]: 'Deutsch',
  },
};  

// interfaces/multilang.interface.ts
export interface MultiLangText {
  [Languages.ES]: string;
  [Languages.EN]: string;
  [Languages.PT]: string;
  [Languages.DE]: string;
}  

export const TRANSLATIONS = {
  [Languages.ES]: {
    categories: 'DISEÑO · DESARROLLO · MARKETING',
    helpText: 'Puedo ayudar a tu negocio a',
    mainMessage: 'Conectarse en línea y crecer rápido',
    resume: 'Currículum',
    projects: 'Proyectos',
  },
  [Languages.EN]: {
    categories: 'DESIGN · DEVELOPMENT · MARKETING',
    helpText: 'I can help your business to',
    mainMessage: 'Get online and grow fast',
    resume: 'Resume',
    projects: 'Projects',
  },
  [Languages.PT]: {
    categories: 'DESIGN · DESENVOLVIMENTO · MARKETING',
    helpText: 'Posso ajudar o seu negócio a',
    mainMessage: 'Conectar-se online e crescer rápido',
    resume: 'Currículo',
    projects: 'Projetos',
  },
  [Languages.DE]: {
    categories: 'DESIGN · ENTWICKLUNG · MARKETING',
    helpText: 'Ich kann Ihrem Unternehmen helfen,',
    mainMessage: 'Online zu gehen und schnell zu wachsen',
    resume: 'Lebenslauf',
    projects: 'Projekte',
  },
};
