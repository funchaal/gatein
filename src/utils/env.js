import { ENVIRONMENT } from '@env';

/**
 * Retorna se a lógica de staging/homologação está ativa.
 * Ativa quando ENVIRONMENT for 'development-staging' ou 'homologation'.
 */
export const isStagingLogicEnabled = () => {
  const env = (ENVIRONMENT || 'development').toLowerCase();
  return env === 'development-staging' || env === 'homologation';
};

/**
 * Retorna se está em ambiente de desenvolvimento ('development' ou 'development-staging').
 */
export const isDevEnvironment = () => {
  const env = (ENVIRONMENT || 'development').toLowerCase();
  return env === 'development' || env === 'development-staging';
};
