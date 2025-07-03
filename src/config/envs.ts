import { z } from 'zod';

export const envSchema = z.object({
    PORT            : z.string().transform(val => parseInt(val, 10)).default('3000'),
    NODE_ENV        : z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL    : z.string(),
    API_PREFIX      : z.string().default('api'),
    API_DOC_PREFIX  : z.string().default('docs'),
    CORS_ORIGIN     : z.string().default('*'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

export const ENV = () => {
    if (cachedEnv) return cachedEnv;    

    try {
        cachedEnv = envSchema.parse(process.env);
        return cachedEnv;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = `❌ Invalid environment variables: ${error.errors.map(e => `${e.path}: ${e.message}`).join(', ')}`;
            throw new Error(errorMessage);
        }

        throw error;
    }
};
