import { env } from '../env'

/** SMTP is usable only when a host and a sender address are set in .env. */
export const isEmailConfigured = (): boolean => Boolean(env.SMTP_HOST && env.EMAIL_FROM)
