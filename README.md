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
