import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS)
