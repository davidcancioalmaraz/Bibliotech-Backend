import { setSeederFactory } from 'typeorm-extension'

import { Loan } from '../../loan/entities/loan.entity.js'
import { faker } from './faker.js'

/** Plazos de préstamo que ofrece la biblioteca, en días. */
const PLAZOS_PRESTAMO_DIAS = [14, 21, 30]

/** Descarta la hora: las columnas `date` sólo guardan año, mes y día. */
const soloFecha = (fecha: Date) =>
  new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())

export const sumarDias = (fecha: Date, dias: number) => {
  const resultado = new Date(fecha)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}

export const hoy = () => soloFecha(new Date())

/**
 * Fecha un préstamo ya cerrado, devuelto antes de `antesDe`. Encadenando
 * llamadas con `antesDe = loan.loanedAt` se obtiene un historial hacia atrás
 * sin solapes, que es como se comporta un ejemplar real: sólo puede estar en
 * manos de una persona a la vez.
 */
export const fecharDevuelto = (loan: Loan, antesDe: Date) => {
  const plazo = faker.helpers.arrayElement(PLAZOS_PRESTAMO_DIAS)
  // Días que el ejemplar pasa en la estantería antes del siguiente préstamo.
  const returnedAt = sumarDias(antesDe, -faker.number.int({ min: 1, max: 30 }))
  const loanedAt = sumarDias(
    returnedAt,
    -faker.number.int({ min: 1, max: plazo + 7 }),
  )

  loan.loanedAt = loanedAt
  loan.dueDate = sumarDias(loanedAt, plazo)
  loan.returnedAt = returnedAt

  return loan
}

/** Fecha un préstamo vivo; algunos salen vencidos a propósito. */
export const fecharAbierto = (loan: Loan) => {
  const plazo = faker.helpers.arrayElement(PLAZOS_PRESTAMO_DIAS)
  const loanedAt = sumarDias(
    hoy(),
    -faker.number.int({ min: 0, max: plazo + 10 }),
  )

  loan.loanedAt = loanedAt
  loan.dueDate = sumarDias(loanedAt, plazo)
  loan.returnedAt = null

  return loan
}

/**
 * Genera un préstamo ya devuelto, que es el caso mayoritario del histórico.
 * `LoanSeeder` reordena las fechas por ejemplar y reabre los que siguen vivos,
 * para que los préstamos concuerden con el `status` de cada libro.
 */
export const loanFactory = setSeederFactory(Loan, () => {
  const loan = new Loan()

  loan.code = `LN-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`

  return fecharDevuelto(loan, hoy())
})
