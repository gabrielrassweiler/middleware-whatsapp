import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as XLSX from 'xlsx';

@Injectable()
export class AppService {
  mensagemPadrao =
    'Olá, quem está falando é a Júlia. Sou consultora comercial direto da fábrica aqui do grupo Alvo da Moda.' +
    ' Você ficou sabendo da oportunidade que estamos oferecendo para as nossas clientes VIP?';

  async send(mensagem?: string) {
    console.log('\n- Começando envio -');
    const rel = XLSX.readFile('src/clientes/RelCliente.xlsx');
    const planilha = rel.Sheets[rel.SheetNames[0]];
    const dados = XLSX.utils.sheet_to_json(planilha, { header: 1 });
    if (!dados) {
      console.error('Nenhum dado encontrado na planilha');
      return;
    }
    delete dados[0];
    dados.sort();

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com');
    await this.delay(20000);
    console.log('\n -- Conectado com sucesso! -- ');

    for (const cliente of dados) {
      if (
        cliente[4].toLowerCase() == 'sim' ||
        cliente[5].toLowerCase() == 'nao'
      )
        continue;

      const phone =
        cliente[2].toString() + cliente[3].toString().replaceAll('-', '');

      try {
        await page.goto(
          'https://web.whatsapp.com/send?phone=+55' +
            phone +
            '&text=' +
            mensagem ?? this.mensagemPadrao,
        );
        await this.delay(5000);

        await page.click("span[data-testid='send']");
        console.log(
          `\n -- Enviado mensagem [Código cliente: ${cliente[0]}, fone: ${phone}] -- `,
        );
        await this.delay(2000);
      } catch (e) {
        console.error(
          `\n -- ERRO AO ENVIAR [Código cliente: ${cliente[0]}, Fone: ${phone}]. Detalhes: ${e.message} -- `,
        );
      }
    }

    console.log('\n- Fim dos envios -');
    await browser.close();
  }

  async delay(time: number) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }
}
