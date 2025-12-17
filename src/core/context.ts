export class TestContext {
  private store: Record<string, any> = {};

  set(key: string, value: any) {
    this.store[key] = value;
  }

  get(key: string) {
    return this.store[key];
  }

  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    const token = this.store.token; // esto debe contener el token del login
    console.log("getHeaders(): token actual =", token); // <--- depuración
    if (token) {
      headers["Authorization"] = `${token}`;
    }

    return headers;
  }
}
