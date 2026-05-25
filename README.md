# StackShop - Frontend
## 🚀 Como Iniciar

Siga os passos abaixo para configurar e rodar o projeto em sua máquina local.

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (recomendado v18 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

### 🔧 Instalação

1. Clone o repositório ou baixe os arquivos do projeto.
2. No terminal, navegue até a pasta raiz do projeto:
   ```bash
   cd frontend
   ```
3. Instale as dependências necessárias:
   ```bash
   npm install
   ```

### 🏃 Rodando o Projeto

Para iniciar o servidor de desenvolvimento, execute:

```bash
npm start
```

O projeto será iniciado e estará disponível em:
[http://localhost:3001](http://localhost:3001)

> **Nota:** O projeto está configurado para rodar na porta **3001** por padrão via arquivo `.env`.

---

## 🛠️ Tecnologias Utilizadas

- **React 19**: Biblioteca principal para construção da interface.
- **TypeScript**: Adiciona tipagem estática para maior segurança e produtividade.
- **Tailwind CSS**: Framework CSS para estilização moderna e rápida.
- **React Router DOM**: Gerenciamento de rotas e navegação.
- **Axios**: Cliente HTTP para consumo da API.
- **Lucide React**: Biblioteca de ícones elegantes.
- **Zod & React Hook Form**: Validação e gerenciamento de formulários.

## 📦 Funcionalidades Principais

- **Autenticação Completa**: Login e cadastro com proteção de rotas.
- **Gestão de Carrinho**: Adição, remoção e persistência de itens.
- **Catálogo de Produtos**: Listagem com filtros e busca.
- **Área Administrativa**: Gestão de inventário e produtos (acesso restrito).
- **Checkout e Pedidos**: Fluxo completo de compra e visualização de histórico.

## ⚙️ Configuração (Variáveis de Ambiente)

O arquivo `.env` na raiz do projeto contém as seguintes configurações:

```env
REACT_APP_API_BASE_URL=http://localhost:3000
PORT=3001
```

- `REACT_APP_API_BASE_URL`: URL onde o seu backend está rodando.
- `PORT`: Porta na qual o frontend será executado localmente.

---
 ---- 

 Respostas questões. 

 Parte 1.A — Perguntas Conceituais
Pergunta 1 — Leitura inicial dos problemas
1. Performance da vitrine

Acredito que a vitrine esteja lenta porque a loja consulta o ERP diretamente para buscar produtos, preços e estoque. Como o ERP é monolítico e recebeu um aumento grande de acessos, ele pode estar ficando sobrecarregado.

O impacto direto é uma pior experiência para o cliente. Se a página demora para carregar, muitos usuários podem desistir antes mesmo de ver os produtos.

Minha primeira ação seria medir quais rotas são mais acessadas, verificar a latência e identificar gargalos. Depois disso, avaliaria cache, paginação, otimização de queries e redução de chamadas diretas ao ERP.

2. Consistência de estoque

A causa mais provável é concorrência no checkout. Quando vários clientes compram o mesmo produto quase ao mesmo tempo, o sistema pode confirmar mais pedidos do que o estoque disponível.

Isso gera venda de produtos que a empresa não possui, causando cancelamentos, reclamações e perda de confiança do cliente.

Eu começaria analisando como o estoque é consultado e atualizado durante a compra. Uma melhoria seria ter uma etapa de validação ou reserva de estoque antes de confirmar o pedido.

3. Resiliência do checkout

O timeout provavelmente acontece porque a API depende do ERP para processar o pedido e gerar faturamento de forma síncrona. Se o ERP demora, a requisição falha.

Isso deixa o cliente sem saber se a compra foi concluída ou não, podendo gerar abandono da compra ou até tentativas duplicadas.

Minha primeira investigação seria entender se o timeout ocorre antes ou depois da criação do pedido. Para melhorar, eu separaria o processamento demorado usando filas e workers, deixando a API responder mais rápido ao usuário.

Pergunta 2 — Infraestrutura e serviços de apoio

Eu tentaria reduzir a dependência direta do ERP em cada requisição da loja.

Usaria cache, como Redis, para armazenar dados de leitura frequente, como produtos, categorias e informações de catálogo. Isso diminuiria chamadas repetidas ao ERP e melhoraria o tempo de resposta.

Também usaria filas para processos mais demorados, como criação de pedido, faturamento, atualização de estoque e integração com ERP. Isso evita que o cliente fique esperando todo o processamento acontecer na mesma requisição.

Usaria uma CDN para servir imagens de produtos e arquivos estáticos do front-end, reduzindo latência e carga na infraestrutura principal.

Além disso, manteria monitoramento de tempo de resposta, erros, timeouts, falhas de integração e uso de cache. Isso ajudaria a encontrar gargalos com mais rapidez.

De forma geral, a ideia seria proteger o ERP, criar uma camada mais rápida para a loja e processar tarefas críticas de forma mais controlada.

Pergunta 3 — SDD: Spec-Driven Development

Antes de implementar o endpoint POST /checkout, eu definiria o contrato da API. Isso deixa claro o que o front-end precisa enviar e quais respostas o back-end deve retornar.

Exemplo de entrada:

{
  "productId": "case-iphone-15",
  "quantity": 2,
  "customer": {
    "name": "Ezequiel",
    "email": "ezequiel@email.com"
  }
}

Campos principais:

productId: produto que será comprado.
quantity: quantidade desejada.
customer.name: nome do cliente.
customer.email: e-mail do cliente.

Em caso de sucesso, a API poderia retornar 201 Created:

{
  "checkoutId": "checkout_123",
  "status": "confirmed",
  "message": "Compra realizada com sucesso."
}

Em erro de validação, retornaria 400 Bad Request:

{
  "error": "VALIDATION_ERROR",
  "message": "Quantidade deve ser maior que zero."
}

Se o produto não existir, retornaria 404 Not Found:

{
  "error": "PRODUCT_NOT_FOUND",
  "message": "Produto não encontrado."
}

Se não houver estoque suficiente, retornaria 409 Conflict:

{
  "error": "INSUFFICIENT_STOCK",
  "message": "Estoque insuficiente."
}

Se o ERP ou serviço externo estiver indisponível, retornaria 503 Service Unavailable:

{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Não foi possível finalizar a compra no momento."
}

Definir esse contrato antes ajuda a alinhar front-end, back-end e regra de negócio. Também facilita testes e reduz retrabalho durante a implementação.

Pergunta 4 — TDD: Test-Driven Development

Eu escreveria testes para os principais cenários do POST /checkout.

Cenário 1 — Compra com sucesso

Quando o produto existe e tem estoque suficiente, a API deve criar a tentativa de compra e retornar sucesso.

Resultado esperado:

Status 201 ou 200;
Mensagem de sucesso;
Identificador do checkout ou pedido.
Cenário 2 — Quantidade inválida

Quando a quantidade for zero, negativa ou inválida, a API deve rejeitar a requisição.

Resultado esperado:

Status 400;
Erro de validação;
Mensagem explicando o problema.
Cenário 3 — Produto inexistente

Quando o productId não existir, a API deve retornar erro.

Resultado esperado:

Status 404;
Mensagem informando que o produto não foi encontrado.
Cenário 4 — Estoque insuficiente

Quando a quantidade solicitada for maior que o estoque disponível, a compra não deve ser confirmada.

Resultado esperado:

Status 409;
Mensagem de estoque insuficiente;
Estoque não deve ser alterado incorretamente.
Cenário 5 — Falha na integração

Quando algum serviço externo estiver indisponível, a API deve retornar uma resposta clara.

Resultado esperado:

Status 503;
Mensagem amigável;
Nenhum pedido deve ser confirmado de forma inconsistente.

Escrever os testes antes ajuda a definir o comportamento esperado antes da implementação. Isso força o desenvolvedor a pensar melhor nas regras, nos erros possíveis e evita regressões futuras.

Pergunta 5 — Uso de IA no desenvolvimento

Eu usaria IA como apoio para entender melhor o problema, revisar ideias e acelerar partes repetitivas, mas não como única fonte de decisão.

Alguns prompts que eu usaria:

Prompt 1 — Entendimento do problema

Estou trabalhando em um e-commerce com problema de furo de estoque. Vários clientes conseguem comprar o mesmo produto quando o estoque acaba. O sistema consulta um ERP monolítico via API REST síncrona. Quais podem ser as causas técnicas e quais soluções simples posso aplicar?

Prompt 2 — Consistência de estoque

Explique formas de evitar overselling em um checkout. Compare reserva de estoque, lock otimista, lock pessimista, fila de processamento e controle transacional em uma aplicação Node.js com TypeScript.

Prompt 3 — Fluxo de checkout

Me ajude a desenhar um fluxo simples de checkout com validação de estoque, reserva temporária, confirmação da compra e integração com ERP. Mostre os principais estados e falhas possíveis.

Prompt 4 — Testes

Quais testes devo escrever para garantir que o endpoint POST /checkout não permita vender mais produtos do que o estoque disponível?

Prompt 5 — Revisão da solução

Revise minha proposta para evitar furo de estoque usando validação antes da compra, reserva temporária e processamento assíncrono com fila. Aponte riscos, trade-offs e melhorias simples.