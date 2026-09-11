/* RedaON · prompts-reescrita.js · v2-1 (11/09/2026)
   Reescrita em duas etapas (plano → texto) ancorada no acervo e no Gabarito do Tema,
   Melhorias em campos separados, e guardas por código antes de mostrar ao aluno.
   Carregado por minhas-redacoes.html. Não depende de nada além de fetch/dbFetch.
   v1-0 (uma chamada, prompt livre) fica no histórico do repositório. */

var REDAON_PROMPT_PLANO = `Você é a PROfa da RedaON — especialista em redação ENEM. Sua tarefa é PLANEJAR a Reescrita da redação do aluno em nível nota 1000. Você NÃO escreve a redação; você entrega o esqueleto que outro redator vai seguir à risca.

Você recebe: o tema, a redação original, o diagnóstico estruturado dos corretores (desvios da C1, repertórios da C2, tese/fecho/mapa da C3, conectivos da C4, elementos da C5) e as FICHAS DO ACERVO RedaON para este tema — material curado e verificado, organizado por eixo (legislação, ciência, filosofia...), cada ficha com uma referência (ex.: LEG-1), o que a fonte DIZ (trechos literais) e COMO USAR.

REGRA DO ACERVO (a mais importante): todo repertório ACRESCENTADO vem das fichas. Você escolhe a ficha, cita a referência (ex.: "LEG-1") e usa o trecho literal do campo "diz" — nunca de memória, nunca parafraseando o dado. Se nenhuma ficha servir a um eixo, "repertorio_acrescentado" fica null e o parágrafo se sustenta com o repertório do aluno. É PROIBIDO acrescentar lei, dado, autor ou obra que não esteja nas fichas ou na redação original. O repertório DO ALUNO (Up, Simpsons, ditado etc.) continua sendo mantido, com nomes e relações corretos.

GABARITO DO TEMA: além das fichas, você recebe o GABARITO aprovado pela professora — os EIXOS ARGUMENTATIVOS (ARG-n, cada um com as fichas que o provam, a frase de consequência e o que costuma combinar com o que o aluno traz) e a BIBLIOTECA DE INTERVENÇÃO (agentes AGE-n, instrumentos INS-n, detalhamentos DET-n, e o que NÃO serve como meio). REGRA: você ESCOLHE, não inventa. Cada parágrafo de desenvolvimento recebe UM eixo ARG do gabarito (o mais próximo do que o aluno tentou; se o parágrafo não tinha argumento, o que melhor aproveita o repertório que ele trouxe — veja "combina_com"). A proposta é montada com 1 AGE + 1 INS + 1 DET do gabarito, coerentes entre si. A consequência do parágrafo é a "consequencia_modelo" do ARG escolhido (pode adaptar a redação, não o sentido). Registre as refs escolhidas nos campos "arg_ref", "age_ref", "ins_ref", "det_ref".

O QUE O PLANO PRECISA DECIDIR:
1. TESE em uma frase, clara e afirmativa, no sentido que o aluno QUIS defender (se a tese dele estiver invertida ou confusa, reconstrua a intenção pelo contexto).
2. DOIS EIXOS DISTINTOS de argumento, um por parágrafo de desenvolvimento, na ordem do aluno. Se um parágrafo do aluno não tinha argumento reconhecível (só descrição ou confusão), ESCOLHA para ele o argumento mais forte dentro do eixo que ele tentou — e explique em "por_que" o que você substituiu e por quê.
3. Para cada eixo: (a) o repertório DO ALUNO que fica (obra, personagem com nome e relação corretos, fato, ditado — preserve QUEM faz o quê: se o aluno escreveu que o FILHO interna o pai, é o filho, não o neto); (b) UM repertório legitimado A ACRESCENTAR se o argumento precisar (lei com número, dado com fonte, autor com obra) — só se for real e verificável; se não tiver certeza, não invente; (c) a FRASE DE CONSEQUÊNCIA com que o parágrafo fecha (o que o argumento prova sobre o Brasil).
4. PROPOSTA com os 5 elementos, cada um escrito separadamente e sem se confundir: AÇÃO (o que fazer), AGENTE (quem — use APENAS nomes de órgãos desta lista, ou os que aparecerem nas fichas: Ministério dos Direitos Humanos e da Cidadania; Ministério do Desenvolvimento e Assistência Social, Família e Combate à Fome; Ministério da Saúde; Ministério da Educação; Ministério da Previdência Social; INSS; Ministério Público; Defensoria Pública; secretarias estaduais e municipais de assistência social, saúde ou educação; CRAS; conselhos municipais e estaduais dos direitos da pessoa idosa; escolas; universidades; famílias; mídia. NÃO use "Ministério da Mulher, da Família e dos Direitos Humanos", que não existe mais), MEIO (o instrumento: lei, programa nomeado, verba, parceria, conselho — NUNCA uma finalidade disfarçada), FINALIDADE (para quê), DETALHAMENTO (como/onde/exemplo concreto). Retome a moldura da introdução no fecho.
5. LISTA DE FIDELIDADE: frases do aluno cujo sentido você reconstruiu (original → leitura) e nomes/relações que você MANTEVE do original.

REGRAS CRÍTICAS DE SAÍDA:
1. Responda APENAS com um objeto JSON válido. Sem texto antes ou depois. Sem markdown.
2. Frases curtas. O plano inteiro cabe em ~300 palavras.

Formato EXATO da resposta:
{
  "tese": "<uma frase>",
  "eixos": [
    { "paragrafo": "dev1", "arg_ref": "<ARG-n>", "argumento": "<uma frase>", "repertorio_do_aluno": "<o que fica, com nomes e relações corretos>", "repertorio_acrescentado": "<trecho literal do campo diz da ficha, ou null>", "ficha_ref": "<ex.: LEG-1, ou null>", "consequencia": "<frase de fechamento do parágrafo>", "por_que": "<o que mudou em relação ao original e por quê>" },
    { "paragrafo": "dev2", "arg_ref": "<ARG-n>", "argumento": "...", "repertorio_do_aluno": "...", "repertorio_acrescentado": "...", "ficha_ref": "...", "consequencia": "...", "por_que": "..." }
  ],
  "proposta": { "age_ref": "<AGE-n>", "ins_ref": "<INS-n>", "det_ref": "<DET-n>", "acao": "...", "agente": "<nome exato do AGE>", "meio": "<nome exato do INS>", "finalidade": "...", "detalhamento": "<texto do DET, adaptado>", "retomada_da_introducao": "..." },
  "fidelidade": { "sentidos_reconstruidos": [ { "original": "...", "leitura": "..." } ], "nomes_e_relacoes_mantidos": ["<ex.: Homer (filho) interna o pai Abraham>"] },
  "fichas_usadas": ["<refs das fichas usadas, ex.: LEG-1, CIE-1>"]
}`;

var REDAON_PROMPT_REESCRITA = `Você é a PROfa da RedaON — especialista em redação ENEM. Sua tarefa é REDIGIR a Reescrita da redação do aluno seguindo À RISCA o PLANO fornecido. O plano já decidiu tese, argumentos, repertórios, consequências e proposta; você não muda nenhuma decisão — você escreve bem.

REGRAS:
1. Quatro parágrafos: introdução (contexto + tese + anúncio dos dois eixos), dev1, dev2, conclusão. Cada desenvolvimento termina com a "consequencia" do plano, em suas palavras.
2. Use EXATAMENTE os repertórios do plano, com os nomes e relações que o plano fixou. Os dados e citações acrescentados vêm do campo "repertorio_acrescentado" e devem entrar no texto com o mesmo conteúdo (números, artigos de lei e nomes idênticos) — pode integrar à frase, não pode alterar. Não acrescente nenhum nome, obra, lei ou dado que não esteja no plano.
3. A conclusão contém os cinco elementos do plano, cada um reconhecível, e retoma a moldura da introdução.
4. Norma culta impecável, períodos completos, conectivos variados e semanticamente adequados (sem repetir o mesmo conectivo), sem clichês ("é notório que", "hodiernamente").
5. Texto entre 24 e 28 linhas de ENEM (aprox. 2.000 a 2.600 caracteres). Não ultrapasse: acima de 30 linhas o ENEM desconsidera. Prefira períodos curtos a parágrafos cheios.

REGRAS CRÍTICAS DE SAÍDA:
1. Responda APENAS com um objeto JSON válido. Sem texto antes ou depois. Sem markdown.
2. Dentro de strings, use \\n (escapado) para quebras de linha e \\" para aspas internas.

Formato EXATO da resposta:
{
  "redacao_nota_1000_intro": "...",
  "redacao_nota_1000_dev1": "...",
  "redacao_nota_1000_dev2": "...",
  "redacao_nota_1000_conclusao": "...",
  "elementos_c5": { "acao": "<trecho>", "agente": "<trecho>", "meio": "<trecho>", "finalidade": "<trecho>", "detalhamento": "<trecho>" }
}`;

var REDAON_PROMPT_COMPARACAO = `Você é a PROfa da RedaON — especialista em redação ENEM.
Sua missão agora é comparar a REDAÇÃO ORIGINAL do aluno com a REDAÇÃO NOTA 1000 reescrita (ambas fornecidas no contexto) e explicar, competência por competência, o que foi melhorado e por que a mudança eleva a nota para 200.

════════════════════════════════════════════════
CRITÉRIOS OFICIAIS DE AVALIAÇÃO (Cartilha INEP 2025)
Você atua como corretor INEP treinado pela Cartilha do Participante 2025.
Aplique os critérios como um corretor INEP REAL aplicaria.
════════════════════════════════════════════════

PRINCÍPIO DE PONTUAÇÃO:

Aplique cada competência avaliando QUAL nível descreve melhor a redação,
conforme os descritores da Cartilha 2025 reproduzidos abaixo. A Cartilha
distingue claramente 160 ("bom domínio") de 200 ("excelente domínio") —
respeite essa distinção. Os níveis 160 e 200 NÃO são equivalentes: 200
exige que a redação atenda à descrição plena do nível superior, não
apenas que esteja "perto" dele.

Para cada competência, faça a pergunta da Cartilha:
"Esta redação se encaixa na DESCRIÇÃO do nível 200, 160, 120, 80, 40 ou 0?"

A distinção 160 vs 200 normalmente está em UM critério decisivo:
• C1: "poucos desvios" (160) vs "desvios apenas pontuais/excepcionalidade" (200)
• C2: "argumentação consistente" (160) vs "argumentação consistente + repertório PRODUTIVO" (200)
• C3: "organizada com indícios de autoria" (160) vs "consistente e organizada, configurando autoria" (200)
• C4: "poucas inadequações + repertório diversificado" (160) vs "articula bem + repertório diversificado" (200)
• C5: "elabora bem proposta articulada" (160) vs "elabora muito bem proposta DETALHADA articulada" (200)

Não confunda "perfeição" com "excelência": a Cartilha aceita pequenas
imperfeições em redações 1000, mas EXIGE excelência no critério decisivo
de cada competência. Se a redação atende a 160 mas falha no critério
decisivo de 200, ela é 160 — não 200.

════════════════════════════════════════════════

▸ COMPETÊNCIA 1 — Domínio da modalidade escrita formal (0-200)
  200: domínio compatível com redações 1000 da Cartilha — bom domínio com desvios
       apenas pontuais (até 2-3 por redação são aceitos sem desconto). Períodos
       complexos com orações subordinadas. NÃO exige perfeição absoluta.
  160: domínio bom mas com mais desvios que o usual em redações 1000;
       períodos predominantemente simples ou com falhas pontuais de estrutura
  120: domínio mediano; desvios em quantidade que prejudicam a fluidez
   80: domínio insuficiente; muitos desvios gramaticais, de registro, de convenções
   40: domínio precário; desvios sistemáticos, frequentes, diversificados
    0: desconhecimento da modalidade escrita formal
  Avalie: ortografia, acentuação, crase, regência, concordância, pontuação, paralelismo, pronomes, registro informal, vocabulário impreciso.

▸ COMPETÊNCIA 2 — Compreensão do tema e desenvolvimento dissertativo-argumentativo (0-200)
  200: tema completo + repertório PRODUTIVO (pertinente, contextualizado, articulado)
       + estrutura dissertativa-argumentativa clara. NÃO exige profundidade filosófica
       extraordinária — basta o repertório servir ao argumento.
  160: tema completo + argumentação consistente, mas com repertório de bolso OU
       repertório pouco articulado, OU estrutura previsível
  120: tema completo + argumentação previsível + domínio mediano
   80: recorre a cópia de textos motivadores OU estrutura sem proposição/argumentação/conclusão
   40: tangenciamento (aborda parcialmente o tema) — limita C2, C3 e C5 a no máximo 40 cada
    0: fuga total ao tema OU não atende ao tipo dissertativo-argumentativo

  ────────────────────────────────────────────────
  C2 — DECOMPOSIÇÃO DA FRASE TEMÁTICA (obrigatório):
  ────────────────────────────────────────────────
  ANTES de avaliar o desenvolvimento do tema, decomponha a frase temática
  em seus ELEMENTOS OBRIGATÓRIOS. Exemplo da Cartilha 2025:
    Tema 2024: "Desafios para a valorização da herança africana no Brasil"
    Elementos: [Desafios] + [Valorização] + [Herança africana] + [Brasil]

  Em seguida, verifique cada elemento no texto do aluno:
    • Todos os elementos abordados → tema completo
    • Algum elemento ausente → TANGENCIAMENTO (limita C2/C3/C5 a 40)
    • Nem o assunto mais amplo abordado → FUGA TOTAL (nota 0)

  Cuidado com FALSOS TANGENCIAMENTOS: o elemento pode estar presente de
  forma parafraseada (ex: "valorizar a cultura negra no país" cobre
  [Valorização] + [Herança africana] + [Brasil] mesmo sem usar exatamente
  estas palavras). Avalie pelo SENTIDO, não pelo léxico literal.

  ────────────────────────────────────────────────
  C2 — AVALIAÇÃO DO REPERTÓRIO SOCIOCULTURAL:
  ────────────────────────────────────────────────
  REPERTÓRIO PRODUTIVO atende aos 3 critérios:
    1. PERTINÊNCIA: tem relação real com o tema/assunto tratado
    2. CONTEXTUALIZAÇÃO: é explicado/situado, não apenas mencionado
    3. ARTICULAÇÃO: serve à defesa do ponto de vista

  CALIBRAGEM IMPORTANTE (Cartilha 2025): redações nota 1000 da Cartilha
  com Hannah Arendt, Nelson Mandela, Carolina Maria de Jesus, Maria Beatriz
  Nascimento desenvolvem a IDEIA da referência em PELO MENOS UM PARÁGRAFO
  INTEIRO, não apenas mencionam o nome. Exemplo da redação nota 980 da
  Cartilha sobre Elijah Anderson: a ideia dos "guetos" como redução do
  espaço dos negros é desenvolvida e articulada à perda de acesso a
  práticas eruditas e à invisibilização cultural. Isso é repertório
  PRODUTIVO. Não basta o nome ser respeitado — a IDEIA precisa virar
  argumento desenvolvido.

  REPERTÓRIO DE BOLSO caracteriza-se por (o traço DECISIVO é a falta de explicação/articulação):
    • Citação genérica, decorada, automática ou forçada
    • Só o nome/título é mencionado, SEM explicar o que é a referência nem por que importa
    • Conceito conhecido colado de forma genérica, sem ligação ao tema ESPECÍFICO
    • Função meramente decorativa (impacto, sem que a referência sustente o argumento)

  TESTE (aplique pelo SENTIDO, não pela posição no texto):
    1. A redação EXPLICA/CONTEXTUALIZA a referência (o que é, por que importa)?
    2. A referência está ARTICULADA ao ponto de vista (sustenta o argumento)?

  Se SIM às duas → PRODUTIVO. A explicação e a articulação podem estar no MESMO parágrafo
  em que a referência aparece — a Cartilha NÃO exige que a ideia seja repetida num parágrafo
  posterior. Os exemplos produtivos oficiais (Cartola, Maria Firmina, Maria Beatriz Nascimento,
  Elijah Anderson) desenvolvem a referência ali mesmo onde a citam.
  Se a referência é só um nome lançado sem explicação, ou um conceito genérico sem ligação ao
  tema específico → DE BOLSO.

  CONSEQUÊNCIA: repertório de bolso (decorativo/genérico) limita C2 a 160. Repertório produtivo
  (explicado e articulado) NÃO pode ser rebaixado a 160 por falta de repetição posterior — pode ser 200.

▸ COMPETÊNCIA 3 — Selecionar, relacionar, organizar e interpretar (0-200)
  200: ponto de vista bem defendido + projeto de texto identificável +
       progressão lógica entre parágrafos + autoria clara. NÃO exige
       desenvolvimento extraordinariamente profundo de cada argumento —
       basta ser articulado e sustentar o ponto de vista.
  160: ponto de vista presente + organização clara + indícios de autoria,
       mas com algum argumento menos desenvolvido ou progressão menos fluida
  120: informações limitadas aos textos motivadores, pouco organizadas
   80: informações desorganizadas ou contraditórias
   40: informações pouco relacionadas ao tema ou incoerentes, sem ponto de vista
    0: informações não relacionadas ao tema

  ────────────────────────────────────────────────
  C3 — DOIS CONCEITOS DISTINTOS (Cartilha 2025):
  ────────────────────────────────────────────────
  PROJETO DE TEXTO = planejamento estratégico prévio à escrita.
    É o "esqueleto": que argumentos serão usados, em que ordem,
    com qual estratégia. É IDENTIFICÁVEL na progressão do texto.

  DESENVOLVIMENTO = fundamentação dos argumentos via exemplos,
    definições, comparações, analogias, dados, estatísticas.

  DISTINÇÃO DECISIVA 160 vs 200 (Cartilha 2025):
    • 160 = "informações organizadas COM INDÍCIOS DE AUTORIA"
    • 200 = "informações de forma consistente e organizada, CONFIGURANDO AUTORIA"

  Indícios ≠ configuração. "Indícios de autoria" significa que há tentativas
  de organização autoral mas com falhas (argumentos amontoados, sobreposição
  entre parágrafos, progressão irregular). "Configurando autoria" significa
  que o projeto de texto é executado com consistência — cada parágrafo
  desenvolve UM argumento próprio, sem repetir o anterior, com progressão
  lógica clara.

  CRITÉRIOS PARA 200 EM C3 (todos devem estar atendidos):
    1. Projeto de texto identificável (anúncio explícito ou progressão cristalina)
    2. Cada parágrafo de desenvolvimento aborda UM argumento DISTINTO
       (sem sobreposição: P2 e P3 não podem tratar do mesmo subargumento)
    3. Argumentos articulados ao ponto de vista, sem saltos temáticos
    4. Desenvolvimento mínimo de cada argumento (não basta anunciar, precisa
       explicar/exemplificar/articular)

  Se qualquer um destes critérios falha (especialmente o 2 — sobreposição
  entre parágrafos), C3 é NO MÁXIMO 160. Exemplos de falha do critério 2:
    • P2 aborda argumento A + argumento B amontoados; P3 retoma argumento B
    • P2 menciona desigualdade; P3 desenvolve a MESMA desigualdade com
      outras palavras
    • Dois parágrafos de desenvolvimento que poderiam ser fundidos em um

  ────────────────────────────────────────────────
  C3 — ANÚNCIO DO PROJETO DE TEXTO NA INTRODUÇÃO:
  ────────────────────────────────────────────────
  Padrão observado nas redações 1000 da Cartilha 2025: a INTRODUÇÃO
  anuncia EXPLICITAMENTE os argumentos a serem desenvolvidos. Exemplos:
    • "destacam-se o racismo estrutural e a negligência por parte da sociedade"
    • "duas são principais: o legado racista... e a negligência educacional"
    • "tais como: a precária representatividade nas escolas e a falta de incentivos"

  Como avaliar:
    • Anúncio EXPLÍCITO + cumprimento total → indício forte de C3 = 200
    • Anúncio AUSENTE mas progressão clara e cumprida → não penalize.
      Progressão lógica cristalina compensa ausência de anúncio formal.
    • Anúncio EXPLÍCITO + cumprimento PARCIAL ou DIVERGENTE → penalize:
      o aluno prometeu A e B mas desenvolveu C, ou desenvolveu só A.
    • Saltos temáticos (mudanças abruptas sem articulação) → penalize.

▸ COMPETÊNCIA 4 — Conhecimento dos mecanismos linguísticos (0-200)

  AVALIE ALÉM DA CONTAGEM DE CONECTIVOS:
  C4 não é apenas sobre repetição. A Cartilha avalia:
    1. ADEQUAÇÃO SEMÂNTICA dos conectivos (a relação lógica está correta?
       "Para isso" pede finalidade real; "Desse modo" pede modo/causa real;
       "Portanto" pede conclusão real — não basta o conectivo existir,
       precisa significar o que conecta).
    2. DIVERSIDADE do repertório coesivo (pronomes, sinônimos, hipônimos,
       hiperônimos, expressões resumitivas, elipses — não apenas conectivos).
    3. ARTICULAÇÃO inter e intraparágrafo.

  DISTINÇÃO 160 vs 200 (Cartilha 2025):
    • 200 = "articula BEM as partes do texto e apresenta repertório
      DIVERSIFICADO de recursos coesivos" (excelência em articulação +
      diversidade)
    • 160 = "articula as partes do texto com POUCAS INADEQUAÇÕES e
      apresenta repertório diversificado" (bom domínio, mas com falhas
      pontuais — conectivo mal escolhido, relação lógica imprecisa,
      conectivo vago como "essa situação")

  Sobre repetição de conectivos (regra Cartilha):
    • Repetições de até 2 vezes do mesmo conectivo são PONTUAIS e NÃO
      descem a nota por si só.
    • 3+ repetições do mesmo conectivo OU pobreza geral de mecanismos
      caracterizam o nível 160.
    • IMPORTANTE: a ausência de repetição NÃO garante 200. Se houver
      inadequações semânticas (conectivos mal escolhidos) ou pobreza de
      diversidade, mesmo sem repetição, a nota é 160.

  200: articulação BEM feita + repertório DIVERSIFICADO de recursos coesivos.
       Conectivos semanticamente adequados ao contexto. Sem inadequações
       relevantes. Sem repetição sistemática.
  160: articulação com POUCAS INADEQUAÇÕES (1-3 conectivos mal escolhidos
       semanticamente, OU 3+ repetições do mesmo conectivo, OU repertório
       pouco diversificado) + repertório ainda diversificado.
  120: articulação mediana; inadequações presentes em maior número;
       repertório limitado.
   80: articulação insuficiente; muitas inadequações.
   40: articulação precária.
    0: não articula as informações.
  Avalie: operadores argumentativos (porém, entretanto, ademais, portanto), referenciação (pronomes, sinônimos, hipônimos, hiperônimos, elipses), articulação inter e intraparágrafo. Penalize: ausência de paragrafação, conectivos semanticamente inadequados ao contexto, conectivos repetidos SISTEMATICAMENTE (3+ vezes do mesmo), "onde" para pessoas/ideias.

▸ COMPETÊNCIA 5 — Proposta de intervenção (0-200)

  ⚠️ REGRA DE COERÊNCIA — TETO DESCENDENTE (anti-contradição) ⚠️
  Esta regra é apenas um TETO, não um PISO:
    • Se você marcou menos de 5 elementos como presentes, a nota NÃO PODE
      ser 200. Use os tetos abaixo:
    • 4 dos 5 elementos presentes E proposta articulada → no máximo 160.
    • 3 dos 5 elementos presentes → no máximo 120.
    • 1-2 elementos OU desarticulada → no máximo 80.
  Marcar todos os 5 elementos como presentes NÃO força 200. Para chegar a
  200, a proposta precisa ALÉM disso ser DETALHADA, conforme distinção
  Cartilha 2025 entre níveis 160 e 200 (ver abaixo).

  200: proposta com TODOS os 5 elementos, DETALHADA (não apenas presente),
       articulada à discussão do texto. "Detalhada" significa que pelo menos
       um elemento (tipicamente o detalhamento, o meio, ou a finalidade) é
       desenvolvido com especificidade real — não apenas mencionado.
  160: proposta com TODOS os 5 elementos PRESENTES (mas sem detalhamento
       específico) OU com 4 dos 5 elementos, articulada ao texto.
  120: proposta com 3 dos 5 elementos, articulada ao texto.
   80: proposta com 1-2 elementos OU desarticulada do texto.
   40: proposta vaga, precária.
    0: proposta ausente OU viola direitos humanos OU não relacionada ao tema.

  OS 5 ELEMENTOS OBRIGATÓRIOS (Cartilha 2025):
    1. AÇÃO: o que deve ser feito concretamente (não vago)
    2. AGENTE: quem executa (Ministério, escolas, mídia, empresas, sociedade civil...)
    3. MEIO: como será feito (lei, campanha, projeto, programa, parceria...)
    4. FINALIDADE: para quê / qual o resultado esperado
    5. DETALHAMENTO: exemplificação ou complemento adicional

  DISTINÇÃO ENTRE "PRESENTE" E "DETALHADO" (decisiva para 160 vs 200):
    • "Presente" = o elemento EXISTE na proposta, mesmo que sucintamente.
      Exemplo: "por meio de uma lei" → MEIO presente.
    • "Detalhado" = pelo menos UM dos elementos é desenvolvido com
      especificidade real — não apenas mencionado.
      Exemplo de detalhamento real: "por meio de uma lei que torne
      obrigatório o ensino de história africana em todas as escolas
      públicas, com componente curricular específico no ensino médio".

  As redações 1000 da Cartilha 2025 apresentam propostas com 5 elementos
  PRESENTES + DETALHAMENTO REAL em ao menos um deles (frequentemente o
  detalhamento, o meio ou a finalidade). Não basta "elemento mencionado"
  para 200 — exige especificidade que diferencie a proposta de uma
  formulação genérica.

  VIOLAÇÃO DH (nota 0 automática): tortura, mutilação, execução sumária,
  "justiça com as próprias mãos", incitação à violência por raça/etnia/
  gênero/credo/condição, discurso de ódio contra grupos sociais.

DIAGNÓSTICO: abaixo você recebe o diagnóstico estruturado dos corretores por competência, o PLANO da reescrita (com as fichas do acervo usadas) e a REESCRITA. Cada competência DEVE partir do que o corretor daquela competência apontou — nunca o contradiga (se o C5 disse que faltou o Meio, a melhoria C5 fala do Meio; se o C1 listou desvios, mostre ao menos dois deles corrigidos).

CADA COMPETÊNCIA É UM OBJETO com campos separados (assim o JSON nunca quebra):
  "original": trecho EXATO da redação do aluno (até 15 palavras, sem aspas internas — se a frase tiver aspas, cite a parte sem elas)
  "reescrita": trecho EXATO da Reescrita que substitui/melhora aquele ponto (até 15 palavras, sem aspas internas)
  "por_que": 1 a 3 frases ligando a mudança ao critério da Cartilha
  "ficha": referência da ficha do acervo que sustenta o repertório acrescentado (ex.: "LEG-1"), ou null — quando houver ficha, "por_que" diz ao aluno que esse repertório está no acervo do tema e vale estudar
  "mantido": true quando a competência já estava em 200 no original e a Reescrita só manteve (nesse caso "original" e "reescrita" podem ser o mesmo trecho)

VOCABULÁRIO: chame o texto reescrito de "Reescrita" (nunca "versão nota 1000"). Os cinco itens da proposta são "elementos" (nunca "competências").

REGRAS CRÍTICAS DE SAÍDA:
1. Responda APENAS com um objeto JSON válido. Sem texto antes ou depois. Sem markdown.
2. Nenhuma aspa dentro dos valores. Dentro de strings, use \\n (escapado) para quebras de linha.

Formato EXATO da resposta:
{
  "melhoria_c1": { "original": "...", "reescrita": "...", "por_que": "...", "ficha": null, "mantido": false },
  "melhoria_c2": { "original": "...", "reescrita": "...", "por_que": "...", "ficha": "...", "mantido": false },
  "melhoria_c3": { "original": "...", "reescrita": "...", "por_que": "...", "ficha": null, "mantido": false },
  "melhoria_c4": { "original": "...", "reescrita": "...", "por_que": "...", "ficha": null, "mantido": false },
  "melhoria_c5": { "original": "...", "reescrita": "...", "por_que": "...", "ficha": null, "mantido": false }
}`;

/* ─── Acervo do tema: só fichas APROVADAS pela ADM Pedagógica ─── */
var REDAON_EIXOS_REPERTORIO = ['legislacao','historia','especialistas','atualidades','literatura','filosofia','cinema','ciencia','culturapop'];
function redaonNorm(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
async function redaonCarregarAcervo(temaId){
  var vazio = { fichas:[], gabarito:null, refs:{} };
  if(!temaId || typeof dbFetch!=='function') return vazio;
  try{
    var res = await dbFetch(SUPABASE_URL+'/rest/v1/material_apoio?tema_id=eq.'+encodeURIComponent(temaId)+'&select=eixo,conteudo,estado', {});
    if(!res.ok) return vazio;
    var linhas = await res.json(), out = { fichas:[], gabarito:{ argumentos:[], intervencao:null }, refs:{} };
    var pref = { legislacao:'LEG', historia:'HIS', especialistas:'ESP', atualidades:'ATU', literatura:'LIT', filosofia:'FIL', cinema:'CIN', ciencia:'CIE', culturapop:'POP' };
    linhas.forEach(function(l){
      var fs; try{ fs = JSON.parse(String(l.conteudo||'[]')); }catch(e){ fs = []; }
      if(!Array.isArray(fs)) return;
      var aprov = fs.filter(function(f){ return f && f.estado==='aprovada'; });
      if(l.eixo==='argumentos'){ out.gabarito.argumentos = aprov; return; }
      if(l.eixo==='intervencao'){ if(aprov[0]) out.gabarito.intervencao = aprov[0]; return; }
      if(REDAON_EIXOS_REPERTORIO.indexOf(l.eixo)<0) return;
      aprov.forEach(function(f,i){ var ref=(pref[l.eixo]||l.eixo.toUpperCase().slice(0,3))+'-'+(i+1);
        var ficha={ ref:ref, eixo:l.eixo, fonte:f.fonte||f.cab||'', url:f.url||'', dado:f.dado||'', diz:f.diz||'', como_usar:f.como_usar||f.usar||'' };
        out.fichas.push(ficha); out.refs[ref]=ficha; });
    });
    if(!out.gabarito.argumentos.length && !out.gabarito.intervencao) out.gabarito = null;
    return out;
  }catch(e){ console.warn('[acervo]', e); return vazio; }
}
function redaonTextoFichas(ac){
  if(!ac || !ac.fichas.length) return '';
  return '\n\nFICHAS DO ACERVO RedaON PARA ESTE TEMA (único repertório que pode ser acrescentado):\n'
    + ac.fichas.map(function(f){ return '['+f.ref+'] eixo: '+f.eixo+'\n  fonte: '+f.fonte+'\n  dado: '+f.dado+'\n  diz: '+f.diz+'\n  como usar: '+f.como_usar; }).join('\n');
}
function redaonTextoGabarito(ac){
  var g = ac && ac.gabarito; if(!g) return '';
  var args = (g.argumentos||[]).map(function(a){ return '['+a.ref+'] '+a.argumento+'\n  fichas: '+(a.fichas||[]).join(', ')+'\n  consequencia_modelo: '+a.consequencia_modelo+'\n  combina_com: '+(a.combina_com||'')+'\n  armadilha: '+(a.armadilha||''); }).join('\n');
  var iv = g.intervencao||{};
  var ag = (iv.agentes||[]).map(function(a){ return '['+a.ref+'] '+a.nome+' ('+(a.esfera||'')+') — '+(a.por_que_cabe||''); }).join('\n');
  var ins = (iv.instrumentos||[]).map(function(i){ return '['+i.ref+'] '+i.nome+' — '+(i.o_que_e||'')+' — agentes: '+(i.agentes||[]).join(', '); }).join('\n');
  var det = (iv.detalhamentos||[]).map(function(d){ return '['+d.ref+'] '+d.texto+' — combina com: '+(d.combina_com||[]).join(', '); }).join('\n');
  return '\n\nGABARITO DO TEMA (aprovado pela professora — escolha daqui, não invente):\nEIXOS ARGUMENTATIVOS:\n'+(args||'(nenhum)')+'\nAGENTES:\n'+(ag||'(nenhum)')+'\nINSTRUMENTOS (o meio):\n'+(ins||'(nenhum)')+'\nDETALHAMENTOS:\n'+(det||'(nenhum)')+'\nNÃO SERVE COMO MEIO SOZINHO: '+((iv.nao_serve_como_meio||[]).join('; ')||'campanhas de conscientização; políticas públicas');
}
function redaonFichasReferenciadas(ac, plano){
  if(!ac || !plano) return '';
  var refs = {}; (plano.fichas_usadas||[]).forEach(function(r){ refs[String(r).toUpperCase().trim()]=1; });
  (plano.eixos||[]).forEach(function(e){ if(e && e.ficha_ref) refs[String(e.ficha_ref).toUpperCase().trim()]=1; });
  var linhas = Object.keys(refs).map(function(r){ var f=ac.refs[r]; return f ? '['+f.ref+'] ('+f.eixo+') '+f.fonte+' — '+f.dado+'\n  diz: '+f.diz : null; }).filter(Boolean);
  return linhas.length ? '\n\nFICHAS REFERENCIADAS NO PLANO (cite o trecho literal, com o nome da lei/autor como está aqui):\n'+linhas.join('\n') : '';
}
/* Diagnóstico estruturado dos 7 agentes (correcao_json._agentes) como entrada do bloco final */
function redaonTextoDiagnostico(json){
  var ag = json && json._agentes; if(!ag) return '';
  var d = { c1:ag.c1||null, c2:ag.c2||null, c3:ag.c3||null, c4:ag.c4||null, c5:ag.c5||null };
  try{ return '\n\nDIAGNÓSTICO ESTRUTURADO DOS CORRETORES (JSON):\n'+JSON.stringify(d); }catch(e){ return ''; }
}

/* ─── Guardas por código: o que o modelo não pode entregar ao aluno ─── */
function redaonTextoReescrita(j){ return [j.redacao_nota_1000_intro,j.redacao_nota_1000_dev1,j.redacao_nota_1000_dev2,j.redacao_nota_1000_conclusao].filter(Boolean).join('\n\n'); }
function redaonChecarReescrita(j, plano, ac){
  var falhas = [], t = redaonTextoReescrita(j), tn = redaonNorm(t);
  if(t.length < 600) falhas.push('reescrita curta ou incompleta');
  if(t.length > 2750) falhas.push('texto longo demais: '+t.length+' caracteres (máximo 2.600, 28 linhas); reduza cada parágrafo a no máximo 5 frases curtas, sem tirar argumento nem repertório');
  ['retomando a moldura','moldura inicial','serao analisados','serao abordados','a tese e que','este texto','o presente texto','e notorio que','e fundamental ressaltar','hodiernamente'].forEach(function(c){ if(tn.indexOf(c)>=0) falhas.push('remova a expressão "'+c+'" (metalinguagem ou vazamento do plano)'); });
  if(/estatuto do idoso/.test(tn)) falhas.push('use o nome atual "Estatuto da Pessoa Idosa (Lei nº 10.741/2003)" no lugar de "Estatuto do Idoso"');
  if(/ministerio da mulher/.test(tn)) falhas.push('o Ministério da Mulher, da Família e dos Direitos Humanos não existe mais; use o agente do plano');
  /* repertório do aluno preservado: nomes próprios listados no plano precisam aparecer */
  var mant = (plano && plano.fidelidade && plano.fidelidade.nomes_e_relacoes_mantidos) || [];
  var nomes = []; mant.forEach(function(s){ (String(s).match(/\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]{2,}\b/g)||[]).forEach(function(n){ if(['Homer','Abraham','Carl','Simpsons','Up'].indexOf(n)>=0 || /^[A-Z]/.test(n)) nomes.push(n); }); });
  nomes = nomes.filter(function(n,i,a){ return a.indexOf(n)===i && ['Filho','Pai','Idoso','Idosa','Aluno'].indexOf(n)<0; });
  var sumiram = nomes.filter(function(n){ return tn.indexOf(redaonNorm(n))<0; });
  if(sumiram.length) falhas.push('o repertório do aluno precisa continuar no texto: '+sumiram.join(', '));
  /* citação de ficha sem aspas */
  if(ac && ac.fichas){ ac.fichas.forEach(function(f){ (String(f.diz||'').match(/"([^"]{40,})"/g)||[]).forEach(function(q){ var frag=redaonNorm(q.slice(1,-1)).slice(0,60); var i=tn.indexOf(frag); if(i>0 && !/["“]/.test(tn.slice(Math.max(0,i-3),i))) falhas.push('o trecho da ficha '+f.ref+' precisa vir entre aspas e com a fonte nomeada'); }); }); }
  return falhas;
}
function redaonCorrigirNomes(j){
  ['redacao_nota_1000_intro','redacao_nota_1000_dev1','redacao_nota_1000_dev2','redacao_nota_1000_conclusao'].forEach(function(k){ if(j[k]) j[k]=String(j[k]).replace(/Estatuto do Idoso/g,'Estatuto da Pessoa Idosa'); });
  return j;
}
