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

 Pergunta 1 — Leitura inicial dos problemas
1. Performance da vitrine

Acredito que a lentidão da vitrine esteja acontecendo porque a loja virtual consulta o ERP diretamente para buscar informações como produtos, preços e estoque. Como o ERP é monolítico e também cuida de várias outras áreas da empresa, o aumento grande de acessos acaba gerando uma sobrecarga.

O impacto disso para o cliente é uma experiência ruim logo no início da compra. Se a página demora muitos segundos para carregar, existe uma grande chance de o usuário desistir antes mesmo de visualizar os produtos. Para o negócio, isso significa perda de vendas e piora na conversão.

Minha primeira hipótese seria analisar quais rotas são mais acessadas, medir o tempo de resposta e identificar os principais gargalos. Depois disso, eu avaliaria melhorias como cache para dados de leitura, otimização de queries, paginação melhor estruturada e redução de chamadas diretas ao ERP.

2. Consistência de estoque

A causa mais provável é um problema de concorrência no momento da compra. Quando muitos clientes tentam comprar o mesmo produto em um intervalo muito curto, o sistema pode permitir mais de uma compra antes que o estoque seja atualizado corretamente.

Isso causa um impacto sério para o negócio, porque a empresa passa a vender produtos que não possui. Além de gerar cancelamentos, isso prejudica a confiança do cliente e aumenta o trabalho do suporte e da operação.

Minha primeira hipótese seria analisar como o estoque é validado durante o checkout. Uma melhoria possível seria criar uma etapa mais segura de confirmação ou reserva de estoque antes da finalização da compra. Assim, o sistema reduziria o risco de confirmar pedidos para produtos que já acabaram.

3. Resiliência do checkout

No problema do checkout, acredito que o timeout aconteça porque a API da loja depende do ERP para processar o pedido e gerar faturamento de forma síncrona. Se o ERP demora para responder, o cliente acaba esperando demais e a requisição pode falhar.

O impacto para o cliente é uma experiência confusa, porque ele não sabe se a compra foi concluída ou não. Isso pode fazer com que ele tente comprar novamente, gerando risco de duplicidade, ou simplesmente abandone a compra.

Minha primeira hipótese seria entender em qual etapa o timeout acontece: antes ou depois da criação do pedido. Uma forma de melhorar seria separar o processamento mais demorado do fluxo principal, registrando a tentativa de compra e usando uma fila para processar a integração com o ERP em segundo plano.

Pergunta 2 — Infraestrutura e serviços de apoio

De forma geral, eu tentaria reduzir a dependência direta do ERP em cada requisição da loja virtual. Como o ERP é um sistema central e monolítico, ele não deveria ser chamado a todo momento para consultas que poderiam ser resolvidas por uma camada mais rápida.

Um dos primeiros recursos que eu usaria seria cache, por exemplo com Redis. Ele poderia armazenar dados que não mudam a todo instante, como produtos, categorias e informações de catálogo. Isso reduziria a quantidade de chamadas ao ERP e melhoraria o tempo de resposta da vitrine.

Também usaria filas para processos mais demorados ou sensíveis, como criação de pedidos, atualização de estoque, faturamento e integração com o ERP. Ferramentas como RabbitMQ, Kafka, SQS ou serviços equivalentes poderiam ajudar nesse ponto. A ideia seria evitar que o cliente fique esperando todo o processamento acontecer de forma síncrona.

Outro ponto importante seria usar uma CDN para servir imagens dos produtos, arquivos estáticos e assets do front-end. Isso ajudaria a reduzir a latência para os usuários e diminuiria a carga na infraestrutura principal.

Além disso, manteria um bom monitoramento, acompanhando métricas como tempo de resposta, taxa de erro, timeouts, falhas de integração, uso de cache e quantidade de pedidos processados. Com esses dados, seria mais fácil identificar gargalos e tomar decisões com base em evidências.

De forma geral, minha proposta seria evoluir a arquitetura aos poucos, criando uma camada intermediária mais rápida para a loja virtual, protegendo o ERP contra excesso de chamadas e usando cache, filas, workers, CDN e monitoramento para melhorar performance e resiliência.

Pergunta 3 — SDD: Spec-Driven Development

Antes de implementar o endpoint POST /checkout, eu começaria definindo o contrato da API. Isso ajuda a deixar claro quais dados a rota precisa receber, quais respostas ela deve devolver e como o front-end deve lidar com cada cenário.

O endpoint precisaria receber informações básicas para criar uma tentativa de compra, como o produto, a quantidade e os dados do cliente.

Exemplo de entrada:

{
  "productId": "case-iphone-15",
  "quantity": 2,
  "customer": {
    "name": "Ezequiel",
    "email": "ezequiel@email.com"
  }
}

Os principais campos seriam:

productId: identifica o produto que o usuário deseja comprar.
quantity: informa a quantidade desejada.
customer.name: nome do cliente.
customer.email: e-mail para identificação ou contato.

Em caso de sucesso, a API poderia retornar 201 Created, informando que a tentativa de compra foi criada com sucesso.

Exemplo:

{
  "checkoutId": "checkout_123",
  "status": "confirmed",
  "message": "Compra realizada com sucesso.",
  "productId": "case-iphone-15",
  "quantity": 2
}

Em caso de erro de validação, como quantidade inválida ou e-mail incorreto, a API poderia retornar 400 Bad Request.

{
  "error": "VALIDATION_ERROR",
  "message": "Quantidade deve ser maior que zero."
}

Se o produto não existir, a resposta poderia ser 404 Not Found.

{
  "error": "PRODUCT_NOT_FOUND",
  "message": "Produto não encontrado."
}

Se não houver estoque suficiente, a API poderia retornar 409 Conflict.

{
  "error": "INSUFFICIENT_STOCK",
  "message": "Estoque insuficiente para a quantidade solicitada."
}

Caso a integração com o ERP ou algum serviço externo esteja indisponível, a API poderia retornar 503 Service Unavailable.

{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Não foi possível finalizar a compra no momento. Tente novamente em alguns instantes."
}

Definir esse contrato antes de codificar é importante porque alinha a comunicação entre front-end, back-end e regras de negócio. Também ajuda a pensar nos cenários de erro desde o início, facilita a criação de testes e evita retrabalho durante a implementação.

Pergunta 4 — TDD: Test-Driven Development

Para o endpoint POST /checkout, eu escreveria testes cobrindo os principais cenários de sucesso e erro.

Cenário 1 — Compra realizada com sucesso

Quando o usuário informa um produto existente e uma quantidade válida, e existe estoque suficiente, a API deve criar a tentativa de compra e retornar uma resposta de sucesso.

Resultado esperado:

Status HTTP 201 ou 200;
Mensagem de sucesso;
Identificador do checkout ou pedido;
Status da compra como confirmed ou equivalente.
Cenário 2 — Quantidade inválida

Quando o usuário envia uma quantidade inválida, como zero, número negativo ou valor não numérico, a API deve rejeitar a requisição.

Resultado esperado:

Status HTTP 400;
Erro de validação;
Mensagem clara explicando o problema.
Cenário 3 — Produto inexistente

Quando o usuário informa um productId que não existe, a API deve retornar um erro informando que o produto não foi encontrado.

Resultado esperado:

Status HTTP 404;
Mensagem informando que o produto não existe.
Cenário 4 — Estoque insuficiente

Quando o usuário tenta comprar uma quantidade maior do que o estoque disponível, a API deve impedir a compra.

Resultado esperado:

Status HTTP 409;
Mensagem informando estoque insuficiente;
O estoque não deve ser alterado de forma incorreta.
Cenário 5 — Falha na integração

Quando algum serviço externo ou integração simulada estiver indisponível, a API deve retornar uma resposta compreensível para o usuário.

Resultado esperado:

Status HTTP 503;
Mensagem amigável informando que não foi possível finalizar a compra;
Nenhuma compra deve ser confirmada de forma inconsistente.

Existe vantagem em escrever os testes antes da implementação porque isso ajuda a definir o comportamento esperado da rota antes de escrever a lógica. Dessa forma, o desenvolvedor pensa primeiro nas regras de negócio, nos cenários de erro e nas respostas esperadas.

Além disso, os testes servem como uma documentação executável. Se no futuro alguma alteração quebrar o comportamento esperado, os testes ajudam a identificar o problema rapidamente e evitam regressões, como permitir compra sem estoque ou aceitar dados inválidos.

Pergunta 5 — Uso de IA no desenvolvimento

Se eu fosse usar IA para ajudar na solução do problema de furo de estoque, eu usaria como apoio para analisar possibilidades, validar hipóteses e revisar a solução proposta. Eu não usaria a IA como única fonte de decisão, mas como uma ferramenta para acelerar o raciocínio e levantar pontos que talvez eu não tenha considerado.

Alguns prompts que eu usaria seriam:

Prompt 1 — Entendimento do problema

Estou trabalhando em um e-commerce que está com problema de furo de estoque. Vários clientes conseguem comprar o mesmo produto mesmo quando o estoque já acabou. O sistema atual consulta um ERP monolítico via API REST síncrona. Quais são as possíveis causas técnicas desse problema e quais soluções simples poderiam ser aplicadas em uma arquitetura inicial?

Prompt 2 — Estratégias de consistência

Explique alternativas para evitar overselling em um checkout de e-commerce. Compare soluções como lock pessimista, lock otimista, reserva temporária de estoque, fila de processamento e controle transacional. Considere uma solução simples usando Node.js e TypeScript.

Prompt 3 — Fluxo de checkout

Me ajude a desenhar um fluxo simples de checkout com reserva de estoque. O usuário seleciona um produto e quantidade, o sistema valida o estoque, reserva temporariamente, confirma a compra e depois integra com um ERP. Mostre os principais estados possíveis e como tratar falhas.

Prompt 4 — Testes automatizados

Quais testes automatizados eu deveria escrever para garantir que um endpoint POST /checkout não permita vender mais itens do que o estoque disponível? Inclua cenários de concorrência, estoque insuficiente, produto inexistente e falha na integração externa.

Prompt 5 — Revisão crítica da solução

Revise esta proposta de solução para evitar furo de estoque em um e-commerce: a solução usa uma camada própria de estoque, validação antes da compra, reserva temporária e processamento assíncrono com fila. Aponte riscos, trade-offs e melhorias simples.