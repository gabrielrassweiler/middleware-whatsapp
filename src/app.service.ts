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

    // Abre navegador com whatsapp
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com');
    await this.delay(20000);
    console.log('\n -- Conectado com sucesso! -- ');

    let index = 0;
    for (const cliente of dados) {
      // Ignora o primeira pois sao apenas colunas de identificao da planilha
      if (cliente[0].toString().toLowerCase() == 'codcli') continue;

      index++;
      if (!cliente) continue;
      if (cliente[4] && cliente[4].toLowerCase() == 'sim') continue;
      if (cliente[5] && cliente[5].toLowerCase() == 'nao') continue;

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
        // Atualiza coluna se foi enviado ou nao
        dados[index][4] = 'sim';
        // Atualiza coluna se foi numero esta correto ou nao
        dados[index][5] = 'sim';

        await this.delay(2000);
      } catch (e) {
        console.error(
          `\n -- ERRO AO ENVIAR [Código cliente: ${cliente[0]}, Fone: ${phone}]. Detalhes: ${e.message} -- `,
        );

        // Atualiza coluna se foi enviado ou nao
        dados[index][4] = 'nao';

        // Atualiza coluna se foi numero esta correto ou nao
        if (e.message.includes('No element found for selector'))
          dados[index][4] = 'nao';
      }
    }

    console.log('\n- Fim dos envios -');
    await browser.close();

    // Atualiza planilha
    const updatedWorksheet = XLSX.utils.json_to_sheet(dados);

    // Criar um novo workbook com a planilha atualizada
    const updatedWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      updatedWorkbook,
      updatedWorksheet,
      'RelCliente',
    );

    // Salvar o arquivo XLSX atualizado
    XLSX.writeFile(updatedWorkbook, 'src/clientes/RelCliente.xlsx');
  }

  async delay(time: number) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }
}
