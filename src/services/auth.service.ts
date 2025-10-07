export interface AuthResult {
  success: boolean;
  error?: string;
}

export class AuthService {
  static createTeamleaderAuth(): AuthService {
    return new AuthService('teamleader');
  }

  static createPipedriveAuth(): AuthService {
    return new AuthService('pipedrive');
  }

  static createOdooAuth(): AuthService {
    return new AuthService('odoo');
  }

  constructor(private provider: string) {}

  async initiateAuth(): Promise<AuthResult> {
    try {
      switch (this.provider) {
        case 'teamleader':
          return this.initiateTeamleaderAuth();
        case 'pipedrive':
          return this.initiatePipedriveAuth();
        case 'odoo':
          return this.initiateOdooAuth();
        default:
          return { success: false, error: 'Unknown provider' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  private async initiateTeamleaderAuth(): Promise<AuthResult> {
    const clientId = import.meta.env.VITE_TEAMLEADER_CLIENT_ID;
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/teamleader/callback`;

    if (!clientId) {
      return { success: false, error: 'TeamLeader client ID not configured' };
    }

    const state = this.generateState();
    localStorage.setItem('teamleader_oauth_state', state);
    localStorage.setItem('auth_provider', 'teamleader');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
    });

    const authUrl = `https://app.teamleader.eu/oauth2/authorize?${params.toString()}`;
    window.location.href = authUrl;

    return { success: true };
  }

  private async initiatePipedriveAuth(): Promise<AuthResult> {
    const clientId = import.meta.env.VITE_PIPEDRIVE_CLIENT_ID;
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/pipedrive/callback`;

    if (!clientId) {
      return { success: false, error: 'Pipedrive client ID not configured' };
    }

    const state = this.generateState();
    localStorage.setItem('pipedrive_oauth_state', state);
    localStorage.setItem('auth_provider', 'pipedrive');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'users:read',
      state: state,
    });

    const authUrl = `https://oauth.pipedrive.com/oauth/authorize?${params.toString()}`;
    window.location.href = authUrl;

    return { success: true };
  }

  private async initiateOdooAuth(): Promise<AuthResult> {
    const clientId = import.meta.env.VITE_ODOO_CLIENT_ID;

    if (!clientId) {
      return { success: false, error: 'Odoo client ID not configured' };
    }
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth/odoo/callback`;

    localStorage.removeItem('odoo_oauth_state');
    localStorage.removeItem('userPlatform');
    localStorage.removeItem('auth_provider');

    const state = this.generateState();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'userinfo',
      state: state,
    });

    localStorage.setItem('odoo_oauth_state', state);
    localStorage.setItem('auth_provider', 'odoo');
    localStorage.setItem('userPlatform', 'odoo');
    const authUrl = `https://accounts.odoo.com/oauth2/auth?${params.toString()}`;

    window.location.href = authUrl;
    return { success: true };
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
