# T&T — proposta para revisão, sem publicação

Base: commit `14ffd24ef086919f77e4d75318e13ca6e7c989d1` da branch `main`.

## O que mudou

- Menu visível quando JavaScript estiver ausente; o recolhimento começa somente ao término da inicialização. Com JavaScript, o menu também atende tablets até 950 px.
- Links internos do menu transferem o foco à seção antes de ocultar a navegação. Escape fecha e devolve o foco ao botão. Links externos e clique fora também evitam deixar o foco no menu oculto.
- Barra do WhatsApp medida por `ResizeObserver`, com compensação de rolagem e rodapé. O fallback de CSS inclui área segura e unidades relativas para texto ampliado.
- Link de pular conteúdo com destino focável; telefone com `tel:+5554991381775`.
- H1 identifica assistência técnica de computadores e notebooks em Caxias do Sul. A chamada original permanece como texto complementar.
- Canonical, `og:url`, `og:image` absoluta e texto alternativo; JSON-LD recebe `url`, `@id` e `image`.
- Oito imagens com versões menores, `srcset` e `sizes` calculados a partir da grade existente, incluindo as duas fotos do mesmo cartão. Originais, dimensões declaradas e carregamento tardio dos serviços preservados.
- Ajustes de quebra de texto e flex/grid para reduzir risco de transbordamento com texto maior. Nenhuma biblioteca de produção adicionada.

## Verificações executadas

```sh
node --check script.js
node tests/navigation.test.cjs
python tests/content.test.py
```

O teste de conteúdo usa Pillow, já disponível no ambiente de preparação. Não faz parte do site ou de seu carregamento.

- Simulação de DOM com os breakpoints de 320, 360, 390, 720 e 768 px: inicialização, foco após link interno, Escape, clique fora, link externo, mudança de breakpoint e alturas de barra de 68, 108 e 156 px.
- Integridade de fragmentos, destinos do WhatsApp/telefone, estrutura das seis FAQs, atributos de imagens e metadados/JSON-LD.
- Oito combinações de cor de texto/fundo calculadas: contrastes entre 5,60:1 e 16,68:1. A verificação não inclui texto sobre a fotografia.
- Todos os oito arquivos originais conferidos contra os hashes dos blobs do GitHub.

### Estimativas das imagens

O conjunto original soma 742,2 KiB. Para uma tela de 390 px, as variantes estimadas somam 136,1 KiB em DPR 1 e 357,2 KiB em DPR 2. São estimativas pela seleção de candidatos, considerando todas as oito imagens; não são medidas de rede nem de carregamento inicial. Navegadores podem escolher outro candidato conforme suas condições. Os resultados completos estão em `tests/results.json`.

## Limites e itens pendentes

- Não foi possível executar navegador de QA local ou Lighthouse mobile: o ambiente não expõe a capacidade de controle de navegador exigida pelo fluxo de prévia. Não há pontuações inventadas.
- Portanto, o resultado visual nas cinco larguras, navegação real por teclado, JavaScript efetivamente desativado, zoom/texto de 200%, rolagem horizontal e posição do foco frente à barra fixa precisam ser confirmados em navegador. A simulação de DOM não substitui essas verificações.
- A prioridade alta da imagem principal permanece até haver uma medição de LCP. Ela continua sem `loading="lazy"`.
- Falta o link oficial confirmado do perfil da T&T no Google. O selo existente ainda não é link; não foram acrescentados `sameAs`, quantidade de avaliações ou avaliações estruturadas. A nota existente não foi alterada nem revalidada por uma fonte pública identificável.
- A política de cobrança do diagnóstico não está confirmada; a FAQ comercial foi preservada. Não foram acrescentados preços, garantias, prazos, endereço residencial nem horários.
- O arquivo `og:image` já existe no site público. Sua arte original foi mantida; a validação de cartões sociais reais ainda é necessária.

## Como revisar

Extraia o pacote e abra `index.html` em seu navegador. Para conferir o menu sem JavaScript, desative JavaScript nas ferramentas do navegador e recarregue. Com JavaScript habilitado, teste as cinco larguras, Enter nos links, Escape, Tab e o link de pular conteúdo. Amplie o texto/zoom a 200% e percorra até o rodapé e as FAQs, observando a barra fixa.

Esta proposta fica em branch separada e pull request em rascunho. A branch `main` e a publicação no GitHub Pages devem permanecer como estão até a revisão e aprovação do usuário.
