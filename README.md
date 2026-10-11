# Lar de Latas — adoção responsável de animais

Front-end da plataforma **Lar de Latas**. O objetivo é conectar animais disponíveis para adoção com pessoas interessadas e permitir o cadastro e a divulgação de animais perdidos.

Este repositório é só a interface. Os dados vêm de uma API HTTP separada. Sem o back-end acessível, login, listagens e cadastros não funcionam.

Projeto educacional (Extensionista P2).

## Principais funcionalidades

Implementadas e ligadas à API:

- Página inicial com animais em destaque e explicação do processo de adoção.
- Cadastro de usuário e login com sessão por cookie.
- Listagem, detalhe, cadastro, edição parcial e exclusão de animais para adoção.
- Solicitação de adoção e acompanhamento das solicitações enviadas e recebidas.
- Conclusão ou recusa de uma solicitação pelo responsável do animal.
- Listagem, cadastro, edição, exclusão e marcação de animais perdidos como encontrados.
- Painel autenticado com resumo de números.
- Perfil com atualização de nome e sobrenome e lista dos animais do usuário.

Ainda incompletas ou sem uso na interface (detalhes na seção [Limitações e observações](#limitações-e-observações)):

- Recuperação de senha.
- Troca de foto do perfil.
- Exclusão da conta.
- Troca de senha.

## Relação com o back-end

O front-end não guarda os animais nem autentica sozinho. Cada tela chama a API pela instância Axios em `src/services/api.ts`. A URL base vem de `VITE_API_BASE_URL`.

A sessão é um cookie enviado pelo navegador (`withCredentials: true`). O front-end também guarda um recorte do usuário em `localStorage`, usado para saber se há sessão antes de chamar rotas protegidas. Quem autoriza de fato é o cookie no servidor.

## Tecnologias utilizadas

Versões declaradas em `package.json` (com `^`, então o `npm install` pode instalar uma versão compatível mais nova).

| Tecnologia | Onde aparece | Função |
| --- | --- | --- |
| TypeScript 5.6 | `typescript`, `tsconfig*.json` | Linguagem da aplicação, com checagem estrita. |
| React 18 e React DOM | dependências e `src/main.tsx` | Biblioteca de interface. A entrada monta o app em `#root`. |
| Vite 6 | `vite`, `vite.config.ts` | Servidor de desenvolvimento, build e preview. Plugin `@vitejs/plugin-react`. |
| TanStack Router 1 | `src/routes/` e `src/routes/-router.tsx` | Rotas da aplicação. O plugin `@tanstack/router-plugin` está no Vite. |
| HeroUI 2 (`@heroui/react`) | telas e `tailwind.config.ts` | Componentes visuais (botões, cards, inputs, modais, abas, navbar). |
| Tailwind CSS 3 | `tailwind.config.ts`, `postcss.config.mjs`, `src/index.css` | Estilização por classes utilitárias. |
| PostCSS e Autoprefixer | `postcss.config.mjs` | Processamento do CSS do Tailwind. |
| Axios 1 | `src/services/api.ts` | Cliente HTTP. |
| TanStack Query 5 | `src/app/providers.tsx` e `src/hooks/` | Cache, carregamento e atualização dos dados da API. |
| `clsx` e `tailwind-merge` | `src/lib/utils.ts` (`cn`) | Junção de classes CSS. A função existe; as telas não a chamam. |
| Framer Motion 11 | `package.json` | Dependência instalada. O código da aplicação não importa `framer-motion`. O HeroUI usa essa biblioteca nas animações dos componentes. |

Ferramentas de desenvolvimento:

- ESLint 9, com `typescript-eslint`, `eslint-plugin-react-hooks` e `eslint-plugin-react-refresh` (`eslint.config.js`). Comando: `npm run lint`.
- Devtools do TanStack Query e do TanStack Router, exibidos só em desenvolvimento.
- `@types/node`, `@types/react` e `@types/react-dom`.

Não identificados no código-fonte:

- Biblioteca de formulários (React Hook Form, Formik ou similar). Os formulários usam `useState` e validação escrita na própria tela.
- Biblioteca de validação de schema (Zod, Yup ou similar).
- Biblioteca de estado global (Redux, Zustand ou Context próprio da aplicação). O estado do servidor fica no TanStack Query; o restante fica em estado local e em `localStorage`.
- Testes automatizados (Jest, Vitest, Cypress, Playwright ou arquivos `*.test` / `*.spec`).

O projeto **não usa Next.js**. Existe o arquivo residual `src/app/layout.tsx`, no formato de layout do Next.js, mas `src/main.tsx` não o importa. A entrada real é o Vite, por `index.html`.

## Pré-requisitos

- **Node.js 18 ou superior.** O arquivo `.nvmrc` indica `18.17.0`. O Vite 6, conforme o `package-lock.json`, aceita Node `^18`, `^20` ou `>=22`.
- **npm**, usado pelo `package-lock.json` deste projeto. Não há `yarn.lock` nem `pnpm-lock.yaml`.
- **API do Lar de Latas em execução** e acessível na URL configurada em `VITE_API_BASE_URL`.

`package.json` não declara o campo `engines`.

## Instalação e execução

Na pasta do front-end:

```bash
npm install
```

Crie um arquivo `.env` na raiz (veja [Variáveis de ambiente](#variáveis-de-ambiente)).

Desenvolvimento (porta **3001**, definida em `vite.config.ts`; o navegador abre sozinho):

```bash
npm run dev
```

Acesse `http://localhost:3001`.

Build de produção (saída em `dist/`):

```bash
npm run build
```

Servir localmente o build já gerado:

```bash
npm run preview
```

A porta do preview **não** está definida em `vite.config.ts`. O padrão do Vite para esse comando é `4173`.

Verificação estática:

```bash
npm run lint
```

Não existe script de testes em `package.json`. Também não existe `npm start`.

A URL do repositório remoto não foi identificada neste diretório (não há repositório Git configurado aqui). Para obter o código, use o clone fornecido pela equipe ou abra esta pasta localmente.

## Variáveis de ambiente

O Vite só expõe ao navegador variáveis com o prefixo `VITE_`. Elas são lidas em tempo de build e de `npm run dev` por `import.meta.env`. Depois de alterar o `.env`, reinicie o servidor de desenvolvimento.

| Variável | Usada no código | Finalidade |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Sim. `src/services/api.ts` e `src/lib/utils.ts` | URL base da API, já com o prefixo `/api`. Se estiver vazia, o código usa `http://localhost:3000/api`. |
| `VITE_APP_NAME` | Não. Aparece no `.env` atual, mas nenhum arquivo em `src/` a lê. | Sem efeito na aplicação. |

Exemplo seguro de `.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Lar de Latas
```

Troque o host e a porta pelo endereço real da API. O valor precisa terminar em `/api`, porque os serviços concatenam caminhos como `/auth/login` e `/pet`.

Fotos devolvidas pela API como caminho relativo (`/uploads/...`) são montadas em `resolveApiImageUrl`: o código remove o sufixo `/api` da URL base e usa a origem restante. Uma base `http://localhost:3000/api` faz a imagem ser pedida em `http://localhost:3000/uploads/...`.

O arquivo `.env.example` ainda lista variáveis de Next.js (`NEXT_PUBLIC_*`, `NEXTAUTH_*`, Cloudinary). O código atual não lê essas variáveis.

Não há proxy de API em `vite.config.ts`. O navegador chama a API direto. Como front (porta 3001) e API costumam estar em origens diferentes, o back-end precisa permitir a origem do front **com credenciais** (cookies). Essa configuração de CORS não está neste repositório.

## Estrutura de pastas

```
front-lar-de-latas/
├── index.html                 # HTML do Vite; monta src/main.tsx
├── vite.config.ts             # Vite, alias @ -> src, porta 3001
├── tailwind.config.ts         # Tema e plugin do HeroUI
├── postcss.config.mjs
├── eslint.config.js
├── tsconfig.json              # Referências para app e node
├── tsconfig.app.json          # TypeScript do src (strict, alias @)
├── tsconfig.node.json         # TypeScript do vite.config.ts
├── .nvmrc                     # Node 18.17.0
├── .env                       # Variáveis locais (não versionar segredos)
├── .env.example               # Exemplo desatualizado (variáveis de Next.js)
├── public/
│   └── vite.svg               # Ícone referenciado em index.html
├── ACCESSIBILITY.md           # Notas de acessibilidade do projeto
└── src/
    ├── main.tsx               # Entrada React
    ├── index.css              # Tailwind, variáveis de cor e foco visível
    ├── vite-env.d.ts
    ├── app/
    │   ├── providers.tsx      # QueryClient, HeroUI e RouterProvider
    │   └── layout.tsx         # Residual de Next.js; não é a entrada
    ├── routes/                # Definição das rotas (TanStack Router)
    │   ├── -router.tsx        # Router usado pela aplicação
    │   └── ...
    ├── routeTree.gen.ts       # Árvore gerada pelo plugin; não é importada pelo router ativo
    ├── features/              # Telas por domínio
    │   ├── home/
    │   ├── auth/
    │   ├── animals/
    │   ├── lostPets/
    │   ├── adoptions/
    │   ├── dashboard/
    │   └── profile/
    ├── components/            # Componentes compartilhados
    ├── layouts/               # Navbar, sidebar e layouts público e autenticado
    ├── hooks/                 # TanStack Query e sessão
    ├── services/              # Chamadas HTTP
    ├── types/                 # Tipos e DTOs (index.ts, dtos.ts)
    ├── lib/utils.ts           # Datas, máscaras, rótulos e URL de imagem
    └── mocks/                 # Dados de exemplo; nenhuma tela os importa
```

Não há pasta de testes.

## Visão geral das telas e rotas

O router ativo está em `src/routes/-router.tsx`. As rotas protegidas usam `beforeLoad` e checam se existe a chave `user` no `localStorage`. Sem ela, a navegação vai para `/login` com um parâmetro de busca `redirect`. A tela de login **não lê** esse parâmetro: depois do sucesso, o usuário sempre cai em `/dashboard`.

O componente `src/components/ProtectedRoute.tsx` existe, mas nenhuma rota o usa.

| Tela | Rota | Objetivo | Principais funcionalidades | Componentes relevantes | Autenticação |
| --- | --- | --- | --- | --- | --- |
| Página inicial | `/` | Apresentar a plataforma e animais disponíveis | Destaque da primeira página de pets com status `Disponivel` (até 6), seção "Como funciona" e atalho para perdidos | `HomePage`, `PublicLayout`, `AnimalCard`, `LoadingState` | Não |
| Login | `/login` | Entrar na conta | E-mail e senha, exibição de erros da API e aviso de sessão expirada. O botão "Esqueci minha senha" não tem ação | `LoginPage`, `PublicLayout` | Não |
| Cadastro de usuário | `/registro` | Criar conta | Nome, sobrenome, contato, idade, sexo, CPF, endereço e senha. Após o sucesso a sessão já fica aberta | `RegisterPage`, `PublicLayout` | Não |
| Animais para adoção | `/animais` | Listar pets | Busca e filtros no cliente sobre a página atual, paginação no servidor (12 por página), solicitação de adoção e cadastro em modal | `AnimalsListPage`, `AnimalCard`, `AnimalFormModal`, `EmptyState`, `LoadingState`, `ErrorState` | Ver a lista: não. Cadastrar ou solicitar adoção: sim |
| Detalhe do animal | `/animais/$id` | Ver um pet | Dados, foto, solicitação de adoção e exclusão quando o usuário é o dono | `AnimalDetailPage`, `ConfirmDialog` | Ver: não. Adotar: sim. Excluir: sessão e ser o dono |
| Cadastro de animal | `/animais/cadastrar` | Formulário em página inteira | Mesmos dados do modal, com foto (JPEG, PNG, WebP ou GIF, até 5 MB) | `AnimalRegisterPage`, `AuthenticatedLayout` | Sim |
| Animais perdidos | `/perdidos` | Divulgar e consultar perdidos | Filtros no cliente, cadastro em modal, contato telefônico. O dono pode editar, excluir e marcar como encontrado | `LostPetsListPage`, `LostPetCard`, `LostPetFormModal`, `ConfirmDialog` | Ver a lista: não. Registrar, editar, excluir ou marcar encontrado: sim (editar/excluir/marcar só o dono) |
| Cadastro de animal perdido | `/perdidos/cadastrar` | Formulário em página inteira | `LostPetForm` e envio multipart | `LostPetRegisterPage`, `LostPetForm` | Sim |
| Edição de animal perdido | `/perdidos/editar/$petId` | Alterar um anúncio | Atualiza os campos de texto. A foto não é enviada neste fluxo | `LostPetEditPage`, `LostPetForm` | Sim. Quem não é o dono vê um estado vazio |
| Minhas adoções | `/adocoes` | Acompanhar solicitações | Abas de recebidas e enviadas. O responsável pode concluir ou recusar. Atualização automática a cada 10 segundos | `AdoptionsPage`, `AdoptionCard` | Sim |
| Dashboard | `/dashboard` | Resumo da conta | Cartões com totais da API e contagem local de solicitações | `DashboardPage`, `AuthenticatedLayout`, `LoadingState` | Sim |
| Perfil | `/perfil` | Dados e registros do usuário | Consulta do perfil, edição de nome e sobrenome, exclusão dos próprios animais e lista somente leitura dos perdidos | `ProfilePage`, `AnimalCard`, `ConfirmDialog` | Sim |

Não há rota de detalhe só de animal perdido. O card na listagem já mostra contato e ações.

Não há página dedicada de "não encontrado". Uma rota inexistente não está mapeada em `src/routes/`.

`src/routeTree.gen.ts` registra a edição de perdido como `/perdidos/editar`, sem `$petId`. Esse arquivo não é o router usado em `src/app/providers.tsx`. A rota em uso é a de `src/routes/perdidos/editar.tsx`: `/perdidos/editar/$petId`.

## Integração com o back-end

Todas as chamadas passam por `src/services/api.ts`:

- `baseURL`: `VITE_API_BASE_URL` ou `http://localhost:3000/api`.
- Timeout de 30 segundos.
- Cabeçalho padrão `Content-Type: application/json`.
- `withCredentials: true`, para o navegador enviar o cookie da API.
- Interceptor de resposta para 401 e falha de rede.

Os serviços em `src/services/` centralizam os endpoints. Os hooks em `src/hooks/` usam esses serviços com TanStack Query. As telas não montam URLs na mão.

### Endpoints consumidos

Prefixo implícito: o valor de `VITE_API_BASE_URL`.

| Método | Caminho | Serviço | Uso |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | `auth.service.ts` | Login. Corpo `{ email, senha }`. Resposta com `user`. |
| `POST` | `/auth/register` | `auth.service.ts` | Cadastro. Corpo com dados pessoais, `password`, `sexo` e `address`. |
| `GET` | `/auth/me` | `auth.service.ts` e `users.service.ts` | Usuário da sessão atual. |
| `POST` | `/auth/logout` | `auth.service.ts` | Encerra a sessão no servidor. |
| `PATCH` | `/user/:id` | `users.service.ts` | Atualiza nome, sobrenome, idade ou foto (a tela só envia nome e sobrenome). |
| `DELETE` | `/user/:id` | `users.service.ts` | Exclusão de conta. O hook existe; nenhuma tela o chama. |
| `GET` | `/user/:id` | `users.service.ts` | Usuário por id. |
| `GET` | `/pet` | `animals.service.ts` | Lista paginada. Query `page` e `limit` (1 a 100). Resposta `{ data, meta }`. |
| `GET` | `/pet/:id` | `animals.service.ts` | Um pet. O código espera `{ pets }` com um objeto. 404 vira `null`. |
| `POST` | `/pet` | `animals.service.ts` | Cria pet em `multipart/form-data`, campo de arquivo `foto`. |
| `PATCH` | `/pet/:id` | `animals.service.ts` | Atualiza pet em JSON. O código não envia foto nem status. |
| `DELETE` | `/pet/:id` | `animals.service.ts` | Remove pet. |
| `POST` | `/adoption` | `adoptions.service.ts` | Solicitação `{ petId, observacoes? }`. O solicitante sai da sessão. |
| `GET` | `/adoption/received` | `adoptions.service.ts` | Solicitações dos pets do usuário. |
| `GET` | `/adoption/sent` | `adoptions.service.ts` | Solicitações feitas pelo usuário. |
| `PATCH` | `/adoption/:id/complete` | `adoptions.service.ts` | Conclui a adoção. |
| `PATCH` | `/adoption/:id/reject` | `adoptions.service.ts` | Recusa a solicitação. |
| `GET` | `/lost-pets` | `lostPets.service.ts` | Lista completa (array). Filtros são aplicados no cliente. |
| `GET` | `/lost-pets/:id` | `lostPets.service.ts` | Um registro. |
| `POST` | `/lost-pets` | `lostPets.service.ts` | Cria registro em `multipart/form-data`. |
| `PATCH` | `/lost-pets/:id` | `lostPets.service.ts` | Atualiza em JSON. A resposta esperada é `{ lostPet, mensagem }`. |
| `DELETE` | `/lost-pets/:id` | `lostPets.service.ts` | Remove o registro. |
| `GET` | `/dashboard/stats` | `dashboard.service.ts` | Números do painel. |

Não há endpoint próprio de "meus pets" nem de "meus perdidos". O front-end baixa a lista e filtra por `userId`. Para pets, percorre as páginas (limite 100, no máximo 50 requisições). Marcar um perdido como encontrado é um `PATCH` com `{ encontrado: true }`.

### Envio, recebimento, erros e estados vazios

- JSON nas leituras, login, cadastro de usuário, atualizações e adoções.
- `FormData` na criação de pet e de animal perdido, com `Content-Type: multipart/form-data` para não perder o arquivo.
- `getErrorMessage` lê `response.data.message` quando a resposta é do Axios.
- Login trata rede, 401 (credenciais), 500 e a mensagem do servidor.
- Cadastro trata rede, 409 (e-mail ou CPF já usado), 400 (mensagem única ou lista) e 500.
- Listagens e detalhes usam `LoadingState`, `ErrorState` e `EmptyState` quando o hook indica carregamento, erro ou lista vazia.
- Um 401 com usuário no `localStorage`, fora de `/auth/login`, `/auth/register` e `/auth/logout`, apaga `user`, grava `auth:session-expired` no `sessionStorage` e manda para `/login`. A tela de login mostra o aviso. Visitante sem `user` no `localStorage` não é redirecionado: um 401 em listagem pública não deve expulsar quem só está navegando.
- Falha de rede sem `error.response` é registrada no console e a Promise continua rejeitada.
- O dashboard, se `GET /dashboard/stats` falhar, não mostra `ErrorState`: os cartões caem no valor zero do fallback.
- Cache padrão do QueryClient: uma nova tentativa, dados considerados frescos por 5 minutos, sem refetch ao focar a janela. Adoções recebidas e enviadas são a exceção: atualizam a cada 10 segundos e ao focar a janela.

Filtros de espécie, sexo, status, idade e texto em animais **não** são enviados à API. Eles filtram só os itens da página já carregada. Com filtro ativo, a tela avisa que a contagem é da página atual.

## Autenticação e gerenciamento de sessão

Não há JWT nem token gravado pelo front-end.

1. **Login.** `POST /auth/login` com e-mail e senha. O código espera que o servidor responda com o usuário e defina um cookie de sessão (os comentários do código citam um cookie HttpOnly, referido como `JSESSIONID`). O objeto `user` é salvo em `localStorage`. Em seguida a página recarrega em `/dashboard`.
2. **Cadastro.** `POST /auth/register` também grava `user` no `localStorage` e vai para `/dashboard`. O código trata o cadastro como abertura de sessão.
3. **Como a sessão permanece.** O cookie vai em toda requisição da instância Axios por causa de `withCredentials: true`. O front-end não coloca o cookie no header manualmente. `GET /auth/me` é a fonte usada pelo perfil e pelos layouts autenticados. O `localStorage` é o atalho para o guarda de rota e para não piscar a interface antes do `/auth/me`.
4. **Rotas protegidas.** `beforeLoad` em `/dashboard`, `/adocoes`, `/perfil`, `/animais/cadastrar`, `/perdidos/cadastrar` e `/perdidos/editar/$petId`. A checagem é a presença de `user` no `localStorage`, não uma chamada ao servidor.
5. **Dono do registro.** `useIsOwner` compara o id da sessão com `userId` do pet ou do anúncio. Botões de excluir, editar e marcar encontrado só aparecem para o dono. A regra definitiva precisa ser aplicada pela API.
6. **Logout.** `POST /auth/logout`, remoção de `user` do `localStorage` (mesmo se a chamada falhar), limpeza do cache do TanStack Query e navegação para `/login`. O botão fica na navbar e na sidebar.
7. **Sessão expirada.** Ver o tratamento de 401 na seção anterior.

Origens diferentes: o cookie só é enviado se o back-end responder com CORS permitindo a origem do front e `Access-Control-Allow-Credentials`. Essa configuração não está neste repositório.

## Componentes reutilizáveis

| Componente | Responsabilidade |
| --- | --- |
| `AnimalCard` | Card do pet com link para o detalhe. Pode mostrar adotar ou excluir. |
| `AdoptionCard` | Card de solicitação recebida ou enviada, com aprovar e recusar. |
| `LostPetCard` | Card de perdido, contato, editar, marcar encontrado e excluir. |
| `AnimalFormModal` | Modal de cadastro de pet, usado na listagem. |
| `LostPetFormModal` | Modal de cadastro de perdido, usado na listagem. |
| `LostPetForm` | Formulário compartilhado pelas páginas de cadastrar e editar perdido. |
| `ConfirmDialog` | Confirmação de exclusão. |
| `EmptyState` | Lista ou registro vazio, com ação opcional. |
| `LoadingState` | Spinner ou esqueletos de carregamento. |
| `ErrorState` | Mensagem de erro, com botão de tentar de novo quando a tela passa `onRetry`. |
| `ProtectedRoute` | Redireciona para `/login` se `useIsAuthenticated` for falso. Não é usado pelas rotas atuais. |
| `PublicLayout` | Navbar, conteúdo e rodapé das telas públicas. |
| `AuthenticatedLayout` | Sidebar e conteúdo das telas logadas. Carrega `/auth/me`. |
| `Navbar` | Menu público, entrada, cadastro, atalhos da conta e logout. |
| `Sidebar` | Menu do usuário autenticado e logout. |

## Fluxos principais do usuário

### Cadastro e login — completo

1. Em `/registro`, o usuário preenche os dados. CPF e CEP seguem só com dígitos. A senha precisa ter pelo menos 8 caracteres e coincidir com a confirmação. A tela também mostra requisitos de maiúscula, minúscula e número, mas o botão habilita com os 8 caracteres e a confirmação igual.
2. `POST /auth/register` grava a sessão e abre `/dashboard`.
3. Em `/login`, e-mail e senha chamam `POST /auth/login` e também abrem `/dashboard`.
4. Sair chama `POST /auth/logout` e volta para `/login`.

Recuperação de senha: botão visível, fluxo não implementado.

### Cadastro e visualização de animais — completo, com ressalvas

1. Qualquer pessoa abre `/` e `/animais` e entra no detalhe `/animais/$id`.
2. Usuário autenticado cadastra pela página `/animais/cadastrar` ou pelo modal da listagem (`POST /pet` com foto opcional).
3. A listagem pagina no servidor e filtra no cliente só a página corrente.
4. O dono exclui o pet no detalhe ou na aba "Meus Animais" do perfil (`DELETE /pet/:id`).
5. Não há tela de edição de pet para adoção. `animalsService.update` existe e não é chamado por nenhuma página.

### Divulgação de animais perdidos — completo, com ressalvas

1. Qualquer pessoa consulta `/perdidos`, com filtros locais de texto, espécie e localização.
2. Usuário autenticado registra pelo modal ou por `/perdidos/cadastrar`.
3. O dono edita em `/perdidos/editar/$petId` (sem nova foto), marca como encontrado ou exclui, com confirmação na exclusão.
4. Não há página de detalhe separada.

### Solicitação de adoção — completo

1. Na listagem ou no detalhe, "adotar" exige sessão. Sem sessão, a tela manda para `/login`.
2. `POST /adoption` cria a solicitação. A listagem mostra um aviso e segue para `/adocoes`; o detalhe segue direto.
3. Em `/adocoes`, o solicitante vê a aba de enviadas. O responsável pelo pet vê a aba de recebidas e pode concluir (`PATCH .../complete`) ou recusar (`PATCH .../reject`).

### Perfil — parcial

1. `/perfil` lê `GET /auth/me`.
2. Dá para alterar nome e sobrenome (`PATCH /user/:id`). E-mail e CPF aparecem bloqueados.
3. A aba de animais lista os pets do usuário (filtro no cliente) e permite excluir.
4. A aba de perdidos só mostra nome, local, status e data. Sem editar ou excluir ali.
5. O botão "Alterar foto" não tem ação. `useDeleteAccount` e `ChangePasswordDTO` existem no código e não têm tela.

## Testes e qualidade

Não há testes automatizados no projeto: nenhum script de teste no `package.json` e nenhum arquivo `*.test` ou `*.spec` em `src/`.

O que existe:

```bash
npm run lint
```

ESLint em arquivos `.ts` e `.tsx`, ignorando `dist/`.

`ACCESSIBILITY.md` descreve práticas de acessibilidade e lista itens ainda não implementados (skip links, testes com leitores de tela, testes automatizados de acessibilidade). No CSS, `src/index.css` define contorno visível em `:focus-visible`. O `index.html` declara `lang="pt-BR"`.

## Build e publicação

```bash
npm run build
npm run preview
```

`npm run build` executa `vite build` e gera os arquivos estáticos em `dist/`. `npm run preview` serve essa pasta localmente.

Não foram encontrados neste repositório arquivos de hospedagem (`vercel.json`, `netlify.toml`, `Dockerfile`, workflow de CI ou script de deploy). A pasta `.vercel` está no `.gitignore`, mas não há configuração de deploy para documentar. A URL de produção do front-end não foi identificada no código-fonte.

O build embute o valor de `VITE_API_BASE_URL` que existir no ambiente no momento do `npm run build`.

## Identidade visual

Definida em `tailwind.config.ts` e `src/index.css`:

- Primária (verde): `#4a7c59`, escura `#3d6449`, clara `#6b9b7a`.
- Secundária (marrom): `#8b6f47`, clara `#a58763`.
- Destaque: `#d97706`.
- Fundo: `#fafaf9`. Superfície: `#ffffff`.

`tailwind.config.ts` declara `darkMode: "class"`. Não foi identificado um controle de tema escuro na interface.

Os breakpoints usados nas classes (`sm`, `md`, `lg`) são os padrões do Tailwind. O arquivo de configuração não os altera.

## Limitações e observações

- A aplicação depende da API. Sem `VITE_API_BASE_URL` apontando para um servidor compatível, as telas de dados falham.
- O front-end e a API em origens diferentes exigem CORS com credenciais no back-end. Isso não é configurado aqui.
- `.env.example` não corresponde às variáveis que o Vite lê.
- `src/app/layout.tsx` é resíduo de Next.js e não participa da execução.
- `src/mocks/` não alimenta nenhuma tela. Os dados exibidos vêm da API.
- Vários arquivos ainda têm a diretiva `"use client"`. No Vite ela não tem efeito.
- `src/routeTree.gen.ts` está defasado em relação à rota `/perdidos/editar/$petId`. O router usado é `src/routes/-router.tsx`.
- O parâmetro `redirect` enviado pelas rotas protegidas não é aplicado depois do login.
- Filtros de animais valem só para a página já baixada.
- Não há edição de pet para adoção na interface, embora `PATCH /pet/:id` exista no serviço.
- Não há detalhe dedicado de animal perdido.
- "Esqueci minha senha", "Alterar foto", exclusão de conta e troca de senha não estão ligados a uma tela funcional.
- O dashboard não distingue erro de `GET /dashboard/stats` de uma conta sem números.
- A navbar chama `GET /adoption/received` mesmo para quem não está autenticado. Sem `user` no `localStorage`, o 401 não redireciona.
- Não há testes automatizados nem configuração de publicação confirmada nos arquivos do projeto.
