import { OmitType, PartialType } from '@nestjs/swagger'

import { CreateLoanDto } from './create-loan.dto.js'

/**
 * A loan never changes the copy it lends, so `bookId` is left out: only the
 * dates can be adjusted, which is how an extension is recorded.
 */
export class UpdateLoanDto extends PartialType(
  OmitType(CreateLoanDto, ['bookId'] as const),
) {}
