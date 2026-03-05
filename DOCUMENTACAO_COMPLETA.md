# Documentação Completa - Assessoria Somma Club

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Tecnologias e Dependências](#tecnologias-e-dependências)
5. [Configuração e Instalação](#configuração-e-instalação)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [Componentes Principais](#componentes-principais)
8. [APIs e Rotas](#apis-e-rotas)
9. [Fluxo de Pagamento](#fluxo-de-pagamento)
10. [Banco de Dados](#banco-de-dados)
11. [Validações](#validações)
12. [Guias de Desenvolvimento](#guias-de-desenvolvimento)

---

## Visão Geral

**Assessoria Somma Club** é uma plataforma de e-learning especializada em treinamento personalizado para corredores. Oferece acompanhamento profissional, planejamento individualizado e integração com pagamentos via Asaas.

### Principais Funcionalidades
- Landing page com apresentação de serviços
- Formulário de inscrição para waitlist
- Sistema de checkout com pagamento por cartão de crédito
- Integração com Asaas para processamento de pagamentos
- FAQ interativa
- Formulário de inscrição/avaliação inicial
- Dashboard com estatísticas de pagamentos
- Política de cookies

### Stack Tecnológico
- **Frontend**: Next.js 16 + React 19.2 + TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Payment**: Asaas API
- **Smooth Scrolling**: Lenis
- **Forms**: React Hook Form + Zod
- **Analytics**: Vercel Analytics

---

## Arquitetura do Sistema

### Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  Pages: /, /politica-de-cookies, /dashboard             │
│  Components: Navbar, Hero, Pricing, Checkout            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   API Routes (Next.js)                   │
│  /api/asaas/* (Customer, Subscription, PIX, Stats)      │
│  /api/checkout/validate-coupon                          │
│  /api/cookies/consent                                   │
│  /api/sheets (Google Sheets)                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│         Integrações Externas                            │
│  • Asaas API (Pagamentos)                               │
│  • Supabase (Database)                                  │
│  • Google Sheets API                                    │
│  • BrasilAPI (CEP)                                      │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Usuário acessa site** → Landing page (/)
2. **Preenche formulário** → Inscrição na waitlist
3. **Clica em "Assinar"** → Checkout modal abre
4. **Preenche dados** → Validações locais
5. **Submete pagamento** → API Asaas processa
6. **Sucesso/Erro** → Modal de confirmação
7. **Dados salvos** → Supabase + Google Sheets

---

## Estrutura de Pastas

```
somma-running-club/
├── app/
│   ├── api/
│   │   ├── asaas/
│   │   │   ├── customer/route.ts          # Criar cliente no Asaas
│   │   │   ├── pix/route.ts              # Gerar QR Code PIX
│   │   │   ├── statistics/route.ts       # Obter estatísticas
│   │   │   ├── subscription/route.ts     # Processar pagamento
│   │   │   └── test/route.ts             # Teste de conexão
│   │   ├── checkout/
│   │   │   └── validate-coupon/route.ts  # Validar cupom de desconto
│   │   ├── cookies/
│   │   │   └── consent/route.ts          # Salvar consentimento de cookies
│   │   └── sheets/route.ts                # Enviar dados para Google Sheets
│   ├── dashboard/
│   │   └── page.tsx                       # Dashboard com estatísticas
│   ├── politica-de-cookies/
│   │   └── page.tsx                       # Página de política de cookies
│   ├── layout.tsx                         # Layout raiz
│   ├── page.tsx                           # Página inicial
│   └── globals.css                        # Estilos globais
├── components/
│   ├── ui/                                # Componentes shadcn/ui (50+)
│   ├── checkout-modal.tsx                 # Modal de checkout
│   ├── cookie-banner.tsx                  # Banner de cookies
│   ├── faq-section.tsx                    # Seção de FAQ
│   ├── footer.tsx                         # Rodapé
│   ├── navbar.tsx                         # Barra de navegação
│   ├── pricing-plans.tsx                  # Exibição de planos
│   ├── pricing-carousel.tsx               # Carousel de preços
│   ├── subscription-form.tsx              # Formulário de inscrição
│   ├── success-modal.tsx                  # Modal de sucesso
│   ├── tools-dropdown.tsx                 # Dropdown de ferramentas
│   ├── resources-dropdown.tsx             # Dropdown de recursos
│   ├── theme-provider.tsx                 # Provedor de tema
│   ├── lenis-provider.tsx                 # Provedor Lenis (smooth scroll)
│   ├── mobile-menu.tsx                    # Menu mobile
│   └── password-protection-modal.tsx      # Modal de proteção por senha
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # Cliente Supabase (client-side)
│   │   └── server.ts                      # Cliente Supabase (server-side)
│   ├── validators.ts                      # Funções de validação
│   └── utils.ts                           # Utilitários (cn function)
├── public/
│   ├── apple-icon.png                     # ícone Apple
│   ├── icon.svg                           # Ícone do site
│   ├── icon-dark-32x32.png               # Ícone escuro 32px
│   ├── icon-light-32x32.png              # Ícone claro 32px
│   ├── placeholder-logo.png               # Logo placeholder
│   ├── placeholder-logo.svg               # Logo placeholder SVG
│   ├── placeholder-user.jpg               # Placeholder de usuário
│   ├── placeholder.jpg                    # Placeholder genérico
│   ├── placeholder.svg                    # Placeholder genérico SVG
│   ├── webrenew-brandmark.png             # Marca Webrenew
│   └── partners/
│       └── dopahmina.png                  # Logo parceiro Dopamina
├── scripts/
│   ├── 001_create_cookie_consents.sql     # Criar tabela de consents
│   ├── 002_create_atleta_somma.sql        # Criar tabela de atletas
│   └── 003_test_gestao_clientes.sql       # Script de teste
├── styles/
│   └── globals.css                        # Estilos globais (deprecated, use app/globals.css)
├── hooks/
│   ├── use-mobile.tsx                     # Hook para detectar mobile
│   └── use-toast.ts                       # Hook para toast notifications
├── next.config.mjs                        # Configuração Next.js
├── tailwind.config.js                     # Configuração Tailwind CSS
├── tsconfig.json                          # Configuração TypeScript
├── package.json                           # Dependências do projeto
├── postcss.config.mjs                     # Configuração PostCSS
├── components.json                        # Configuração shadcn/ui
├── .gitignore                             # Arquivos ignorados pelo Git
└── README.md                              # Documentação do projeto
```

---

## Tecnologias e Dependências

### Dependências Principais

| Pacote | Versão | Propósito |
|--------|--------|----------|
| next | 16.0.10 | Framework React full-stack |
| react | 19.2.0 | Biblioteca de UI |
| tailwindcss | 4.1.9 | Framework CSS |
| typescript | ^5 | Type safety |
| @supabase/supabase-js | latest | Client database |
| @hookform/resolvers | 3.10.0 | Resolvedores para formulários |
| react-hook-form | 7.60.0 | Gerenciamento de formulários |
| zod | 3.25.76 | Validação de esquemas |
| lucide-react | 0.454.0 | Ícones SVG |
| @radix-ui/* | varies | Primitivos de UI acessíveis |
| recharts | 2.15.4 | Gráficos |
| lenis | 1.1.17 | Smooth scrolling |
| sonner | 1.7.4 | Toast notifications |
| next-themes | 0.4.6 | Gerenciamento de temas |
| clsx/tailwind-merge | varies | Merge de classes CSS |

### Dependências de Desenvolvimento

- @tailwindcss/postcss 4.1.9
- @types/node, react, react-dom
- typescript 5

---

## Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta Asaas
- (Opcional) API Key Google Sheets

### Passo 1: Clonar o Repositório

```bash
git clone <repo-url>
cd somma-running-club
```

### Passo 2: Instalar Dependências

```bash
npm install
# ou
yarn install
```

### Passo 3: Configurar Variáveis de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Asaas (Payment)
ASAAS_API_KEY=your_asaas_api_key_here

# Google Sheets (Opcional)
GOOGLE_SHEETS_API_KEY=your_google_sheets_key_here
GOOGLE_SHEETS_ID=your_sheet_id_here

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id_here
```

### Passo 4: Executar Migrations do Banco de Dados

```bash
# Acessar Supabase Dashboard
# SQL Editor → Copiar e executar scripts em scripts/

# 1. Criar tabela de cookie consents
# 2. Criar tabela de atletas (se necessário)
```

### Passo 5: Iniciar Servidor de Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

Acesse: `http://localhost:3000`

### Build para Produção

```bash
npm run build
npm start
```

---

## Variáveis de Ambiente

### Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase | `https://abc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima Supabase | `eyJhbGc...` |
| `ASAAS_API_KEY` | Chave da API Asaas | `$aact_...` |

### Variáveis Opcionais

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de service role (server-side only) |
| `GOOGLE_SHEETS_API_KEY` | Para integração com Google Sheets |
| `GOOGLE_SHEETS_ID` | ID da planilha Google Sheets |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | Para analytics do Vercel |

### Onde Encontrar as Chaves

**Supabase:**
1. Dashboard → Settings → API
2. Copiar `Project URL` e `Anon public key`

**Asaas:**
1. Dashboard → Configurações → API
2. Gerar/Copiar API Key

**Google Sheets:**
1. Google Cloud Console → Criar projeto
2. Habilitar Google Sheets API
3. Criar credencial de Service Account

---

## Componentes Principais

### 1. **Navbar** (`components/navbar.tsx`)
Barra de navegação superior com:
- Logo
- Menu de recursos (Resources Dropdown)
- Menu de ferramentas (Tools Dropdown)
- Botão de contato WhatsApp
- Menu mobile responsivo

**Props:** Nenhuma (componente standalone)

**Estado:** Detecta scroll para aplicar efeitos visuais

### 2. **Checkout Modal** (`components/checkout-modal.tsx`)
Modal de checkout completo com múltiplos passos:

**Passos:**
1. `customer` - Dados pessoais e endereço
2. `payment` - Dados de cartão de crédito
3. `processing` - Processando pagamento
4. `success` - Pagamento confirmado
5. `error` - Erro no pagamento

**Props:**
```typescript
interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    name: string
    period: string
    price: number
    totalPrice: number
    installments: number
    cycle: "MONTHLY"
  }
}
```

**Validações Implementadas:**
- CPF (11 dígitos, sem repetição)
- Email (formato válido)
- Telefone (números)
- CEP (8 dígitos, busca automática de endereço)
- Número de cartão (algoritmo de Luhn)
- Data de expiração (MM/YY)
- CVV (3-4 dígitos)

### 3. **Subscription Form** (`components/subscription-form.tsx`)
Formulário inicial de inscrição na waitlist:
- Email
- WhatsApp
- Frequência de corrida
- Meta de corrida

**Integração:** Envia dados para Google Sheets

### 4. **Pricing Plans** (`components/pricing-plans.tsx`)
Exibição de planos de preço:
- Somma Membership (acesso básico)
- Somma Assessoria (treinamento personalizado)
- Opções: Mensal, Semestral, Anual
- Sistema de cupons de desconto
- Comparação de features

### 5. **FAQ Section** (`components/faq-section.tsx`)
Seção com perguntas frequentes usando `@radix-ui/accordion`:
- Perguntas sobre planos, acesso, cancelamento
- Expansível/colapsável
- Design responsivo

### 6. **Cookie Banner** (`components/cookie-banner.tsx`)
Banner de consentimento de cookies:
- Botões: Aceitar/Rejeitar
- Link para política de cookies
- Salva consentimento no Supabase

### 7. **Footer** (`components/footer.tsx`)
Rodapé com:
- Links rápidos
- Informações de contato
- Redes sociais
- Copyrights

---

## APIs e Rotas

### Asaas Payment Integration

#### 1. **POST /api/asaas/customer**
Cria um novo cliente no Asaas

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "cpfCnpj": "12345678901",
  "phone": "11999999999",
  "postalCode": "01310100",
  "addressNumber": "123"
}
```

**Response:**
```json
{
  "id": "cus_12345",
  "name": "João Silva",
  "email": "joao@example.com"
}
```

**Erros:**
- 400: Dados obrigatórios faltando
- 401: Chave de API inválida
- 500: Erro interno

#### 2. **POST /api/asaas/subscription**
Processa pagamento e cria assinatura

**Request:**
```json
{
  "customerId": "cus_12345",
  "billingType": "CREDIT_CARD",
  "value": 197.00,
  "cycle": "MONTHLY",
  "maxPayments": 6,
  "description": "Somma Assessoria - Semestral",
  "creditCard": {
    "holderName": "JOAO SILVA",
    "number": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "ccv": "123"
  },
  "creditCardHolderInfo": {
    "name": "João Silva",
    "email": "joao@example.com",
    "cpfCnpj": "12345678901",
    "postalCode": "01310100",
    "addressNumber": "123",
    "phone": "11999999999"
  },
  "remoteIp": "127.0.0.1"
}
```

**Response (Sucesso):**
```json
{
  "id": "pay_12345",
  "status": "PENDING",
  "value": 197.00,
  "dueDate": "2026-01-01"
}
```

**Erros:**
- 400: Dados de cartão inválidos
- 401: Cliente não encontrado
- 500: Erro de processamento

#### 3. **GET /api/asaas/pix**
Gera QR Code PIX para pagamento

**Query Params:**
- `paymentId` (obrigatório): ID do pagamento

**Response:**
```json
{
  "qrCode": "00020126...",
  "payload": "..."
}
```

#### 4. **GET /api/asaas/statistics**
Obtém estatísticas de pagamentos

**Response:**
```json
{
  "totalReceived": 5000.00,
  "totalPending": 1500.00,
  "totalFailed": 200.00,
  "transactionCount": 25
}
```

### Checkout APIs

#### **POST /api/checkout/validate-coupon**
Valida cupom de desconto

**Request:**
```json
{
  "couponCode": "DESCONTO10",
  "planValue": 197.00
}
```

**Response:**
```json
{
  "valid": true,
  "discount": 0.10,
  "discountedValue": 177.30
}
```

### Cookies APIs

#### **POST /api/cookies/consent**
Salva consentimento do usuário

**Request:**
```json
{
  "analytics": true,
  "marketing": false,
  "necessary": true
}
```

### Google Sheets APIs

#### **POST /api/sheets**
Envia dados para Google Sheets

**Request:**
```json
{
  "email": "joao@example.com",
  "whatsapp": "11999999999",
  "runningFrequency": "3-5 vezes/semana",
  "goal": "Preparar para maratona"
}
```

---

## Fluxo de Pagamento

### Fluxo Completo

```
1. Usuário abre site
   ↓
2. Clica em "Assinar Agora"
   ↓
3. Checkout Modal abre (Step: customer)
   ├─ Preenche dados pessoais
   ├─ Busca CEP automaticamente
   ├─ Valida todos os campos
   └─ Clica "Continuar para pagamento"
   ↓
4. Submete dados ao /api/asaas/customer
   ├─ Cria cliente no Asaas
   └─ Retorna customerId
   ↓
5. Step muda para "payment"
   ├─ Usuário preenche cartão de crédito
   ├─ Valida cartão (Luhn)
   └─ Clica "Confirmar pagamento"
   ↓
6. Step muda para "processing"
   ├─ Chamada para /api/asaas/subscription
   ├─ Asaas processa pagamento
   └─ Retorna resultado
   ↓
7. Se sucesso:
   ├─ Step muda para "success"
   ├─ Modal de confirmação aparece
   └─ Email de confirmação enviado
   ↓
8. Se erro:
   ├─ Step muda para "error"
   ├─ Mostra mensagem de erro
   └─ Oferece opções: Tentar novamente, Voltar, Fechar
```

### Estados do Modal

| Estado | Descrição |
|--------|-----------|
| `customer` | Coleta dados pessoais |
| `payment` | Coleta dados de pagamento |
| `processing` | Aguardando resposta de pagamento |
| `success` | Pagamento confirmado |
| `error` | Erro no processamento |

### Fluxo de Validação (Cliente)

```
Preenche formulário
   ↓
Clica "Continuar"
   ↓
├─ Valida nome (3+ caracteres)
├─ Valida email (formato válido)
├─ Valida CPF (11 dígitos, sem repetição)
├─ Valida telefone (formato)
├─ Valida CEP (8 dígitos)
└─ Valida endereço (número obrigatório)
   ↓
Se alguma validação falha → Mostra erro específico
Se todas passam → Submete ao servidor
```

---

## Banco de Dados

### Supabase (PostgreSQL)

#### Tabelas

##### 1. **public.cookie_consents**
Armazena consentimento de cookies do usuário

```sql
CREATE TABLE public.cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET,
  analytics BOOLEAN DEFAULT FALSE,
  marketing BOOLEAN DEFAULT FALSE,
  necessary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| ip_address | INET | IP do usuário |
| analytics | BOOLEAN | Consentimento para analytics |
| marketing | BOOLEAN | Consentimento para marketing |
| necessary | BOOLEAN | Cookies necessários |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

##### 2. **public.gestao-clientes-assessoria**
Tabela de clientes da assessoria (integrada com dados externos)

```sql
CREATE TABLE public."gestao-clientes-assessoria" (
  id UUID PRIMARY KEY,
  cpf VARCHAR(14) UNIQUE,
  nome VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(15),
  status_assinatura VARCHAR(50),
  plano_assinatura VARCHAR(100),
  data_inicio DATE,
  data_fim DATE,
  valor_assinatura DECIMAL(10, 2)
);
```

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| cpf | VARCHAR(14) | CPF do cliente |
| nome | VARCHAR(255) | Nome completo |
| email | VARCHAR(255) | Email |
| telefone | VARCHAR(15) | Telefone |
| status_assinatura | VARCHAR(50) | ATIVO/INATIVO/CANCELADO |
| plano_assinatura | VARCHAR(100) | Plano contratado |
| data_inicio | DATE | Data de início |
| data_fim | DATE | Data de término |
| valor_assinatura | DECIMAL(10,2) | Valor pago |

#### Row Level Security (RLS)

RLS desabilitado para permitir acesso público às tabelas.

#### Backups Automáticos

Supabase realiza backups automáticos diários.

#### Integração com Google Sheets

Dados de inscrição também são salvos em Google Sheets via API:

```
Google Sheets ID: [configurável em .env]
Coluna A: Email
Coluna B: WhatsApp
Coluna C: Frequência de corrida
Coluna D: Meta
Coluna E: Data de inscrição
```

---

## Validações

### Validações Implementadas (`lib/validators.ts`)

#### 1. **CPF**
```javascript
validators.cpf(cpf: string) → {valid: boolean, message: string}
```
- 11 dígitos obrigatório
- Rejeita CPFs com todos os dígitos iguais
- Remove formatação automaticamente

**Exemplos:**
- ✅ "123.456.789-10"
- ❌ "111.111.111-11"
- ❌ "123"

#### 2. **Email**
```javascript
validators.email(email: string) → {valid: boolean, message: string}
```
- Valida formato básico RFC 5322
- Requer @ e domínio

**Exemplos:**
- ✅ "joao@example.com"
- ❌ "joao@"
- ❌ "joao"

#### 3. **Número de Cartão**
```javascript
validators.cardNumber(number: string) → {valid: boolean, message: string}
```
- 13-19 dígitos
- Algoritmo de Luhn (detecta cartões inválidos)

**Exemplos:**
- ✅ "4111 1111 1111 1111"
- ❌ "1234 5678 9012 3456"

#### 4. **CVV**
```javascript
validators.cardCvv(cvv: string) → {valid: boolean, message: string}
```
- 3-4 dígitos (American Express: 4, outros: 3)

**Exemplos:**
- ✅ "123"
- ✅ "1234" (Amex)
- ❌ "12"

#### 5. **Data de Expiração**
```javascript
validators.cardExpiry(month: string, year: string) → {valid: boolean, message: string}
```
- Mês: 01-12
- Ano: não expirado
- Verifica se já passou

**Exemplos:**
- ✅ "12" / "2025"
- ❌ "13" / "2025"
- ❌ "01" / "2020" (expirado)

#### 6. **CEP**
```javascript
validators.cep(cep: string) → {valid: boolean, message: string}
```
- 8 dígitos
- Remove formatação automaticamente

**Exemplos:**
- ✅ "01310-100"
- ✅ "01310100"
- ❌ "0131010"

#### 7. **Telefone**
```javascript
validators.phone(phone: string) → {valid: boolean, message: string}
```
- Mínimo 10 dígitos
- Máximo 11 dígitos (Brasil)

**Exemplos:**
- ✅ "11 9 9999-9999"
- ❌ "999"

#### 8. **Nome**
```javascript
validators.name(name: string) → {valid: boolean, message: string}
```
- Mínimo 3 caracteres
- Máximo 100 caracteres

**Exemplos:**
- ✅ "João Silva"
- ❌ "Jo"

---

## Guias de Desenvolvimento

### Adicionar Nova Página

1. Criar arquivo em `app/[nome]/page.tsx`
2. Usar Client Components conforme necessário
3. Importar componentes do `components/`
4. Adicionar tipos TypeScript

**Exemplo:**
```typescript
// app/novo-recurso/page.tsx
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NoveRecurso() {
  return (
    <main className="bg-black text-white">
      <Navbar />
      {/* Seu conteúdo */}
      <Footer />
    </main>
  )
}
```

### Adicionar Novo Componente

1. Criar arquivo em `components/novo-componente.tsx`
2. Usar `"use client"` se precisar de interatividade
3. Tipar Props com TypeScript
4. Exportar como named export

**Exemplo:**
```typescript
// components/novo-componente.tsx
"use client"

interface NovoBotaoProps {
  texto: string
  onClick: () => void
  variant?: "primary" | "secondary"
}

export function NovoBotao({ texto, onClick, variant = "primary" }: NovoBotaoProps) {
  const classes = variant === "primary" ? "bg-black" : "bg-zinc-700"
  
  return (
    <button 
      onClick={onClick}
      className={`${classes} text-white px-4 py-2 rounded`}
    >
      {texto}
    </button>
  )
}
```

### Adicionar Nova API

1. Criar arquivo em `app/api/[rota]/route.ts`
2. Exportar funções `GET`, `POST`, `PUT`, `DELETE`
3. Validar entrada com `Zod` ou validadores customizados
4. Retornar `NextResponse` com status apropriado

**Exemplo:**
```typescript
// app/api/exemplo/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação
    if (!body.nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }
    
    // Processar
    const resultado = { sucesso: true, dados: body }
    
    return NextResponse.json(resultado, { status: 200 })
  } catch (error) {
    console.error("[v0] Erro:", error)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}
```

### Integrar com Supabase

**Client-Side (Browser):**
```typescript
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Buscar dados
const { data, error } = await supabase
  .from("tabela")
  .select("*")
  .eq("id", "123")
```

**Server-Side (Node.js):**
```typescript
import { createClient } from "@/lib/supabase/server"

const supabase = await createClient()

const { data, error } = await supabase
  .from("tabela")
  .select("*")
```

### Debug com Logs

Use `console.log("[v0] ...")` para debugging:

```typescript
console.log("[v0] Iniciando processa pagamento")
console.log("[v0] Dados recebidos:", body)

try {
  // código
} catch (error) {
  console.error("[v0] Erro na processamento:", error)
}
```

### Testar Pagamento

**Cartões de Teste (Asaas/Stripe):**
- Aprovado: `4111 1111 1111 1111`
- Recusado: `5555 5555 5555 4444`
- CVV qualquer 3 dígitos
- Data qualquer futura

### Build & Deploy

**Local:**
```bash
npm run build    # Compila projeto
npm run start    # Inicia produção
```

**Vercel (Recomendado):**
1. Push para GitHub
2. Conectar repositório no Vercel
3. Configurar variáveis de ambiente
4. Deploy automático

---

## Troubleshooting

### Erro: "Chave de API do ASAAS não configurada"
**Solução:** Adicionar `ASAAS_API_KEY` em `.env.local`

### Erro: "CEP não encontrado"
**Solução:** CEP pode não existir. Verificar com ferramenta de CEP.

### Erro: "Cartão recusado"
**Solução:** Usar cartões de teste fornecidos pela Asaas

### Erro: "Supabase connection refused"
**Solução:** Verificar URL e chaves em `.env.local`, Verificar status do Supabase

### Erro: "CORS error"
**Solução:** Usar Server Actions ou Server Routes para chamar APIs externas

---

## Performance & Otimizações

- **Next.js Image Optimization**: Desabilitado (`unoptimized: true`)
- **Lazy Loading**: Componentes com `dynamic()`
- **Code Splitting**: Automático por Next.js
- **CSS-in-JS**: Tailwind CSS (PostCSS)
- **Smooth Scrolling**: Lenis (thread de scroll separada)
- **Font Loading**: Geist fonts (estratégia `fallback`)

---

## Segurança

- ✅ Validação de entrada em cliente e servidor
- ✅ Algoritmo de Luhn para cartão
- ✅ HTTPS obrigatório em produção
- ✅ Variáveis sensíveis em `.env.local`
- ✅ Service Role Key nunca exposta ao cliente
- ✅ Rate limiting em APIs de pagamento
- ✅ Sanitização de inputs

---

## Suporte e Contato

**Email**: suporte@sommaclub.com.br
**WhatsApp**: +55 61 9 9178-0334
**Website**: https://sommaclub.com.br

---

**Última atualização**: Janeiro 2026
**Versão**: 1.0.0
**Status**: Produção
