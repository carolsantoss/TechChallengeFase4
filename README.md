# Tech Challenge - Fase 4 (FIAP)
## Aplicação Mobile de Blogging Dinâmico em React Native

Interface gráfica mobile desenvolvida em **React Native** com **Expo** para a plataforma acadêmica de blogging. A aplicação atende integralmente aos requisitos funcionais e técnicos da Fase 4, conectando-se a endpoints RESTful com controle de acesso baseado em papéis (RBAC).

---

## 📱 Funcionalidades Implementadas

1. **Página Principal (Lista de Posts):**
   - Listagem dinâmica de todas as publicações disponíveis.
   - Exibição de título, autor, breve descrição, data formatada e contagem de comentários.
   - Campo de busca em tempo real com filtro por título, autor e palavras-chave.
   - Recurso de *Pull to Refresh* para recarregar postagens.
   - Botão flutuante (FAB) para criar novas postagens (visível para docentes).

2. **Página de Leitura de Post:**
   - Conteúdo completo e estruturado do artigo selecionado.
   - Cabeçalho com identificação do autor, papel acadêmico e data.
   - Seção interativa de comentários com listagem cronológica e identificação de perfis.
   - Formulário para submeter novos comentários (alunos e professores).

3. **Página de Criação de Postagens:**
   - Formulário exclusivo para docentes autenticados.
   - Campos: Título, Autor, Resumo descritivo e Conteúdo completo.
   - Validações de campos obrigatórios e envio via `POST /api/posts`.

4. **Página de Edição de Postagens:**
   - Formulário com carregamento prévio dos dados existentes da postagem.
   - Atualização persistida no servidor via `PUT /api/posts/:id`.
   - Acesso protegido exclusivo para docentes.

5. **Página de Criação de Professores:**
   - Formulário administrativo para cadastro de novos docentes.
   - Campos: Nome completo, E-mail institucional, Departamento e Titulação.
   - Envio dos dados via `POST /api/teachers`.

6. **Página de Edição de Professores:**
   - Formulário com dados pré-carregados do docente selecionado.
   - Atualização persistida via `PUT /api/teachers/:id`.

7. **Página de Listagem de Professores:**
   - Listagem paginada (com botões de página anterior/próxima e contagem de registros).
   - Busca por nome, e-mail ou departamento.
   - Ações diretas por professor: botão **Editar** (redireciona para edição) e botão **Excluir** (abre modal de confirmação antes de remover via `DELETE /api/teachers/:id`).

8. **Gestão de Estudantes (Réplica dos Requisitos 5, 6 e 7):**
   - **Cadastro de Aluno:** Formulário com Nome, E-mail, Matrícula (RM) e Curso via `POST /api/students`.
   - **Edição de Aluno:** Formulário com dados atuais pré-carregados via `PUT /api/students/:id`.
   - **Listagem Paginada de Alunos:** Tabela com paginação, busca e botões de **Editar** e **Excluir** com modal de confirmação via `DELETE /api/students/:id`.

9. **Página Administrativa:**
   - Painel centralizado de gestão de postagens com botões diretos de **Editar** e **Excluir**.
   - Atalhos rápidos para cadastrar postagens, gerenciar docentes e alunos.
   - Modal de confirmação seguro para exclusão de publicações.

10. **Autenticação e Autorização (RBAC):**
    - Login com validação por e-mail e perfil (Docente / Estudante).
    - Botões de seleção rápida de perfil para agilizar os testes dos avaliadores.
    - Proteção granular de rotas:
      - **Docentes:** Acesso total (criar, editar e excluir postagens; gerenciar professores e alunos).
      - **Estudantes:** Permissão restrita a leitura de postagens e envio de comentários.

11. **Configurações e Integração REST:**
    - Tela de ajustes para visualizar e alterar a URL base da API (`http://localhost:3000/api`, `http://10.0.2.2:3000/api` no emulador Android ou IP da rede local).
    - Botão de teste de comunicação com o servidor para diagnóstico imediato.

---

## 🛠️ Tecnologias Utilizadas

- **React Native** & **Expo SDK 57**
- **React Navigation** (Native Stack & Bottom Tabs)
- **Context API** (`AuthContext`) para gestão de autenticação e permissões
- **AsyncStorage** para persistência local de sessão e parâmetros de conexão
- **@expo/vector-icons** (Ionicons)
- **Node.js** & **Express** para a API REST integrada no diretório `server/`

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Back-End REST

No terminal, na raiz do projeto:

```bash
npm run server
```
O servidor iniciará na porta `3000`: `http://localhost:3000/api`.

### 2. Iniciar a Aplicação Mobile

Abra outro terminal e execute:

```bash
npm start
```

Opções de visualização:
- **Navegador Web:** Pressione a tecla `w` no terminal ou execute `npm run web`.
- **Dispositivo Físico:** Abra o aplicativo **Expo Go** (Android/iOS) e escaneie o QR Code exibido no terminal.
- **Emulador Android:** Pressione a tecla `a` no terminal (ou `npm run android`).

---

## 🔑 Credenciais de Teste

Para facilitar a avaliação, o app possui pré-seleção rápida na tela de Login:

| Perfil | E-mail | Senha | Permissões |
|---|---|---|---|
| **Docente** | `carlos.eduardo@fiap.com.br` | `123456` | Criar/Editar/Excluir posts, gerenciar docentes e alunos |
| **Estudante** | `ana.clara@aluno.fiap.com.br` | `123456` | Leitura de postagens e envio de comentários |
