-- 기존 GIN 인덱스 먼저 제거 (TEXT[] 타입 전용)
DROP INDEX IF EXISTS idx_issues_tags;

-- tags 컬럼을 TEXT[] 배열에서 TEXT (comma-separated)로 변경
ALTER TABLE issues
    ALTER COLUMN tags TYPE TEXT
    USING array_to_string(tags, ',');
