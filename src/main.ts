import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as readline from 'readline';
import { AppService } from './app.service';

async function init() {
  const service = new AppService();

  // Cria uma interface de leitura para ler a entrada do usuário
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    '\nInformações:' +
      '\n- Lembra-se de deixar a planilha atualizada antes de enviar e tambem o nome precisa ser RelCliente.xlsx' +
      '\n- Para enviar mensagens conforme a planilha importada, digite sim e em seguida a mensagem que queira mandar.' +
      '\n  EXEMPLO: sim, Olá, teste de mensagem' +
      '\n  OBS: Caso não queira mudar a mensagem, a mensagem padrão está como: ' +
      service.mensagemPadrao +
      '\n- Caso queira parar a execução do programa pressione 2x(ctrl + c).' +
      '\nR: ',
    async (answer) => {
      if (answer.toLowerCase().substring(0, 5) === 'sim, ') {
        await service.send(answer.replace('sim, ', ''));
      } else if (answer.toLowerCase().substring(0, 3) === 'sim') {
        await service.send();
      }

      rl.close(); // Fecha a interface de leitura
    },
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  await init();
}
bootstrap();
