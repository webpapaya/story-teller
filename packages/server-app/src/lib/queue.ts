import PgBoss from 'pg-boss'

export const queue = new PgBoss(process.env['DATABASE_URL'] as string)
