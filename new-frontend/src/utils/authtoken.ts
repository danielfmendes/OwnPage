import Cookies from 'js-cookie';

class AuthToken {
    static getAuthToken(): string | undefined {
        return Cookies.get('authToken');
    }

    static setAuthToken(token: string): void {
        Cookies.set('authToken', token, { expires: 30 / (24 * 60) }); // 30 Minuten
    }

    static removeAuthToken(): void {
        Cookies.remove('authToken');
    }
}

export default AuthToken;
