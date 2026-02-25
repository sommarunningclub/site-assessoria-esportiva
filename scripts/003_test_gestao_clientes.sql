-- Verificar se a tabela gestao-clientes-assessoria existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'gestao-clientes-assessoria'
) AS table_exists;

-- Se existir, mostrar estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'gestao-clientes-assessoria'
ORDER BY ordinal_position;

-- Contar registros
SELECT COUNT(*) FROM "gestao-clientes-assessoria";
