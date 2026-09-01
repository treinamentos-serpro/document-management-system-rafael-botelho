# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para que usuários enviem, visualizem e baixem
seus próprios documentos, com arquivos armazenados localmente pela aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos PDF, PNG e JPEG.
- Listagem dos documentos pertencentes ao usuário solicitante.
- Download de um documento pelo seu identificador, quando pertencer ao usuário
  solicitante.
- Identificação simples do usuário pelo cabeçalho HTTP `X-User-Id`.
- Armazenamento dos arquivos no filesystem local, em `backend/storage`.
- Manutenção dos metadados em memória enquanto o processo do backend estiver em
  execução.

### Fora do escopo

- Autenticação, autorização baseada em tokens, sessão ou gestão de contas.
- Armazenamento externo, em nuvem ou por provedores de terceiros.
- Persistência de metadados em banco de dados ou recuperação após reinicializar o
  backend.
- Versionamento, edição, exclusão, compartilhamento ou busca de documentos.
- Aceitação de formatos além de PDF, PNG e JPEG.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve receber um arquivo no campo multipart `file`, associado ao valor não vazio do cabeçalho `X-User-Id`. |
| RF-02 | O sistema deve aceitar arquivos de até 10 MiB com os tipos MIME `application/pdf`, `image/png` ou `image/jpeg` e rejeitar os demais. |
| RF-03 | Ao concluir um upload válido, o sistema deve gravar o arquivo em `backend/storage` e retornar os metadados públicos do documento criado. |
| RF-04 | O sistema deve atribuir um identificador único e um nome de armazenamento único a cada upload; arquivos com o mesmo nome original são documentos distintos. |
| RF-05 | O sistema deve listar somente os metadados dos documentos cujo `owner` corresponda ao `X-User-Id` informado na requisição. |
| RF-06 | O sistema deve fornecer o conteúdo binário de um documento quando seu identificador existir e ele pertencer ao usuário solicitante. |
| RF-07 | Para um identificador inexistente ou de outro proprietário, o sistema deve retornar `404 Not Found`, sem revelar a existência do documento. |
| RF-08 | O sistema deve retornar erros HTTP em JSON para falhas de validação e erros inesperados. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS; o frontend deve usar React, Vite e ESM. |
| RNF-02 | O upload deve usar obrigatoriamente `multer` com `diskStorage`, sem serviços ou SDKs de armazenamento externos. |
| RNF-03 | Os arquivos devem ser gravados exclusivamente no diretório local `backend/storage`, que deve existir ou ser criado pela aplicação antes do primeiro upload. |
| RNF-04 | Os metadados devem permanecer apenas em memória nesta fase e serão perdidos quando o processo do backend for reiniciado. Arquivos físicos remanescentes não devem ser listados sem metadados em memória. |
| RNF-05 | A porta HTTP deve ser configurável por `PORT`; os valores de limite de upload e diretório de armazenamento devem ser centralizados e configuráveis por variáveis de ambiente quando forem expostos pela implementação. |
| RNF-06 | O limite máximo de upload é 10 MiB (10 x 1024 x 1024 bytes). |
| RNF-07 | O código deve respeitar a direção de dependências `routes -> controllers -> services -> repositories`. |
| RNF-08 | A API deve responder em JSON com UTF-8, exceto a rota de download, que deve responder com o conteúdo binário e o MIME original. |

## 5. Modelo de dados (metadados do documento)

Cada documento possui metadados em memória. Os campos públicos podem ser
retornados pela API; os internos são necessários para localizar o arquivo no
filesystem e não devem ser expostos.

| Campo | Tipo | Exposição | Descrição |
| --- | --- | --- | --- |
| `id` | string | Pública | Identificador único do documento. |
| `originalName` | string | Pública | Nome do arquivo recebido no upload. |
| `size` | number | Pública | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Pública | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | Pública | Valor de `X-User-Id` do usuário que enviou o arquivo. |
| `mimeType` | string | Interna | Tipo MIME validado do arquivo. |
| `storedName` | string | Interna | Nome único usado no filesystem, independente de `originalName`. |
| `storagePath` | string | Interna | Caminho local resolvido do arquivo sob `backend/storage`. |

Exemplo de representação pública:

```json
{
  "id": "c26a1766-5b2f-4123-bb6a-83f84a4b4e59",
  "originalName": "relatorio.pdf",
  "size": 245760,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "rafael"
}
```

## 6. Contratos de API

O frontend deve acessar estas rotas pelo prefixo `/api`, conforme o proxy do
Vite. O backend expõe as rotas abaixo sem esse prefixo, a menos que a montagem
da aplicação o adicione explicitamente.

### Convenções gerais

- Todas as operações exigem o cabeçalho `X-User-Id` com texto não vazio após
  remoção de espaços nas extremidades.
- Respostas de erro usam o formato `{ "error": "mensagem em português" }`.
- O valor de `X-User-Id` é tratado como identificador simples; ele não autentica
  a identidade do solicitante nesta fase.
- Falhas inesperadas retornam `500 Internal Server Error` sem detalhes internos
  do filesystem.

### POST /upload

Envia um novo documento.

**Requisição**

| Item | Valor |
| --- | --- |
| Cabeçalho | `X-User-Id: <identificador do usuário>` |
| Content-Type | `multipart/form-data` gerado pelo cliente |
| Campo de arquivo | `file` |
| Tipos aceitos | `application/pdf`, `image/png`, `image/jpeg` |
| Tamanho máximo | 10 MiB |

**Resposta de sucesso: `201 Created`**

```json
{
  "id": "c26a1766-5b2f-4123-bb6a-83f84a4b4e59",
  "originalName": "relatorio.pdf",
  "size": 245760,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "rafael"
}
```

**Respostas de erro**

| Status | Condição |
| --- | --- |
| `400 Bad Request` | `X-User-Id` ausente ou vazio, campo `file` ausente ou multipart inválido. |
| `413 Payload Too Large` | Arquivo acima de 10 MiB. |
| `415 Unsupported Media Type` | Tipo MIME fora da lista permitida. |
| `500 Internal Server Error` | Falha inesperada ao processar ou registrar o upload. |

### GET /documents

Lista os documentos do usuário solicitante em ordem decrescente de `uploadedAt`.

**Requisição**

| Item | Valor |
| --- | --- |
| Cabeçalho | `X-User-Id: <identificador do usuário>` |
| Corpo | Não possui. |

**Resposta de sucesso: `200 OK`**

```json
[
  {
    "id": "c26a1766-5b2f-4123-bb6a-83f84a4b4e59",
    "originalName": "relatorio.pdf",
    "size": 245760,
    "uploadedAt": "2026-09-01T14:30:00.000Z",
    "owner": "rafael"
  }
]
```

Quando não houver documentos do proprietário, a resposta deve ser `[]`.

**Respostas de erro**

| Status | Condição |
| --- | --- |
| `400 Bad Request` | `X-User-Id` ausente ou vazio. |
| `500 Internal Server Error` | Falha inesperada ao consultar os metadados. |

### GET /documents/:id/download

Baixa o arquivo associado ao documento solicitado.

**Requisição**

| Item | Valor |
| --- | --- |
| Cabeçalho | `X-User-Id: <identificador do usuário>` |
| Parâmetro de rota | `id`: identificador único do documento. |
| Corpo | Não possui. |

**Resposta de sucesso: `200 OK`**

- Corpo: conteúdo binário do arquivo.
- `Content-Type`: valor de `mimeType` registrado no upload.
- `Content-Disposition`: `attachment` com o nome original do arquivo, devidamente
  codificado pelo mecanismo HTTP adotado.

**Respostas de erro**

| Status | Condição |
| --- | --- |
| `400 Bad Request` | `X-User-Id` ausente ou vazio, ou `id` ausente. |
| `404 Not Found` | Documento inexistente, documento de outro usuário ou arquivo físico indisponível. |
| `500 Internal Server Error` | Falha inesperada durante a leitura ou transmissão do arquivo. |

## 7. Decisões arquiteturais

### Backend

- `routes/`: definem `POST /upload`, `GET /documents` e
  `GET /documents/:id/download`; aplicam o middleware Multer somente à rota de
  upload e delegam aos controllers.
- `controllers/`: leem parâmetros, cabeçalhos e arquivo recebido; executam
  validação HTTP básica; convertem resultados e erros esperados em respostas
  HTTP.
- `services/`: aplicam as regras de negócio, criam metadados, filtram por
  proprietário e impedem o download de documento que não pertença ao usuário.
- `repositories/`: mantêm uma coleção em memória de metadados e disponibilizam
  operações de inclusão, busca por proprietário e busca por identificador.
- A configuração do `multer.diskStorage` pertence ao limite HTTP e deve salvar
  arquivos com nome único em `backend/storage`. O serviço não deve depender de
  objetos `req`, `res` ou do Multer.
- Dependências devem fluir somente de `routes` para `controllers`, de
  `controllers` para `services` e de `services` para `repositories`.

### Frontend

- A interface React deve organizar componentes reutilizáveis em `components/`,
  páginas em `pages/` e chamadas `fetch` em `services/`.
- As chamadas devem usar o prefixo `/api` e incluir `X-User-Id`.
- A interface deve apresentar mensagens de erro em português e atualizar a
  listagem após um upload concluído.

## 8. Plano de execução

1. Definir as variáveis de ambiente e preparar a inicialização do backend,
   incluindo a criação do diretório local `backend/storage`.
2. Implementar a configuração de `multer.diskStorage`, com geração de nome
   armazenado único, limite de 10 MiB e filtro para PDF, PNG e JPEG.
3. Implementar o repositório em memória e os modelos de metadados necessários
   para criação, consulta por dono e consulta por identificador.
4. Implementar os serviços de upload, listagem e download, incluindo as regras
   de ownership e a transformação para metadados públicos.
5. Implementar controllers e rotas, validando `X-User-Id`, convertendo erros
   para os status contratados e conectando o middleware de upload.
6. Criar testes de backend com `node:test` para uploads válidos e inválidos,
   limite de tamanho, tipos não aceitos, isolamento por dono, listagem vazia e
   downloads autorizados, inexistentes e não autorizados.
7. Implementar o serviço de API e os componentes React para envio, listagem e
   download, usando o prefixo `/api` e o `X-User-Id` configurado para a sessão.
8. Testar a experiência de frontend para estados de carregamento, sucesso,
   lista vazia e erros dos contratos HTTP.
9. Executar os testes e builds disponíveis, revisar a documentação e confirmar
   que a aplicação não depende de armazenamento externo nem de persistência de
   metadados.