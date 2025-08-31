// // src/services/sms.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import Core from '@alicloud/pop-core';


// @Injectable()
// export class SmsService {
//   private readonly logger = new Logger(SmsService.name);
//   private client: any;

//   constructor() {
//     this.client = new Core({
//       accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID, // from environment
//       accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET, // from environment
//       endpoint: 'https://dysmsapi.aliyuncs.com',
//       apiVersion: '2017-05-25',
//     });
//   }

//   /**
//    * Send verification code via Aliyun SMS
//    * @param phoneNumber Must be in correct format for Aliyun (e.g. "18201840625" for China mainland)
//    * @param code Numeric OTP code
//    */
//   async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
//     // Detect China numbers
//     let normalizedPhone: string;
//     if (phoneNumber.startsWith('+86')) {
//       normalizedPhone = phoneNumber.replace(/^\+86/, '');
//     } else {
//       normalizedPhone = phoneNumber.replace(/^\+/, ''); // remove plus for other countries
//     }

//     this.logger.warn(`DEBUG OTP for ${phoneNumber}: ${code}`); // so you can verify in Postman without waiting for SMS

//     const params = {
//       RegionId: 'cn-hangzhou',
//       PhoneNumbers: normalizedPhone,
//       SignName: 'Bumou咘呣',
//       TemplateCode: 'SMS_492420137',
//       TemplateParam: JSON.stringify({ code }),
//       Version: '2017-05-25',
//       Action: 'SendSms',
//     };

//     const requestOption = { method: 'POST', timeout: 10000 }; // 10s

//     try {
//       const result = await this.client.request('SendSms', params, requestOption);
//       this.logger.debug(`Aliyun response: ${JSON.stringify(result)}`);

//       if (result.Code === 'OK') {
//         this.logger.log(`OTP sent successfully to ${phoneNumber}`);
//         return true;
//       } else {
//         this.logger.error(`Failed to send OTP to ${phoneNumber}: ${result.Message}`);
//         return false;
//       }
//     } catch (error) {
//       this.logger.error(`Aliyun SMS error for ${phoneNumber}: ${error.message}`);
//       return false;
//     }
//   }

// }


import { Injectable, Logger } from '@nestjs/common';
import Core from '@alicloud/pop-core';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: any;

  constructor() {
    this.client = new Core({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25',
    });
  }

  /**
   * Normalize phone number into Aliyun expected format
   * - China Mainland: remove +86 prefix → must be 11 digits
   * - Other: remove "+" and keep full E.164 format (e.g., 923XXXXXXXXX)
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('+86')) {
      return phoneNumber.replace(/^\+86/, ''); // e.g. +8613800138000 → 13800138000
    }
    return phoneNumber.replace(/^\+/, ''); // e.g. +923195903834 → 923195903834
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    this.logger.warn(`DEBUG OTP for ${phoneNumber} (normalized: ${normalizedPhone}): ${code}`);

    const params = {
      RegionId: 'cn-hangzhou',
      PhoneNumbers: normalizedPhone,
      SignName: 'Bumou咘呣',
      TemplateCode: 'SMS_492420137',
      TemplateParam: JSON.stringify({ code }),
      Version: '2017-05-25',
      Action: 'SendSms',
    };

    const requestOption = { method: 'POST', timeout: 10000 };

    try {
      const result = await this.client.request('SendSms', params, requestOption);
      this.logger.debug(`Aliyun response: ${JSON.stringify(result)}`);

      if (result.Code === 'OK') {
        this.logger.log(`OTP sent successfully to ${phoneNumber}`);
        return true;
      } else {
        this.logger.error(`Failed to send OTP to ${phoneNumber}: ${result.Message}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Aliyun SMS error for ${phoneNumber}: ${error.message}`);
      return false;
    }
  }
}
