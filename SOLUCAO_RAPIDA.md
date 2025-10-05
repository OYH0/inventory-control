# 🔧 Solução Rápida para o Erro

## ❌ Erro que você teve:
```
ERROR: function pg_catalog.extract(unknown, integer) does not exist
```

## ✅ Solução:

### **Opção 1: Se já executou o APLICAR_AGORA.sql**

Execute apenas o arquivo de correção:

**Arquivo:** `CORRIGIR_ERRO_EXTRACT.sql`

```sql
-- Copie e execute isso no SQL Editor:

DROP FUNCTION IF EXISTS public.calculate_days_until_expiry(DATE);

CREATE OR REPLACE FUNCTION public.calculate_days_until_expiry(expiry_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (expiry_date - CURRENT_DATE);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

SELECT * FROM generate_expiry_alerts();
```

---

### **Opção 2: Se ainda não executou nada**

Execute o arquivo **`APLICAR_AGORA.sql`** que já está corrigido!

Ele agora tem a função certa.

---

## 🎉 Resultado Esperado:

Após executar a correção, você verá:

```
alerts_generated | critical_count | expired_count
----------------+----------------+--------------
       0        |       0        |      0
```

(Será 0 se não tiver produtos com validade ainda)

---

## 🚀 Próximo Passo:

1. **Adicione um produto com data de validade** no sistema
2. **OU execute:** `TESTE_ALERTAS_DADOS.sql` para dados de teste
3. **Execute novamente:**
   ```sql
   SELECT * FROM generate_expiry_alerts();
   ```
4. **Vá no dashboard de alertas** e veja funcionando! ✅

---

**Está tudo corrigido!** 🎊

