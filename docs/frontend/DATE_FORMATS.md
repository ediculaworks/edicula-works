# Padrões de Data e Hora - EdiculaWorks

> Documento de padrões para garantir consistência de datas e horários em todas as camadas.

---

## 1. Visão Geral

Este documento define os padrões de data e hora para todas as camadas da arquitetura:
- Banco de Dados (PostgreSQL/Supabase)
- API (Python/FastAPI)
- Frontend (Next.js/TypeScript)

---

## 2. Padrão Global

### 2.1 Timezone

```
Timezone padrão: America/Sao_Paulo (BRT / UTC-3)
```

**Configuração por camada:**

| Camada | Configuração |
|--------|--------------|
| PostgreSQL | `SET timezone = 'America/Sao_Paulo';` |
| Python | `os.environ['TZ'] = 'America/Sao_Paulo'` |
| Frontend | `Intl.DateTimeFormat().resolvedOptions().timeZone` |

### 2.2 Formato ISO 8601

**Formato de transmissão (JSON API):**
```
YYYY-MM-DDTHH:mm:ss.sssZ
```

Exemplo: `2026-02-19T15:30:00.000Z`

---

## 3. Banco de Dados (PostgreSQL)

### 3.1 Tipos de Coluna

```sql
-- Timestamp com timezone (preferível)
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

-- Data apenas (sem hora)
data_nascimento DATE
data_vencimento DATE
data_inicio DATE
data_fim DATE
```

### 3.2 Conversão no SELECT

```sql
-- Sempre converter para timezone local ao selecionar
SELECT 
    created_at AT TIME ZONE 'America/Sao_Paulo' as created_at,
    data_vencimento
FROM tarefas;

-- Para exibir formato brasileiro
SELECT 
    TO_CHAR(created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as data_formatada,
    TO_CHAR(data_vencimento, 'DD/MM/YYYY') as vencimento
FROM tarefas;
```

### 3.3 Funções Úteis

```sql
-- Data/hora atual no timezone correto
NOW() AT TIME ZONE 'America/Sao_Paulo'

-- Data de hoje
CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo'

-- Converter timestamp para data
DATE(created_at AT TIME ZONE 'America/Sao_Paulo')
```

---

## 4. API (Python/FastAPI)

### 4.1 Biblioteca

```python
from datetime import datetime, timezone, timedelta

# Timezone Brasil
BR_TZ = timezone(timedelta(hours=-3))
```

### 4.2 Funções Helper

```python
from datetime import datetime, timezone, timedelta
from typing import Optional

BR_TZ = timezone(timedelta(hours=-3))


def now_br() -> datetime:
    """Retorna datetime atual no timezone brasileiro."""
    return datetime.now(BR_TZ)


def to_iso(dt: Optional[datetime]) -> Optional[str]:
    """Converte datetime para ISO 8601 string."""
    if dt is None:
        return None
    return dt.isoformat()


def from_iso(dt_str: str) -> datetime:
    """Converte ISO 8601 string para datetime."""
    if dt_str.endswith('Z'):
        dt_str = dt_str[:-1] + '+00:00'
    return datetime.fromisoformat(dt_str)


def parse_date_br(date_str: str) -> datetime:
    """Converte string brasileira para datetime.
    
    Aceita: DD/MM/YYYY, DD/MM/YYYY HH:MM, DD/MM/YYYY HH:MM:SS
    """
    from datetime import timedelta
    
    formats = [
        '%d/%m/%Y',
        '%d/%m/%Y %H:%M',
        '%d/%m/%Y %H:%M:%S',
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.replace(tzinfo=BR_TZ)
        except ValueError:
            continue
    
    raise ValueError(f"Formato de data inválido: {date_str}")


def format_br(dt: datetime) -> str:
    """Formata datetime para padrão brasileiro."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=BR_TZ)
    return dt.strftime('%d/%m/%Y %H:%M:%S')


def format_date_br(dt: datetime) -> str:
    """Formata apenas data para padrão brasileiro."""
    return dt.strftime('%d/%m/%Y')
```

### 4.3 Pydantic Models

```python
from pydantic import field_serializer
from datetime import datetime

class TarefaResponse:
    created_at: datetime
    
    @field_serializer('created_at')
    def serialize_datetime(self, dt: datetime) -> str:
        """Serializa para ISO 8601."""
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
```

### 4.4 Request/Response

```python
# Request - aceita ISO ou brasileiro
class DateFilter:
    data_inicio: Optional[str]  # ISO: 2026-02-19 ou BR: 19/02/2026
    data_fim: Optional[str]

# Response - sempre ISO
{
    "created_at": "2026-02-19T15:30:00.000Z",
    "data_vencimento": "2026-03-15"
}
```

---

## 5. Frontend (Next.js/TypeScript)

### 5.1 Biblioteca

```bash
npm install date-fns@^3.0.0
```

### 5.2 Configuração Global

```typescript
// lib/date-utils.ts
import { 
  format, 
  formatISO, 
  parseISO, 
  toDate,
  isValid,
  addDays,
  addMonths,
  subDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Timezone
export const TIMEZONE = 'America/Sao_Paulo'

// Locale brasileiro
export const locale = ptBR

// Formatos
export const Formats = {
  // Para API (ISO 8601)
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  ISO_DATE: 'yyyy-MM-dd',
  
  // Display brasileiro
  DATETIME_BR: "dd/MM/yyyy 'às' HH:mm:ss",
  DATE_BR: 'dd/MM/yyyy',
  TIME_BR: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
  
  // Display inglês (para campos específicos)
  DATETIME_EN: 'MM/dd/yyyy HH:mm',
  DATE_EN: 'MM/dd/yyyy',
} as const
```

### 5.3 Funções Helper

```typescript
// lib/date-utils.ts
import { format, parseISO, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Formats, TIMEZONE, locale } from './constants'

/**
 * Converte string ISO para objeto Date
 */
export function parseISODate(dateString: string): Date | null {
  if (!dateString) return null
  const date = parseISO(dateString)
  return isValid(date) ? date : null
}

/**
 * Formata data para exibição brasileira
 */
export function formatBR(date: Date | string, formatStr: string = Formats.DATETIME_BR): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!dateObj) return ''
  return format(dateObj, formatStr, { locale })
}

/**
 * Formata data com hora
 */
export function formatDateTime(date: Date | string): string {
  return formatBR(date, Formats.DATETIME_BR)
}

/**
 * Formata apenas data
 */
export function formatDate(date: Date | string): string {
  return formatBR(date, Formats.DATE_BR)
}

/**
 * Formata apenas hora
 */
export function formatTime(date: Date | string): string {
  return formatBR(date, Formats.TIME_BR)
}

/**
 * Converte string brasileira para Date
 */
export function parseBRDate(dateString: string): Date | null {
  const formats = [
    'dd/MM/yyyy',
    'dd/MM/yyyy HH:mm',
    'dd/MM/yyyy HH:mm:ss',
  ]
  
  for (const fmt of formats) {
    try {
      const date = parse(dateString, fmt, new Date())
      if (isValid(date)) return date
    } catch {
      continue
    }
  }
  return null
}

/**
 * Converte para ISO string (para API)
 */
export function toISOString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!dateObj) return ''
  return formatISO(dateObj)
}

/**
 * Retorna data atual
 */
export function now(): Date {
  return new Date()
}

/**
 * Retorna data atual em formato brasileiro
 */
export function nowBR(): string {
  return formatBR(now())
}

/**
 * Diferença em dias
 */
export function diffDays(date1: Date, date2: Date): number {
  return differenceInDays(date1, date2)
}

/**
 * Diferença em horas
 */
export function diffHours(date1: Date, date2: Date): number {
  return differenceInHours(date1, date2)
}

/**
 * Diferença em minutos
 */
export function diffMinutes(date1: Date, date2: Date): number {
  return differenceInMinutes(date1, date2)
}

/**
 * Adiciona dias
 */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days)
}

/**
 * Verifica se está vencido
 */
export function isOverdue(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!dateObj) return false
  return dateObj < new Date()
}

/**
 * Retorna texto relativo (ex: "há 2 horas", "há 3 dias")
 */
export function formatRelative(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!dateObj) return ''
  
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
  
  return formatBR(dateObj, Formats.DATE_BR)
}
```

### 5.4 Uso em Componentes

```tsx
import { formatDate, formatTime, formatRelative, parseBRDate, toISOString } from '@/lib/date-utils'

// Exibir data vinda da API
function TaskCard({ tarefa }: { tarefa: Tarefa }) {
  return (
    <div>
      <span>Criado: {formatDateTime(tarefa.created_at)}</span>
      <span>Atualizado: {formatRelative(tarefa.updated_at)}</span>
      <span>Vencimento: {formatDate(tarefa.prazo)}</span>
    </div>
  )
}

// Input de data
function DateInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  // O input envia ISO para a API
  return (
    <input 
      type="date" 
      value={value ? value.split('T')[0] : ''}
      onChange={(e) => onChange(toISOString(new Date(e.target.value)))}
    />
  )
}

// Receber input brasileiro e converter
function handleSubmit(formData: { data: string }) {
  const date = parseBRDate(formData.data)  // "19/02/2026" → Date
  const iso = toISOString(date)            // → "2026-02-19T00:00:00.000Z"
  await api.save({ data: iso })
}
```

---

## 6. Tabela de Referência Rápida

| Camada | Tipo | Formato Input | Formato Output |
|--------|------|--------------|----------------|
| PostgreSQL | `TIMESTAMP TZ` | - | `2026-02-19 15:30:00-03` |
| PostgreSQL | `DATE` | - | `2026-02-19` |
| Python | `datetime` | ISO/BR | ISO |
| JSON API | `string` | - | ISO 8601 |
| TypeScript | `Date` | - | ISO 8601 |
| Frontend Display | `string` | - | BR (`dd/MM/yyyy`) |

---

## 7. Casos Especiais

### 7.1 Datas de Competência (Financeiro)

```python
# Financeiro: data de competência pode ser diferente da transação
class TransacaoCreate:
    data_transacao: date      # Quando foi pago/recebido
    data_competencia: date    # Mês/ano de registro contábil
```

### 7.2 Prazos com Horário

```python
# Tarefas com prazo específico (não apenas data)
class TarefaCreate:
    prazo_data: date
    prazo_hora: Optional[time]  # 23:59:59
```

### 7.3 Timestamps de Auditoria

```python
# Sempre usar UTC para logs de auditoria
audit_log = {
    "timestamp": datetime.now(timezone.utc).isoformat(),  # UTC
    "user_id": 1,
    "action": "created"
}
```

---

## 8. Testes

### 8.1 Teste de Compatibilidade

```python
# test_date_compatibility.py
import pytest
from datetime import datetime, timezone, timedelta
from lib.date_utils import to_iso, from_iso, format_br

def test_datetime_roundtrip():
    dt = datetime(2026, 2, 19, 15, 30, 0, tzinfo=timezone.utc)
    iso = to_iso(dt)
    restored = from_iso(iso)
    assert dt.isoformat() == restored.isoformat()

def test_br_to_iso():
    # Input brasileiro → ISO
    from lib.date_utils import parse_br_date, to_iso
    br_date = parse_br_date("19/02/2026 15:30")
    iso = to_iso(br_date)
    assert iso.startswith("2026-02-19")
```

```typescript
// date-utils.test.ts
import { formatDate, parseISO, toISOString } from './date-utils'

describe('Date Utils', () => {
  it('formats ISO to BR', () => {
    const result = formatDate('2026-02-19T15:30:00.000Z')
    expect(result).toBe('19/02/2026')
  })
  
  it('parses ISO correctly', () => {
    const date = parseISO('2026-02-19T15:30:00.000Z')
    expect(date.toISOString()).toBe('2026-02-19T15:30:00.000Z')
  })
})
```

---

## 9. Referência de Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `docs/platform/schema.sql` | Definição de tipos no banco |
| `api/schemas/*.py` | Models Pydantic |
| `api/services/*.py` | Lógica de conversão |
| `frontend/lib/date-utils.ts` | Funções utilitárias |
| `frontend/components/*` | Uso em componentes |

---

## 10. Histórico

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-02-19 | Versão inicial |
