import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    //this.sendVerificationEmail('test@email', 'test');
  }

  private async sendEmail(
    subject: string,
    to: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    //Form 형태로 데이터를 생성하기 위해 form-data라이브러리 사용
    const form = new FormData();
    form.append('from', `Nuber Eats <mailgun@${this.options.fromEmail}`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

    console.log(this.options);
    /*
        HTTP Authorization에는 Basic, Bearer, Digest등이 있음
        1) Authorization의 헤더
         - Authorization : <type> <credentials>
        2) Authorization Type별 crendential에 있어야 하는 정보
         - Basic : 유저명과 패스워드 명이 필요. ID와 비밀번호를 base64 인코딩해서 전송(별도의 key 없이도 복호화가 가능한 인코딩임)
         - Bearer : 

      */
    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(
      'Verify Your Email',
      '21600024@hankooktech.com',
      'verify-email',
      [
        { key: 'code', value: code },
        { key: 'username', value: email },
      ],
    );
  }
}
