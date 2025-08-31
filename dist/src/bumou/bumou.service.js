"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BumouService = void 0;
const common_1 = require("@nestjs/common");
const privacy_1 = require("./privacy");
const user_agreement_1 = require("./user_agreement");
const account_deletion_1 = require("./account-deletion");
let BumouService = class BumouService {
    getPrivacyPolicy(lang = 'en') {
        switch (lang) {
            case 'en':
                return privacy_1.englishPrivacy;
            default:
                return privacy_1.chinesePrivacy;
        }
    }
    getUserAgreement(lang = 'en') {
        switch (lang) {
            case 'en':
                return user_agreement_1.englishAgree;
            default:
                return user_agreement_1.chineseAgree;
        }
    }
    getAccountDeletion(lang) {
        switch (lang) {
            case 'en':
                return account_deletion_1.englishAccountDeletion;
            default:
                return account_deletion_1.chineseAccountDeletion;
        }
    }
};
exports.BumouService = BumouService;
exports.BumouService = BumouService = __decorate([
    (0, common_1.Injectable)()
], BumouService);
//# sourceMappingURL=bumou.service.js.map