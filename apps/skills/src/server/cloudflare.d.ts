declare module 'cloudflare:workers' {
  export const env: import('./auth/auth').SkillsWorkerEnv
}
