import { BumouService } from './bumou.service';
export declare class BumouController {
    private readonly bumouService;
    constructor(bumouService: BumouService);
    getBumou(lang: string): any;
    getUserAgreement(lang: string): any;
    getAccountDeletion(lang: string): any;
}
