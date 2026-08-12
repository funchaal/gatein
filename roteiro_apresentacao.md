# 🎬 Roteiro de Apresentação — GateIn

> **Público:** Sócio/Investidor
> **Duração estimada:** 25–35 min
> **Base URL do servidor:** `http://localhost:5000`
> **API Key do Terminal (exemplo):** `sk_live_...` *(use a key real do terminal de demonstração)*
> **API Key da Transportadora (exemplo):** `sk_live_...` *(use a key real da transportadora de demonstração)*
> **CPF do motorista demonstração:** `12345678901`
> **CNH do motorista demonstração:** `04567891234`

---

## 📋 Pré-Requisitos / Setup Antes da Apresentação

> [!IMPORTANT]
> Execute estas etapas **ANTES** da apresentação para garantir fluidez.

### 1. Garantir que existem empresas no banco

Você precisa de pelo menos:
- **1 Terminal** (ex: Terminal Porto de Macaé)
- **1 Transportadora** (ex: TransLog Frete S.A.)

Ambos devem ter API Keys geradas.

### 2. Criar Layouts (obrigatório antes de criar agendamentos/viagens)

Os layouts definem como os cards de appointments/trips/tickets são renderizados no app. **Sem layouts, os agendamentos serão rejeitados.**

#### 2.1 — Login no painel Web (para criar layouts)

```bash
curl -X POST "http://localhost:5000/api/web/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin.terminal",
    "password": "SenhaDoAdmin123!"
  }'
```

> Copie o `token` retornado. Use-o como `Authorization: Bearer <TOKEN>` nos requests abaixo.

#### 2.2 — Criar Appointment Layout (Terminal)

```bash
curl -X PUT "http://localhost:5000/api/web/config/appointment/layouts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_WEB_TERMINAL>" \
  -d '{
    "ref": "carga_geral",
    "title": "Carga Geral",
    "card_layout": {
      "header": {
        "field": "summary",
        "label": "Operação"
      },
      "sub_header": {
        "label": "Veículo",
        "field": "license_plate"
      },
      "body_rows": [
        { "label": "Transportadora", "field": "transportadora" },
        { "label": "Produto", "field": "produto" },
        { "label": "Nota Fiscal", "field": "nota_fiscal" },
        { "label": "Berço / Doca", "field": "berco" }
      ]
    },
    "modal_layout": [
      {
        "element": "section",
        "title": "Detalhes da Operação",
        "fields": [
          { "label": "Nota Fiscal", "field": "nota_fiscal" },
          { "label": "CT-e", "field": "num_cte" },
          { "label": "Produto", "field": "produto" },
          { "label": "Tipo de Operação", "field": "tipo_operacao" },
          { "label": "Peso (ton)", "field": "peso_ton" },
          { "label": "Navio", "field": "navio" },
          { "label": "Berço / Destino", "field": "berco" },
          { "label": "Lacre de Segurança", "field": "lacre" }
        ]
      },
      {
        "element": "section",
        "title": "Veículo e Motorista",
        "fields": [
          { "label": "Motorista", "field": "nome_motorista" },
          { "label": "CPF Motorista", "field": "cpf_motorista" },
          { "label": "CNH Motorista", "field": "cnh_motorista" },
          { "label": "Telefone / Celular", "field": "celular_motorista" },
          { "label": "Transportadora", "field": "transportadora" },
          { "label": "Placa Cavalo", "field": "license_plate" },
          { "label": "Placa Carreta", "field": "placa_carreta" }
        ]
      },
      {
        "element": "section",
        "title": "Controle e Logística",
        "fields": [
          { "label": "Prioridade da Carga", "field": "nivel_prioridade" },
          { "label": "Tolerância Janela", "field": "janela_tolerancia" }
        ]
      },
      {
        "element": "field",
        "label": "Observações do Terminal",
        "field": "observacoes"
      },
      {
        "element": "qrcode",
        "title": "Código do Agendamento",
        "field": "ref",
        "caption": "Apresente o QR Code na guarita de acesso"
      }
    ]
  }'
```

**JSON para copiar e colar diretamente no Editor do Webapp (aba JSON):**

```json
{
  "ref": "carga_geral",
  "title": "Carga Geral",
  "card_layout": {
    "header": {
      "field": "summary",
      "label": "Operação"
    },
    "sub_header": {
      "label": "Veículo",
      "field": "license_plate"
    },
    "body_rows": [
      { "label": "Transportadora", "field": "transportadora" },
      { "label": "Produto", "field": "produto" },
      { "label": "Nota Fiscal", "field": "nota_fiscal" },
      { "label": "Berço / Doca", "field": "berco" }
    ]
  },
  "modal_layout": [
    {
      "element": "section",
      "title": "Detalhes da Operação",
      "fields": [
        { "label": "Nota Fiscal", "field": "nota_fiscal" },
        { "label": "CT-e", "field": "num_cte" },
        { "label": "Produto", "field": "produto" },
        { "label": "Tipo de Operação", "field": "tipo_operacao" },
        { "label": "Peso (ton)", "field": "peso_ton" },
        { "label": "Navio", "field": "navio" },
        { "label": "Berço / Destino", "field": "berco" },
        { "label": "Lacre de Segurança", "field": "lacre" }
      ]
    },
    {
      "element": "section",
      "title": "Veículo e Motorista",
      "fields": [
        { "label": "Motorista", "field": "nome_motorista" },
        { "label": "CPF Motorista", "field": "cpf_motorista" },
        { "label": "CNH Motorista", "field": "cnh_motorista" },
        { "label": "Telefone / Celular", "field": "celular_motorista" },
        { "label": "Transportadora", "field": "transportadora" },
        { "label": "Placa Cavalo", "field": "license_plate" },
        { "label": "Placa Carreta", "field": "placa_carreta" }
      ]
    },
    {
      "element": "section",
      "title": "Controle e Logística",
      "fields": [
        { "label": "Prioridade da Carga", "field": "nivel_prioridade" },
        { "label": "Tolerância Janela", "field": "janela_tolerancia" }
      ]
    },
    {
      "element": "field",
      "label": "Observações do Terminal",
      "field": "observacoes"
    },
    {
      "element": "qrcode",
      "title": "Código do Agendamento",
      "field": "ref",
      "caption": "Apresente o QR Code na guarita de acesso"
    }
  ]
}
```

#### 2.3 — Criar Ticket Layout (Terminal)

```bash
curl -X PUT "http://localhost:5000/api/web/config/ticket/layouts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_WEB_TERMINAL>" \
  -d '{
    "ref": "ticket_padrao",
    "title": "Ticket de Entrada",
    "layout": [
      {
        "element": "tag_container",
        "label": "Status da Liberação",
        "tags": [
          { "label": "Liberado", "color": "green", "icon": "check-circle-outline" },
          { "label": "Balança Obrigatória", "color": "orange", "icon": "scale" },
          { "label": "Vistoria Concluída", "color": "blue", "icon": "shield-check-outline" }
        ]
      },
      {
        "element": "highlight_grid",
        "label": "Dados de Acesso Rápido",
        "items": [
          { "label": "Gate", "useField": true, "field": "gate_entrada", "color": "green", "caption": "Entrada autorizada" },
          { "label": "Doca", "useField": true, "field": "doca", "color": "blue", "caption": "Destino interno" },
          { "label": "Balança", "useField": true, "field": "balanca", "color": "orange", "caption": "Pesagem 01" },
          { "label": "Status", "useField": true, "field": "autorizacao", "color": "green", "caption": "Acesso Liberado" }
        ]
      },
      {
        "element": "section",
        "title": "Identificação do Ticket"
      },
      { "element": "field", "label": "Nº Ticket", "field": "numero_ticket" },
      { "element": "field", "label": "Data / Hora Entrada", "field": "hora_entrada" },
      { "element": "field", "label": "Validade do Ticket", "field": "validade_ticket" },
      { "element": "field", "label": "Operador Responsável", "field": "operador" },
      {
        "element": "section",
        "title": "Dados da Operação e Carga"
      },
      { "element": "field", "label": "Produto", "field": "produto" },
      { "element": "field", "label": "Nota Fiscal", "field": "nota_fiscal" },
      { "element": "field", "label": "CT-e", "field": "num_cte" },
      { "element": "field", "label": "Destino Interno", "field": "destino_interno" },
      { "element": "field", "label": "Peso Programado", "field": "peso_solicitado" },
      { "element": "field", "label": "Peso Entrada (kg)", "field": "balanca_entrada" },
      { "element": "field", "label": "Peso Tara (kg)", "field": "peso_tara" },
      { "element": "field", "label": "Lacre de Segurança", "field": "lacre_seguranca" },
      {
        "element": "section",
        "title": "Veículo e Transportador"
      },
      { "element": "field", "label": "Motorista", "field": "nome_motorista" },
      { "element": "field", "label": "CPF Motorista", "field": "cpf_motorista" },
      { "element": "field", "label": "CNH Motorista", "field": "cnh_motorista" },
      { "element": "field", "label": "Placa Cavalo", "field": "placa" },
      { "element": "field", "label": "Placa Carreta", "field": "placa_carreta" },
      { "element": "field", "label": "Transportadora", "field": "transportadora" },
      {
        "element": "attention",
        "title": "Instruções da Portaria e Pátio",
        "useField": true,
        "field": "observacoes_gate",
        "color": "orange",
        "icon": "alert-circle-outline"
      },
      {
        "element": "instruction",
        "title": "INSTRUÇÕES DE ACESSO E NORMAS INTERNAS",
        "steps": [
          "Dirija-se ao gate e balança indicados acima no painel.",
          "Apresente este ticket digital ao operador ou no leitor ótico da balança.",
          "Uso obrigatório de EPI (capacete, colete refletivo e calçado fechado).",
          "Respeite o limite máximo de velocidade de 20 km/h dentro do terminal.",
          "Aguarde a liberação da cancela e o direcionamento para a doca de descarga."
        ]
      }
    ]
  }'
```

**JSON para copiar e colar diretamente no Editor do Webapp (aba JSON):**

```json
{
  "ref": "ticket_padrao",
  "title": "Ticket de Entrada",
  "layout": [
    {
      "element": "tag_container",
      "label": "Status da Liberação",
      "tags": [
        { "label": "Liberado", "color": "green", "icon": "check-circle-outline" },
        { "label": "Balança Obrigatória", "color": "orange", "icon": "scale" },
        { "label": "Vistoria Concluída", "color": "blue", "icon": "shield-check-outline" }
      ]
    },
    {
      "element": "highlight_grid",
      "label": "Dados de Acesso Rápido",
      "items": [
        { "label": "Gate", "useField": true, "field": "gate_entrada", "color": "green", "caption": "Entrada autorizada" },
        { "label": "Doca", "useField": true, "field": "doca", "color": "blue", "caption": "Destino interno" },
        { "label": "Balança", "useField": true, "field": "balanca", "color": "orange", "caption": "Pesagem 01" },
        { "label": "Status", "useField": true, "field": "autorizacao", "color": "green", "caption": "Acesso Liberado" }
      ]
    },
    {
      "element": "section",
      "title": "Identificação do Ticket"
    },
    { "element": "field", "label": "Nº Ticket", "field": "numero_ticket" },
    { "element": "field", "label": "Data / Hora Entrada", "field": "hora_entrada" },
    { "element": "field", "label": "Validade do Ticket", "field": "validade_ticket" },
    { "element": "field", "label": "Operador Responsável", "field": "operador" },
    {
      "element": "section",
      "title": "Dados da Operação e Carga"
    },
    { "element": "field", "label": "Produto", "field": "produto" },
    { "element": "field", "label": "Nota Fiscal", "field": "nota_fiscal" },
    { "element": "field", "label": "CT-e", "field": "num_cte" },
    { "element": "field", "label": "Destino Interno", "field": "destino_interno" },
    { "element": "field", "label": "Peso Programado", "field": "peso_solicitado" },
    { "element": "field", "label": "Peso Entrada (kg)", "field": "balanca_entrada" },
    { "element": "field", "label": "Peso Tara (kg)", "field": "peso_tara" },
    { "element": "field", "label": "Lacre de Segurança", "field": "lacre_seguranca" },
    {
      "element": "section",
      "title": "Veículo e Transportador"
    },
    { "element": "field", "label": "Motorista", "field": "nome_motorista" },
    { "element": "field", "label": "CPF Motorista", "field": "cpf_motorista" },
    { "element": "field", "label": "CNH Motorista", "field": "cnh_motorista" },
    { "element": "field", "label": "Placa Cavalo", "field": "placa" },
    { "element": "field", "label": "Placa Carreta", "field": "placa_carreta" },
    { "element": "field", "label": "Transportadora", "field": "transportadora" },
    {
      "element": "attention",
      "title": "Instruções da Portaria e Pátio",
      "useField": true,
      "field": "observacoes_gate",
      "color": "orange",
      "icon": "alert-circle-outline"
    },
    {
      "element": "instruction",
      "title": "INSTRUÇÕES DE ACESSO E NORMAS INTERNAS",
      "steps": [
        "Dirija-se ao gate e balança indicados acima no painel.",
        "Apresente este ticket digital ao operador ou no leitor ótico da balança.",
        "Uso obrigatório de EPI (capacete, colete refletivo e calçado fechado).",
        "Respeite o limite máximo de velocidade de 20 km/h dentro do terminal.",
        "Aguarde a liberação da cancela e o direcionamento para a doca de descarga."
      ]
    }
  ]
}
```

#### 2.4 — Criar Trip Layout (Transportadora)

Faça login no painel da transportadora primeiro:

```bash
curl -X POST "http://localhost:5000/api/web/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin.translog",
    "password": "SenhaDoAdmin123!"
  }'
```

```bash
curl -X PUT "http://localhost:5000/api/web/config/trip/layouts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_WEB_TRANSPORTADORA>" \
  -d '{
    "ref": "frete_rodoviario",
    "title": "Frete Rodoviário",
    "card_layout": {
      "header": {
        "field": "summary",
        "label": "Frete"
      },
      "sub_header": {
        "label": "Veículo",
        "field": "license_plate"
      },
      "body_rows": [
        { "label": "Transportadora", "field": "transportadora" },
        { "label": "Tipo de Carga", "field": "tipo_carga" },
        { "label": "Contratante", "field": "contratante" },
        { "label": "Valor do Frete", "field": "valor_frete" }
      ]
    },
    "modal_layout": [
      {
        "element": "section",
        "title": "Detalhes da Carga e Frete",
        "fields": [
          { "label": "Tipo de Carga", "field": "tipo_carga" },
          { "label": "Peso Total", "field": "peso_total" },
          { "label": "Pedido", "field": "num_pedido" },
          { "label": "Contratante", "field": "contratante" },
          { "label": "Valor do Frete", "field": "valor_frete" },
          { "label": "Nota Fiscal Carga", "field": "nota_fiscal" },
          { "label": "CT-e Viagem", "field": "cte_viagem" }
        ]
      },
      {
        "element": "section",
        "title": "Veículo e Equipamento",
        "fields": [
          { "label": "Tipo de Veículo", "field": "tipo_veiculo" },
          { "label": "Placa Cavalo", "field": "license_plate" },
          { "label": "Placa Carreta", "field": "placa_carreta" },
          { "label": "Lacre de Carga", "field": "lacre_seguranca" }
        ]
      },
      {
        "element": "section",
        "title": "Instruções e Rastreamento",
        "fields": [
          { "label": "Instruções de Carga", "field": "instrucoes_carga" },
          { "label": "Instruções de Descarga", "field": "instrucoes_descarga" },
          { "label": "Contato no Destino", "field": "contato_destinatario" },
          { "label": "Telefone Destino", "field": "telefone_destinatario" },
          { "label": "Gerenciadora de Risco", "field": "gerenciadora_risco" }
        ]
      },
      {
        "element": "qrcode",
        "title": "Código da Viagem",
        "field": "ref",
        "caption": "Apresente no check-in do terminal"
      }
    ]
  }'
```

**JSON para copiar e colar diretamente no Editor do Webapp (aba JSON):**

```json
{
  "ref": "frete_rodoviario",
  "title": "Frete Rodoviário",
  "card_layout": {
    "header": {
      "field": "summary",
      "label": "Frete"
    },
    "sub_header": {
      "label": "Veículo",
      "field": "license_plate"
    },
    "body_rows": [
      { "label": "Transportadora", "field": "transportadora" },
      { "label": "Tipo de Carga", "field": "tipo_carga" },
      { "label": "Contratante", "field": "contratante" },
      { "label": "Valor do Frete", "field": "valor_frete" }
    ]
  },
  "modal_layout": [
    {
      "element": "section",
      "title": "Detalhes da Carga e Frete",
      "fields": [
        { "label": "Tipo de Carga", "field": "tipo_carga" },
        { "label": "Peso Total", "field": "peso_total" },
        { "label": "Pedido", "field": "num_pedido" },
        { "label": "Contratante", "field": "contratante" },
        { "label": "Valor do Frete", "field": "valor_frete" },
        { "label": "Nota Fiscal Carga", "field": "nota_fiscal" },
        { "label": "CT-e Viagem", "field": "cte_viagem" }
      ]
    },
    {
      "element": "section",
      "title": "Veículo e Equipamento",
      "fields": [
        { "label": "Tipo de Veículo", "field": "tipo_veiculo" },
        { "label": "Placa Cavalo", "field": "license_plate" },
        { "label": "Placa Carreta", "field": "placa_carreta" },
        { "label": "Lacre de Carga", "field": "lacre_seguranca" }
      ]
    },
    {
      "element": "section",
      "title": "Instruções e Rastreamento",
      "fields": [
        { "label": "Instruções de Carga", "field": "instrucoes_carga" },
        { "label": "Instruções de Descarga", "field": "instrucoes_descarga" },
        { "label": "Contato no Destino", "field": "contato_destinatario" },
        { "label": "Telefone Destino", "field": "telefone_destinatario" },
        { "label": "Gerenciadora de Risco", "field": "gerenciadora_risco" }
      ]
    },
    {
      "element": "qrcode",
      "title": "Código da Viagem",
      "field": "ref",
      "caption": "Apresente no check-in do terminal"
    }
  ]
}
```

### 3. Criar Announcements iniciais (2 avisos já rodando)

> [!TIP]
> Crie 2 announcements com imagens IA ANTES da demo. Na hora da apresentação, você cria mais 1 ao vivo.

#### 🖼️ Descrições das 3 Imagens para Gerar com IA

**Imagem 1 — "Manutenção Programada"**
> Foto realista de uma portaria industrial de terminal portuário com uma barreira de segurança laranja e cones de sinalização, faixa amarela de "ÁREA EM MANUTENÇÃO" cruzando a entrada, céu azul ao fundo, guindaste portuário desfocado no horizonte. Tons de laranja, amarelo e cinza industrial. Sem texto na imagem. Aspecto horizontal 16:9.

**Imagem 2 — "Novo Protocolo de Segurança"**
> Foto realista de um trabalhador de costas vestindo colete refletivo amarelo classe 3, capacete branco e botas de segurança, caminhando em direção a uma área operacional de terminal portuário com containers coloridos empilhados ao fundo. Iluminação dourada de fim de tarde. Sem texto na imagem. Aspecto horizontal 16:9.

**Imagem 3 — "Campanha de Vacinação" (criada ao vivo na demo)**
> Ilustração clean e moderna de uma seringa estilizada com um escudo de proteção, fundo gradiente azul claro para branco, ícones sutis de saúde (cruz médica, coração) espalhados ao redor. Visual corporativo e limpo, estilo flat design. Sem texto na imagem. Aspecto horizontal 16:9.

---

```bash
curl -X POST "http://localhost:5000/api/web/announcements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_WEB_TERMINAL>" \
  -d '{
    "title": "Manutenção Programada",
    "subtitle": "Portaria Norte fechada dia 15/08",
    "description": "A Portaria Norte estará fechada para manutenção de 06h às 18h. Utilize a Portaria Sul como alternativa.",
    "image_url": "<URL_DA_IMAGEM_IA_1>",
    "image_position": { "x": 50, "y": 40 },
    "is_active": true
  }'
```

```bash
curl -X POST "http://localhost:5000/api/web/announcements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_WEB_TERMINAL>" \
  -d '{
    "title": "Novo Protocolo de Segurança",
    "subtitle": "Obrigatório o uso de colete refletivo",
    "description": "A partir de 01/09, todos os motoristas devem usar colete refletivo classe 3 ao desembarcar na área operacional.",
    "image_url": "<URL_DA_IMAGEM_IA_2>",
    "image_position": { "x": 50, "y": 50 },
    "is_active": true
  }'
```

### 4. Limpar motorista de teste (se existir de demo anterior)

Delete qualquer registro anterior do CPF `12345678901` para simular uma conta nova.

---

## 🎬 ROTEIRO DA APRESENTAÇÃO

---

### PARTE 1 — Cadastro do Motorista no App (5 min)

> **Objetivo:** Mostrar o fluxo de onboarding completo com validações de segurança.

**Fala sugerida:**
> *"Vamos começar mostrando como um motorista se cadastra pela primeira vez no GateIn. O processo é seguro e validado em múltiplas etapas."*

---

#### CENA 1.1 — Simular CPF Incorreto ❌

1. Abra o app no celular/emulador
2. Na tela inicial, digite um CPF inválido (ex: `111.111.111-11`)
3. **Resultado esperado:** O app valida o formato do CPF e mostra erro de validação
4. **Fala:** *"Repare que o sistema já valida o CPF antes de enviar ao servidor. Não aceita CPFs inválidos."*

#### CENA 1.2 — Digitar CPF correto e solicitar OTP

1. Digite o CPF válido: `123.456.789-01`
2. Preencha nome e telefone
3. O app envia o OTP via SMS (no dev, o código aparece no log do servidor)

**Para verificar o código no servidor** (olhe o log do terminal):
```
[DEV] OTP 12345678901: XXXX
```

#### CENA 1.3 — Simular OTP Incorreto ❌

1. No campo de código, digite um código errado (ex: `0000`)
2. **Resultado esperado:** Mensagem de erro "Código inválido"
3. **Fala:** *"O sistema protege contra tentativas de códigos aleatórios."*

#### CENA 1.4 — Digitar OTP Correto ✅

1. Digite o código correto que apareceu no log do servidor
2. O app avança para a tela de validação da CNH

#### CENA 1.5 — Simular CNH Incorreta ❌

1. Digite um número de CNH que não bate com o do banco (ex: `99999999999`)
2. **Resultado esperado:** Erro `DRIVER_LICENSE_NUMBER_MISMATCH` ou `DRIVER_LICENSE_PENDING_VALIDATION`
3. **Fala:** *"A CNH é validada contra os dados que o terminal/transportadora enviou via API. O motorista só consegue criar conta se a CNH dele já estiver no sistema — isso garante que apenas motoristas autorizados acessam."*

> [!IMPORTANT]
> Para que a CNH seja aceita, o motorista precisa já existir na tabela `drivers`. Isso acontece automaticamente quando o terminal cria um agendamento com os dados do motorista via API.

#### CENA 1.6 — Digitar CNH Correta ✅

1. Use a CNH correta: `04567891234`
2. O app avança para a tela de criação de senha

#### CENA 1.7 — Criar Senha e Finalizar Cadastro ✅

1. Crie uma senha (ex: `Gatein@2026`)
2. **Resultado esperado:** Conta criada com sucesso, usuário logado e redirecionado para a Home

---

### PARTE 2 — Interface Vazia do App (1 min)

> **Objetivo:** Mostrar que o app novo de um motorista começa limpo.

**Fala sugerida:**
> *"Como acabamos de criar a conta, o motorista ainda não tem nenhum agendamento ou viagem. Tudo está vazio — essa é a experiência real de um motorista que acabou de se cadastrar."*

1. Mostre a tela **Home** → sem agendamentos, mensagem de "Nenhuma atividade encontrada"
2. Mostre a aba **Activity** → lista vazia
3. Mostre os **Announcements** no topo → devem aparecer os 2 avisos criados anteriormente
4. **Fala:** *"Repare que já aparecem os avisos (announcements) do terminal mais próximo. O motorista vê comunicados das empresas próximas antes mesmo de ter um agendamento."*

---

### PARTE 3 — Terminal Cria Agendamentos via API (8 min)

> **Objetivo:** Demonstrar como o ERP de um terminal envia agendamentos via API pública.

**Fala sugerida:**
> *"Agora vou mostrar o lado do terminal. Na vida real, o ERP do terminal faz essas chamadas automaticamente. Aqui vou simular usando o Postman."*

1. **Feche o app** do motorista (deixe em segundo plano)
2. **Abra o Postman**

---

#### CENA 3.1 — Criar 3 Agendamentos (Appointments)

**Fala:** *"O terminal está criando 3 agendamentos para este motorista em horários futuros."*

> [!TIP]
> Ajuste os valores de `window_start` e `window_end` para datas/horários futuros a partir do momento da demo. Exemplo: se a demo é às 15:40 BRT (18:40 UTC), coloque horários como 20:00, 21:00 e 22:00 UTC.

```bash
curl -X POST "http://localhost:5000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_live_88211157d4_1WC-42pSUqQJOpZF5_Ly4AP7lCa9iUYHCJ_04iOwem8" \
  -d '[
    {
      "driver": {
        "tax_id": "12345678901",
        "driver_license_number": "04567891234",
        "license_category": "E"
      },
      "appointment": {
        "ref": "APPT-2026-0001",
        "layout_ref": "carga_geral",
        "summary": "Descarga de Soja — Navio MV Atlantic Star",
        "license_plate": "ABC1D23",
        "window_start": "2026-08-10T08:00:00-03:00",
        "window_end": "2026-08-10T10:00:00-03:00",
        "start_tolerance": 30,
        "end_tolerance": 15,
        "custom_data": {
          "nome_motorista": "Carlos Silva",
          "cpf_motorista": "123.456.789-01",
          "cnh_motorista": "04567891234",
          "celular_motorista": "(22) 99887-1122",
          "transportadora": "TransLog Frete S.A.",
          "placa_carreta": "XYZ9E87",
          "nota_fiscal": "NF-2026-004871",
          "num_cte": "CT-e 35260812345678000199550010000048711",
          "produto": "Soja em Grão",
          "peso_ton": "42.5",
          "tipo_operacao": "Descarga Granel",
          "navio": "MV Atlantic Star",
          "berco": "Berço 3 — Ala Norte",
          "lacre": "LAC-889244",
          "nivel_prioridade": "Alta (Navio Operando)",
          "janela_tolerancia": "30 min início / 15 min fim",
          "observacoes": "Prioridade alta. Apresentar NF e CT-e na portaria. Lona limpa e seca."
        }
      }
    },
    {
      "driver": {
        "tax_id": "12345678901",
        "driver_license_number": "04567891234",
        "license_category": "E"
      },
      "appointment": {
        "ref": "APPT-2026-0002",
        "layout_ref": "carga_geral",
        "summary": "Carregamento de Fertilizante — Pátio C",
        "license_plate": "ABC1D23",
        "window_start": "2026-08-10T14:00:00-03:00",
        "window_end": "2026-08-10T16:30:00-03:00",
        "start_tolerance": 20,
        "end_tolerance": 30,
        "custom_data": {
          "nome_motorista": "Carlos Silva",
          "cpf_motorista": "123.456.789-01",
          "cnh_motorista": "04567891234",
          "celular_motorista": "(22) 99887-1122",
          "transportadora": "TransLog Frete S.A.",
          "placa_carreta": "XYZ9E87",
          "nota_fiscal": "NF-2026-004872",
          "num_cte": "CT-e 35260812345678000199550010000048722",
          "produto": "Fertilizante MAP",
          "peso_ton": "38.0",
          "tipo_operacao": "Carregamento Granel",
          "navio": "—",
          "berco": "Pátio C — Área de Fertilizantes",
          "lacre": "LAC-889245",
          "nivel_prioridade": "Normal",
          "janela_tolerancia": "20 min início / 30 min fim",
          "observacoes": "Veículo deve estar limpo e com lona em boas condições para carregamento."
        }
      }
    },
    {
      "driver": {
        "tax_id": "12345678901",
        "driver_license_number": "04567891234",
        "license_category": "E"
      },
      "appointment": {
        "ref": "APPT-2026-0003",
        "layout_ref": "carga_geral",
        "summary": "Retirada de Container — Terminal de Containers",
        "license_plate": "ABC1D23",
        "window_start": "2026-08-11T07:00:00-03:00",
        "window_end": "2026-08-11T09:00:00-03:00",
        "start_tolerance": 15,
        "end_tolerance": 15,
        "custom_data": {
          "nome_motorista": "Carlos Silva",
          "cpf_motorista": "123.456.789-01",
          "cnh_motorista": "04567891234",
          "celular_motorista": "(22) 99887-1122",
          "transportadora": "TransLog Frete S.A.",
          "placa_carreta": "XYZ9E87",
          "nota_fiscal": "NF-2026-004873",
          "num_cte": "CT-e 35260812345678000199550010000048733",
          "produto": "Container 40ft — Peças Automotivas",
          "peso_ton": "28.3",
          "tipo_operacao": "Retirada de Container",
          "navio": "MV Pacific Trader",
          "berco": "Berço 1 — Terminal de Containers",
          "lacre": "LAC-889246",
          "nivel_prioridade": "Normal",
          "janela_tolerancia": "15 min início / 15 min fim",
          "observacoes": "Container MSKU7654321. Levar booking confirmation impresso ou digital."
        }
      }
    }
  ]'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "created_refs": ["APPT-2026-0001", "APPT-2026-0002", "APPT-2026-0003"],
    "status": "created"
  }
}
```

---

#### CENA 3.2 — Criar 2 Viagens (Trips) pela Transportadora

**Fala:** *"Agora vou simular a transportadora enviando 2 viagens programadas para o mesmo motorista."*

```bash
curl -X POST "http://localhost:5000/api/v1/trips" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY_DA_TRANSPORTADORA>" \
  -d '[
    {
      "driver": {
        "tax_id": "12345678901",
        "driver_license_number": "04567891234",
        "license_category": "E"
      },
      "trip": {
        "ref": "TRIP-2026-0001",
        "layout_ref": "frete_rodoviario",
        "summary": "Frete de Soja — Fazenda Aurora → Terminal Porto de Macaé",
        "license_plate": "ABC1D23",
        "window_start": "2026-08-10T05:00:00-03:00",
        "window_end": "2026-08-10T07:30:00-03:00",
        "start_tolerance": 30,
        "end_tolerance": 30,
        "from_location": "Fazenda Aurora — Rod. BR-101, km 142",
        "to_location": "Terminal Porto de Macaé",
        "origin_street": "Rodovia BR-101",
        "origin_number": "km 142",
        "origin_city": "Campos dos Goytacazes",
        "origin_state": "RJ",
        "origin_country": "Brasil",
        "origin_zip": "28080-000",
        "origin_lat": -21.7545,
        "origin_lng": -41.3244,
        "destiny_street": "Av. Atlântica",
        "destiny_number": "1500",
        "destiny_city": "Macaé",
        "destiny_state": "RJ",
        "destiny_country": "Brasil",
        "destiny_zip": "27930-000",
        "destiny_lat": -22.3768,
        "destiny_lng": -41.7869,
        "custom_data": {
          "nome_motorista": "Carlos Silva",
          "transportadora": "TransLog Frete S.A.",
          "tipo_carga": "Grãos — Soja",
          "peso_total": "42.5 toneladas",
          "num_pedido": "PED-2026-11487",
          "contratante": "Agroindustrial Goytacazes Ltda.",
          "valor_frete": "R$ 4.850,00",
          "nota_fiscal": "NF-2026-004871",
          "cte_viagem": "CT-e 35260812345678000199550010000048711",
          "tipo_veiculo": "Carreta Graneleira 9 Eixos",
          "placa_carreta": "XYZ9E87",
          "lacre_seguranca": "LAC-889244",
          "instrucoes_carga": "Carregamento mecanizado no silo 2. Acompanhar pesagem na balança da fazenda. Amarração e lona obrigatórias.",
          "instrucoes_descarga": "Dirigir-se à balança do Terminal Porto de Macaé. Aguardar liberação do Berço 3.",
          "contato_destinatario": "João Carlos",
          "telefone_destinatario": "(22) 98877-6655",
          "gerenciadora_risco": "Buonny Gerenciamento de Risco (Liberação #99482)"
        }
      }
    },
    {
      "driver": {
        "tax_id": "12345678901",
        "driver_license_number": "04567891234",
        "license_category": "E"
      },
      "trip": {
        "ref": "TRIP-2026-0002",
        "layout_ref": "frete_rodoviario",
        "summary": "Frete de Fertilizante — Porto de Macaé → Distribuidor Agrícola Vale",
        "license_plate": "ABC1D23",
        "window_start": "2026-08-10T17:00:00-03:00",
        "window_end": "2026-08-10T20:00:00-03:00",
        "start_tolerance": 15,
        "end_tolerance": 30,
        "from_location": "Terminal Porto de Macaé",
        "to_location": "Distribuidor Agrícola Vale — Itaboraí",
        "origin_street": "Av. Atlântica",
        "origin_number": "1500",
        "origin_city": "Macaé",
        "origin_state": "RJ",
        "origin_country": "Brasil",
        "origin_zip": "27930-000",
        "origin_lat": -22.3768,
        "origin_lng": -41.7869,
        "destiny_street": "Rod. RJ-104",
        "destiny_number": "km 23",
        "destiny_city": "Itaboraí",
        "destiny_state": "RJ",
        "destiny_country": "Brasil",
        "destiny_zip": "24800-000",
        "destiny_lat": -22.7456,
        "destiny_lng": -42.8601,
        "custom_data": {
          "nome_motorista": "Carlos Silva",
          "transportadora": "TransLog Frete S.A.",
          "tipo_carga": "Fertilizante MAP Granel",
          "peso_total": "38.0 toneladas",
          "num_pedido": "PED-2026-11488",
          "contratante": "FertiVale Distribuidora S.A.",
          "valor_frete": "R$ 3.200,00",
          "nota_fiscal": "NF-2026-004872",
          "cte_viagem": "CT-e 35260812345678000199550010000048722",
          "tipo_veiculo": "Carreta Sider 3 Eixos",
          "placa_carreta": "XYZ9E87",
          "lacre_seguranca": "LAC-889245",
          "instrucoes_carga": "Carregamento no Pátio C do Porto de Macaé. Apresentar ordem de carregamento na guarita.",
          "instrucoes_descarga": "Descarga mecanizada/manual na doca 4 do Distribuidor Vale. Horário máximo de recebimento: 20:00.",
          "contato_destinatario": "Maria Fernanda",
          "telefone_destinatario": "(21) 99988-7766",
          "gerenciadora_risco": "Opentech Risco (Liberação #88231)"
        }
      }
    }
  ]'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "created_refs": ["TRIP-2026-0001", "TRIP-2026-0002"],
    "status": "created"
  }
}
```

---

#### CENA 3.3 — Mostrar Modal de Detalhes dos Appointments

**Fala:** *"Antes de abrir o app, vou mostrar aqui no Postman que o servidor armazenou tudo corretamente."*

```bash
curl -X GET "http://localhost:5000/api/v1/appointments/logs?refs=APPT-2026-0001&refs=APPT-2026-0002&refs=APPT-2026-0003" \
  -H "X-API-Key: <API_KEY_DO_TERMINAL>"
```

**Fala:** *"Cada agendamento tem seus logs de auditoria. O terminal pode consultar o status a qualquer momento."*

---

#### CENA 3.4 — Mostrar Modal de Detalhes das Trips

```bash
curl -X GET "http://localhost:5000/api/v1/trips/logs?refs=TRIP-2026-0001&refs=TRIP-2026-0002" \
  -H "X-API-Key: <API_KEY_DA_TRANSPORTADORA>"
```

**Fala:** *"A transportadora também pode rastrear todo o histórico das viagens — criação, atualizações, notificações enviadas."*

---

#### CENA 3.5 — Abrir o App e Mostrar Agendamentos/Viagens ✅

**Fala:** *"Agora vamos abrir o app do motorista e ver a mágica acontecer."*

1. Abra o app
2. Mostre a **Home** com os agendamentos listados
3. Mostre os cards com as informações (summary, placa, horário)
4. Toque em um agendamento para abrir os **detalhes** → mostre os campos do `custom_data` renderizados pelo layout
5. Volte e mostre as **trips** → toque em uma para ver os detalhes com origem/destino e mapa
6. **Fala:** *"Repare que cada card é renderizado de acordo com o layout que a empresa configurou. Dados de carga, documentação, instruções — tudo personalizado."*

---

### PARTE 4 — Atualização em Tempo Real (5 min)

> **Objetivo:** Mostrar notificações e atualizações dinâmicas.

#### CENA 4.1 — Atualizar Horário do Agendamento

**Fala:** *"Agora vou simular o terminal alterando o horário do agendamento para daqui a poucos minutos."*

> Substitua o horário abaixo para ser ~5 minutos no futuro a partir do momento da apresentação.

```bash
curl -X PUT "http://localhost:5000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY_DO_TERMINAL>" \
  -d '{
    "ref": "APPT-2026-0001",
    "appointment": {
      "window_start": "2026-08-09T19:00:00Z",
      "window_end": "2026-08-09T21:00:00Z",
      "summary": "Descarga de Soja — Navio MV Atlantic Star [HORÁRIO ATUALIZADO]"
    }
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "updated_refs": ["APPT-2026-0001"],
    "status": "updated"
  }
}
```

---

#### CENA 4.2 — Mostrar Notificação Push

1. **No celular**, mostre a notificação push: *"Horário Alterado — Seu agendamento em Terminal Porto de Macaé foi atualizado para XX/XX às HH:MM."*
2. **Fala:** *"O motorista recebe uma notificação instantânea quando qualquer dado do agendamento é alterado. Isso evita que ele chegue no horário errado."*

---

#### CENA 4.3 — Abrir App e Mostrar Atualização

1. Abra o app
2. Mostre que o agendamento `APPT-2026-0001` agora exibe o novo horário
3. **Fala:** *"Abriu o app, horário já está atualizado. O motorista sempre tem a informação mais recente."*

---

### PARTE 5 — Check-in e Ticket (5 min)

> **Objetivo:** Demonstrar o fluxo de check-in remoto e geração de ticket.

#### CENA 5.1 — Barra de Check-in

> [!IMPORTANT]
> Para que a barra de check-in apareça, o `window_start` precisa estar dentro do horário atual (considerando a tolerância `start_tolerance`). Use o agendamento que você acabou de atualizar para um horário próximo.

1. Mostre que a **barra de check-in** aparece no card do agendamento
2. **Fala:** *"Quando está na hora do agendamento, aparece automaticamente a opção de check-in. O motorista pode fazer o check-in remotamente, direto do celular, sem precisar ir até a portaria."*

#### CENA 5.2 — Fazer Check-in

1. Toque no botão de **Check-in**
2. O app envia a solicitação ao servidor via WebSocket
3. O terminal (simulado) responde e gera o ticket
4. **Fala:** *"O check-in acontece via comunicação em tempo real com o terminal. O terminal confirma, libera a entrada e gera o ticket digital."*

> [!NOTE]
> Para simular o check-in completo, o terminal precisa estar conectado via Socket.IO (namespace `/checkin`). Em demonstração local sem o terminal conectado, o check-in retornará "Terminal offline". Se necessário, simule o ticket manualmente via API:

```bash
curl -X POST "http://localhost:5000/api/v1/tickets" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY_DO_TERMINAL>" \
  -d '{
    "appointment_ref": "APPT-2026-0001",
    "layout_ref": "ticket_padrao",
    "content": {
      "numero_ticket": "TKT-2026-00381",
      "hora_entrada": "10/08/2026 15:47",
      "validade_ticket": "10/08/2026 23:59",
      "operador": "Marcos Oliveira (Matrícula #4402)",
      "gate_entrada": "Gate 02 — Norte",
      "doca": "Doca 04 / Berço 3",
      "balanca": "Balança B-01",
      "autorizacao": "LIBERADO",
      "produto": "Soja em Grão",
      "nota_fiscal": "NF-2026-004871",
      "num_cte": "CT-e 35260812345678000199550010000048711",
      "destino_interno": "Berço 3 — Ala Norte",
      "peso_solicitado": "42.500 kg",
      "balanca_entrada": "42.580 kg",
      "peso_tara": "15.200 kg",
      "lacre_seguranca": "LAC-889244",
      "nome_motorista": "Carlos Silva",
      "cpf_motorista": "123.456.789-01",
      "cnh_motorista": "04567891234",
      "placa": "ABC1D23",
      "placa_carreta": "XYZ9E87",
      "transportadora": "TransLog Frete S.A.",
      "observacoes_gate": "Atenção: Balança B-01 liberada. Velocidade máxima no pátio é 20 km/h. Vistoria de lacre ok."
    }
  }'
```

#### CENA 5.3 — Mostrar Barra de Ticket

1. Após o check-in (ou criação manual do ticket), mostre que a **barra de ticket** aparece
2. **Fala:** *"O ticket digital substituiu o papel. O motorista tem todos os dados na palma da mão."*

#### CENA 5.4 — Abrir o Ticket

1. Toque no ticket para abrir o modal de detalhes
2. Mostre os elementos renderizados: Tags de liberação/vistoria, Grid de destaques (Gate 02, Doca 04, Balança B-01, Status LIBERADO), Identificação do Ticket, Dados da Operação e Carga (Produto, NFs, Pesagens de Entrada/Tara, Lacres), Dados do Motorista/Veículo, Bloco de Atenção da Guarita e Instruções de Segurança.
3. **Fala:** *"Tudo renderizado dinamicamente pelo layout que a empresa configurou. Cada terminal pode ter seu próprio formato de ticket com múltiplos campos e avisos."*

---

### PARTE 6 — Configurações do Perfil (2 min)

> **Objetivo:** Mostrar que o motorista pode manter seus dados atualizados.

**Fala:** *"O motorista pode atualizar seus dados pessoais a qualquer momento. Isso é importante porque os terminais podem exigir informações de contato atualizadas."*

1. Vá em **Perfil / Configurações**
2. Mostre as opções disponíveis:
   - **Atualizar número de telefone** → Envia novo OTP para validar
   - **Atualizar e-mail** → Envia código de verificação por e-mail
   - **Alterar senha**
3. **Fala:** *"Cada alteração passa por verificação. O terminal ou transportadora pode exigir e-mail atualizado, por exemplo, para enviar documentos fiscais."*

---

### PARTE 7 — Announcements Ao Vivo (3 min)

> **Objetivo:** Mostrar a criação de um announcement em tempo real.

**Fala:** *"Agora vou criar um aviso novo e mostrar que ele aparece instantaneamente para o motorista."*

#### CENA 7.1 — Criar o 3º Announcement ao Vivo

> [!TIP]
> Use uma imagem gerada por IA (ex: banner com fundo de terminal portuário e texto "Vacinação Obrigatória").

```bash
curl -X POST "http://localhost:5000/api/web/announcements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_WEB_TERMINAL>" \
  -d '{
    "title": "Campanha de Vacinação",
    "subtitle": "Vacinação contra gripe disponível na enfermaria",
    "description": "Todos os motoristas que entrarem no terminal entre 10/08 e 20/08 podem se vacinar gratuitamente na enfermaria do prédio administrativo.",
    "image_url": "<URL_DA_IMAGEM_IA_3>",
    "image_position": { "x": 50, "y": 35 },
    "is_active": true
  }'
```

#### CENA 7.2 — Mostrar no App

1. Abra o app (ou faça pull-to-refresh)
2. Mostre o novo announcement aparecendo na lista
3. **Fala:** *"Pronto, o aviso já está visível para todos os motoristas que estão próximos ou que tenham agendamentos neste terminal. Cada empresa pode publicar até 3 avisos simultâneos."*

---

### FECHAMENTO (2 min)

**Fala sugerida:**

> *"Resumindo o que vimos:*
>
> 1. *O motorista se cadastra com segurança — validação de CPF, OTP por SMS, CNH cruzada com dados do terminal.*
> 2. *O terminal/transportadora envia agendamentos e viagens via API REST padrão — integra direto com o ERP.*
> 3. *O motorista recebe tudo no celular: agendamentos, viagens, notificações push, tickets digitais.*
> 4. *O check-in pode ser feito remotamente — sem fila na portaria.*
> 5. *Tudo é personalizável via layouts — cada empresa define como os dados aparecem no app.*
> 6. *Avisos e comunicados chegam automaticamente — sem precisar de grupo de WhatsApp.*
>
> *Esse é o GateIn."*

---

## 📐 Orientações para Montar os Layouts

### O que é um Layout?

Um layout é um objeto JSON que define como os campos e dados são exibidos nos cards e nos modais de detalhes do aplicativo. Existem 3 tipos:
- **Appointment Layout** → Card e modal de detalhes de agendamentos (pertence ao Terminal)
- **Trip Layout** → Card e modal de detalhes de viagens (pertence à Transportadora)
- **Ticket Layout** → Ticket digital emitido no check-in (pertence ao Terminal)

> [!IMPORTANT]
> Para agendamentos e viagens, o body da API e o editor JSON possuem `ref`, `title`, `card_layout` e `modal_layout` diretamente no topo do objeto. Para tickets, o body da API e o editor JSON possuem `ref`, `title` e `layout` (array de elementos) diretamente no topo.

---

### Appointment Layout e Trip Layout — Estrutura de `layout`

Ambos usam o mesmo schema: `card_layout` (define o card da lista) + `modal_layout` (define o modal de detalhes).

```json
{
  "card_layout": {
    "header": {
      "field": "summary",
      "label": "Operação"
    },
    "sub_header": {
      "label": "Veículo",
      "field": "license_plate"
    },
    "body_rows": [
      { "label": "Transportadora", "field": "transportadora" },
      { "label": "Produto", "field": "produto" },
      { "label": "Nota Fiscal", "field": "nota_fiscal" },
      { "label": "Berço / Doca", "field": "berco" }
    ]
  },
  "modal_layout": [
    {
      "element": "section",
      "title": "Detalhes da Operação",
      "fields": [
        { "label": "Nota Fiscal", "field": "nota_fiscal" },
        { "label": "CT-e", "field": "num_cte" },
        { "label": "Produto", "field": "produto" },
        { "label": "Tipo de Operação", "field": "tipo_operacao" },
        { "label": "Peso (ton)", "field": "peso_ton" },
        { "label": "Navio", "field": "navio" },
        { "label": "Berço / Destino", "field": "berco" },
        { "label": "Lacre de Segurança", "field": "lacre" }
      ]
    },
    {
      "element": "section",
      "title": "Veículo e Motorista",
      "fields": [
        { "label": "Motorista", "field": "nome_motorista" },
        { "label": "CPF Motorista", "field": "cpf_motorista" },
        { "label": "CNH Motorista", "field": "cnh_motorista" },
        { "label": "Telefone / Celular", "field": "celular_motorista" },
        { "label": "Transportadora", "field": "transportadora" },
        { "label": "Placa Cavalo", "field": "license_plate" },
        { "label": "Placa Carreta", "field": "placa_carreta" }
      ]
    },
    {
      "element": "section",
      "title": "Controle e Logística",
      "fields": [
        { "label": "Prioridade da Carga", "field": "nivel_prioridade" },
        { "label": "Tolerância Janela", "field": "janela_tolerancia" }
      ]
    },
    {
      "element": "field",
      "label": "Observações do Terminal",
      "field": "observacoes"
    },
    {
      "element": "qrcode",
      "title": "Código do Agendamento",
      "field": "ref",
      "caption": "Apresente o QR Code na guarita de acesso"
    }
  ]
}
```

| Propriedade | Descrição |
|---|---|
| `card_layout.header.field` | Campo a exibir como título principal do card |
| `card_layout.sub_header.field` | Campo a exibir como subtítulo (ex: placa) |
| `card_layout.body_rows` | Array de linhas de resumo no card (`label` + `field`) |
| `modal_layout` | Array de elementos do modal: `section`, `field`, `alert`, `qrcode` |

---

### Ticket Layout — Estrutura de `layout`

O ticket usa `layout` como um array de elementos/componentes renderizados no corpo do ticket. O cabeçalho e subcabeçalho do ticket são herdados automaticamente do appointment vinculado.

```json
{
  "layout": [
    {
      "element": "tag_container",
      "label": "Status da Liberação",
      "tags": [
        { "label": "Liberado", "color": "green", "icon": "check-circle-outline" },
        { "label": "Balança Obrigatória", "color": "orange", "icon": "scale" },
        { "label": "Vistoria Concluída", "color": "blue", "icon": "shield-check-outline" }
      ]
    },
    {
      "element": "highlight_grid",
      "label": "Dados de Acesso Rápido",
      "items": [
        { "label": "Gate", "useField": true, "field": "gate_entrada", "color": "green", "caption": "Entrada autorizada" },
        { "label": "Doca", "useField": true, "field": "doca", "color": "blue", "caption": "Destino interno" },
        { "label": "Balança", "useField": true, "field": "balanca", "color": "orange", "caption": "Pesagem 01" },
        { "label": "Status", "useField": true, "field": "autorizacao", "color": "green", "caption": "Acesso Liberado" }
      ]
    },
    {
      "element": "section",
      "title": "Identificação do Ticket"
    },
    { "element": "field", "label": "Nº Ticket", "field": "numero_ticket" },
    { "element": "field", "label": "Data / Hora Entrada", "field": "hora_entrada" },
    { "element": "field", "label": "Validade do Ticket", "field": "validade_ticket" },
    { "element": "field", "label": "Operador Responsável", "field": "operador" },
    {
      "element": "section",
      "title": "Dados da Operação e Carga"
    },
    { "element": "field", "label": "Produto", "field": "produto" },
    { "element": "field", "label": "Nota Fiscal", "field": "nota_fiscal" },
    { "element": "field", "label": "CT-e", "field": "num_cte" },
    { "element": "field", "label": "Destino Interno", "field": "destino_interno" },
    { "element": "field", "label": "Peso Programado", "field": "peso_solicitado" },
    { "element": "field", "label": "Peso Entrada (kg)", "field": "balanca_entrada" },
    { "element": "field", "label": "Peso Tara (kg)", "field": "peso_tara" },
    { "element": "field", "label": "Lacre de Segurança", "field": "lacre_seguranca" },
    {
      "element": "section",
      "title": "Veículo e Transportador"
    },
    { "element": "field", "label": "Motorista", "field": "nome_motorista" },
    { "element": "field", "label": "CPF Motorista", "field": "cpf_motorista" },
    { "element": "field", "label": "CNH Motorista", "field": "cnh_motorista" },
    { "element": "field", "label": "Placa Cavalo", "field": "placa" },
    { "element": "field", "label": "Placa Carreta", "field": "placa_carreta" },
    { "element": "field", "label": "Transportadora", "field": "transportadora" },
    {
      "element": "attention",
      "title": "Instruções da Portaria e Pátio",
      "useField": true,
      "field": "observacoes_gate",
      "color": "orange",
      "icon": "alert-circle-outline"
    },
    {
      "element": "instruction",
      "title": "INSTRUÇÕES DE ACESSO E NORMAS INTERNAS",
      "steps": [
        "Dirija-se ao gate e balança indicados acima no painel.",
        "Apresente este ticket digital ao operador ou no leitor ótico da balança.",
        "Uso obrigatório de EPI (capacete, colete refletivo e calçado fechado).",
        "Respeite o limite máximo de velocidade de 20 km/h dentro do terminal.",
        "Aguarde a liberação da cancela e o direcionamento para a doca de descarga."
      ]
    }
  ]
}
```

| Elemento (`element`) | Descrição |
|---|---|
| `field` | Linha simples com label e valor de campo |
| `section` | Separador visual com título de seção |
| `tag_container` | Conjunto de tags coloridas (ex: status, flags) |
| `highlight_grid` | Grid de destaques com cor, campo e legenda |
| `attention` | Bloco de atenção/aviso com ícone e cor |
| `instruction` | Lista numerada de instruções ao motorista |
| `divider` | Linha divisória simples |
| `text` | Texto estático ou de campo |

### Dicas para Layouts Profissionais

1. **Appointment/Trip — `header.field`**: Use `summary` como campo do header para exibir a descrição principal da operação no topo do card.
2. **Mapeamento de Dados**: A propriedade `field` mapeia tanto os campos diretos do registro (`summary`, `license_plate`, `ref`) quanto as chaves do objeto `custom_data`.
3. **Padronize os campos**: Use snake_case (ex: `nome_motorista`, `nota_fiscal`, `gate_entrada`) e certifique-se que as mesmas chaves existem no `custom_data` dos agendamentos/viagens/tickets enviados via API.
4. **Ticket — Cabeçalho Herdado**: O cabeçalho do ticket (header e subheader) é preenchido automaticamente pelo appointment vinculado, herdando as configurações do layout do agendamento.
5. **Layouts são por empresa**: Cada terminal e transportadora pode configurar layouts específicos para suas operações.

---

## ⏱️ Checklist Final Antes da Apresentação

- [ ] Servidor rodando (`python main.py` ou `uvicorn main:app`)
- [ ] Redis rodando
- [ ] PostgreSQL rodando com banco `gatein_db`
- [ ] Terminal e Transportadora criados com API Keys
- [ ] Layouts criados (appointment, ticket, trip) com `card_layout` e `modal_layout`
- [ ] 2 Announcements criados com imagens IA
- [ ] Motorista de teste limpo (sem conta anterior)
- [ ] Driver com CPF `12345678901` existe na tabela `drivers`
- [ ] Celular/emulador com o app instalado
- [ ] Postman com as collections prontas
- [ ] 3ª imagem de announcement pronta para usar ao vivo
- [ ] Horários dos cURLs ajustados para o dia da apresentação
