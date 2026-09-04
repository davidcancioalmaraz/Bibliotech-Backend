import { type Type, applyDecorators } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger'

import { PaginatedDto } from '../dto/paginated.dto.js'

/**
 * Documents a `200` carrying `PaginatedDto<Model>`.
 *
 * The `allOf` is what stands in for generics in OpenAPI: the envelope comes
 * from `PaginatedDto`, the element type of `data` is pinned here. Both models
 * go through `@ApiExtraModels` because neither is reachable from a controller
 * signature, so the document would otherwise carry `$ref`s to schemas it never
 * defines.
 */
export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
) =>
  applyDecorators(
    ApiExtraModels(PaginatedDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            required: ['data'],
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(model) } },
            },
          },
        ],
      },
    }),
  )
