import { OmitType, PartialType } from '@nestjs/swagger'

import { CreateLoanDto } from './create-loan.dto.js'

/**
 * A loan never changes the copy it lends nor the person holding it, so
 * `bookId` and `userId` are left out: only the dates can be adjusted, which is
 * how an extension is recorded. Handing the copy to someone else is a return
 * followed by a new loan, not an edit.
 */
export class UpdateLoanDto extends PartialType(
  OmitType(CreateLoanDto, ['bookId', 'userId'] as const),
) {}
