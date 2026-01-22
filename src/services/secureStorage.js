import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.yourapp.auth';

export const secureStorage = {
  /**
   * Salvar credenciais no Keychain
   */
  async saveCredentials(token, taxId) {
    try {
      await Keychain.setGenericPassword(
        taxId, // username
        token, // password
        {
          service: SERVICE_NAME,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        }
      );
      return true;
    } catch (error) {
      console.error('Error saving credentials to Keychain:', error);
      return false;
    }
  },

  /**
   * Recuperar credenciais do Keychain
   */
  async getCredentials() {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });

      if (credentials) {
        return {
          token: credentials.password,
          taxId: credentials.username,
        };
      }

      return { token: null, taxId: null };
    } catch (error) {
      console.error('Error getting credentials from Keychain:', error);
      return { token: null, taxId: null };
    }
  },

  /**
   * Recuperar apenas o token
   */
  async getToken() {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Error getting token from Keychain:', error);
      return null;
    }
  },

  /**
   * Recuperar apenas o tax_id
   */
  async getTaxId() {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
      return credentials ? credentials.username : null;
    } catch (error) {
      console.error('Error getting tax_id from Keychain:', error);
      return null;
    }
  },

  /**
   * Limpar apenas o token (mantém tax_id)
   * Para isso, salvamos novamente com token vazio
   */
  async clearToken() {
    try {
      const taxId = await this.getTaxId();
      if (taxId) {
        await Keychain.setGenericPassword(
          taxId,
          '', // token vazio
          {
            service: SERVICE_NAME,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
          }
        );
      }
      return true;
    } catch (error) {
      console.error('Error clearing token from Keychain:', error);
      return false;
    }
  },

  /**
   * Limpar todas as credenciais
   */
  async clearAll() {
    try {
      await Keychain.resetGenericPassword({
        service: SERVICE_NAME,
      });
      return true;
    } catch (error) {
      console.error('Error clearing all credentials from Keychain:', error);
      return false;
    }
  },

  /**
   * Verificar se existem credenciais salvas
   */
  async hasCredentials() {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
      return !!credentials && !!credentials.password;
    } catch (error) {
      console.error('Error checking credentials in Keychain:', error);
      return false;
    }
  },
};