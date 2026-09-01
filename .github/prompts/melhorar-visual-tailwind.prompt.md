---
description: "Melhora o visual do frontend do DMS com Tailwind CSS 3, preservando os fluxos de documentos."
name: melhorar-visual-tailwind
argument-hint: "objetivo visual opcional (ex.: interface mais compacta)"
agent: frontend-visual-tailwind
---

# Melhorar visual com Tailwind CSS 3

Melhore a experiência visual do frontend do Document Management System usando
Tailwind CSS 3, considerando o objetivo adicional:

`${input:objetivo visual:objetivo visual opcional}`

Antes de editar, examine `frontend/src/App.jsx`, os componentes em
`frontend/src/components/`, o cliente em `frontend/src/services/apiClient.js`,
o CSS existente e `frontend/package.json`.

Requisitos da implementação:

- Configure Tailwind CSS **3.x** para React e Vite caso ainda não esteja
  configurado.
- Preserve os fluxos de upload, listagem, atualização e download, incluindo o
  uso de `/api` e do cabeçalho `X-User-Id`.
- Preserve validações de PDF, PNG e JPEG, limite de 10 MiB, estados de
  carregamento e mensagens de erro em português.
- Use uma interface responsiva, acessível e apropriada para uma ferramenta de
  gestão documental: densa sem ficar confusa, com boa hierarquia e ações
  evidentes.
- Mantenha componentes funcionais e evite duplicação de classes ou lógica.
- Não altere backend, contratos HTTP nem introduza TypeScript.
- Execute `npm run build` dentro de `frontend/` para validar o resultado.

No fim, apresente os arquivos modificados, as decisões visuais tomadas e o
resultado da validação.