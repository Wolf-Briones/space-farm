import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'; 
import { Languages, MultiLangText } from '../languages/data-profile-language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Languages>(Languages.ES);
  public currentLanguage$: Observable<Languages> = this.currentLanguageSubject.asObservable();

  constructor() {
    // Obtener idioma guardado o usar español por defecto
    const savedLanguage = localStorage.getItem('selectedLanguage') as Languages || Languages.ES;
    this.setLanguage(savedLanguage);
  }

  setLanguage(language: Languages): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('selectedLanguage', language);
  }

  getCurrentLanguage(): Languages {
    return this.currentLanguageSubject.value;
  }

  getTranslation(multiLangText: MultiLangText): string {
    const currentLang = this.getCurrentLanguage();
    return multiLangText[currentLang] || multiLangText[Languages.ES];
  }
}