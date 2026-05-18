const TOKEN_KEY = 'auth_token'

export function useAuth() {
  const router = useRouter()

  function getToken(): string | null {
    if (import.meta.client) {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  }

  function isLoggedIn(): boolean {
    return !!getToken()
  }

  async function login(username: string, password: string): Promise<void> {
    const response = await fetch('/spring/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (!response.ok) {
      throw new Error('Invalid credentials')
    }
    const { token } = await response.json()
    localStorage.setItem(TOKEN_KEY, token)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    router.push('/login')
  }

  return { getToken, isLoggedIn, login, logout }
}
