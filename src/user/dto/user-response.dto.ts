import { OmitType } from '@nestjs/swagger'

import { User } from '../entities/index.js'

/**
 * The user as the API returns it: the entity minus `password` and `loans`.
 *
 * The hash is dropped here rather than with `@ApiHideProperty()` on the entity
 * itself because entity files must not import `@nestjs/swagger`: the TypeORM
 * CLI loads them through `ts-node`, whose bundled ESM resolver mis-resolves
 * `@nestjs/common/constants.js` and breaks every `migration:*` script.
 *
 * `loans` goes for the same reason `BookResponseDto` drops its own: the
 * relation is not eager, so it never travels in a response.
 */
export class UserResponseDto extends OmitType(User, [
  'password',
  'loans',
] as const) {}
