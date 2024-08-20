import { Transform } from 'class-transformer';

// Custom decorator
// не забываем установить transform: true в глобальном ValidationPipe
// change value before next processing, for example validation
export function Trim() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
