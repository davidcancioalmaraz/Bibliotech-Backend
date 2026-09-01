import { OmitType } from '@nestjs/swagger'

import { User } from '../entities/index.js'

/**
 * The user as the API returns it: the entity minus `password`.
 *
 * The hash is dropped here rather than with `@ApiHideProperty()` on the entity
 * itself because entity files must not import `@nestjs/swagger`: the TypeORM
 * CLI loads them through `ts-node`, whose bundled ESM resolver mis-resolves
 * `@nestjs/common/constants.js` and breaks every `migration:*` script.
 */
export class UserResponseDto extends OmitType(User, ['password'] as const) {}
