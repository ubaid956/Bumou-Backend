import { Injectable } from '@nestjs/common';
import { englishPrivacy, chinesePrivacy } from './privacy';
import { englishAgree, chineseAgree } from './user_agreement';
import {
  chineseAccountDeletion,
  englishAccountDeletion,
} from './account-deletion';
@Injectable()
export class BumouService {
  getPrivacyPolicy(lang = 'en'): any {
    switch (lang) {
      case 'en':
        return englishPrivacy;
      default:
        return chinesePrivacy;
    }
  }

  getUserAgreement(lang = 'en'): any {
    switch (lang) {
      case 'en':
        return englishAgree;
      default:
        return chineseAgree;
    }
  }

  getAccountDeletion(lang: string): any {
    switch (lang) {
      case 'en':
        return englishAccountDeletion;
      default:
        return chineseAccountDeletion;
    }
  }
}
