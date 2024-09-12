import { Transform } from 'class-transformer';

// create custom instead this
// @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)

export function Trim() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
