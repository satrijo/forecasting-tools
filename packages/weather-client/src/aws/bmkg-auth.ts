/**
 * BMKG AWS Center Authentication
 * Best practice untuk login dan fetch data dari awscenter.bmkg.go.id
 */

class BMKGAuth {
  username: string;
  password: string;
  phpsessid: string | null;
  cookies: Record<string, string>;
  isAuthenticated: boolean;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.phpsessid = null;
    this.cookies = {};
    this.isAuthenticated = false;
  }

  /**
   * Step 1: Mengakses halaman utama untuk mendapatkan PHPSESSID awal
   */
  async getInitialSession() {
    const response = await fetch("https://awscenter.bmkg.go.id/", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language":
          "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7,de-DE;q=0.6,de;q=0.5",
        "cache-control": "max-age=0",
        "sec-ch-ua": '"Not_A Brand";v="99", "Chromium";v="142"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    });

    // Parse cookies dari response
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      this.parseCookies(setCookieHeader);
    }

    return {
      success: response.ok,
      status: response.status,
      phpsessid: this.phpsessid,
      cookies: this.cookies,
    };
  }

  /**
   * Step 2: Login menggunakan PHPSESSID yang sudah didapat
   */
  async login(captcha = "3") {
    if (!this.phpsessid) {
      throw new Error(
        "PHPSESSID belum ada. Jalankan getInitialSession() terlebih dahulu.",
      );
    }

    // Build cookie string
    const cookieString = this.buildCookieString();

    const response = await fetch("https://awscenter.bmkg.go.id/base/verify", {
      method: "POST",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language":
          "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7,de-DE;q=0.6,de;q=0.5",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        cookie: cookieString,
        dnt: "1",
        origin: "https://awscenter.bmkg.go.id",
        priority: "u=0, i",
        referer: "https://awscenter.bmkg.go.id/",
        "sec-ch-ua": '"Not_A Brand";v="99", "Chromium";v="142"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
      body: `username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&captcha=${captcha}`,
    });

    // Update cookies dari response login
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      this.parseCookies(setCookieHeader);
    }

    // Tandai sebagai authenticated
    this.isAuthenticated = response.ok;

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      phpsessid: this.phpsessid,
    };
  }

  /**
   * Step 3: Fetch data dengan menggunakan session yang sudah login
   * Otomatis re-authenticate jika session expired
   */
  async fetchData(endpoint: string, options: RequestInit = {}) {
    if (!this.isAuthenticated) {
      throw new Error("Belum login. Jalankan authenticate() terlebih dahulu.");
    }

    const cookieString = this.buildCookieString();

    const defaultHeaders = {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language":
        "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7,de-DE;q=0.6,de;q=0.5",
      cookie: cookieString,
      "x-requested-with": "XMLHttpRequest",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    };

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Cek apakah session expired (redirect ke login atau unauthorized)
    if (
      response.status === 401 ||
      response.status === 403 ||
      (response.redirected && response.url.includes("/base"))
    ) {
      console.log("⚠ Session expired, re-authenticating...");

      // Reset dan login ulang
      this.isAuthenticated = false;
      await this.authenticate();

      // Retry request dengan session baru
      const newCookieString = this.buildCookieString();
      return fetch(endpoint, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
          cookie: newCookieString,
        },
      });
    }

    return response;
  }

  /**
   * Helper: Parse cookies dari Set-Cookie header
   */
  parseCookies(setCookieHeader: string): void {
    const cookieStrings = setCookieHeader.split(/,\s*(?=[A-Za-z]+=)/);

    for (let cookieStr of cookieStrings) {
      const parts = cookieStr.split(";")[0]?.trim();
      if (!parts) continue;
      const [name, value] = parts.split("=");

      if (name && value) {
        this.cookies[name] = value;

        // Simpan PHPSESSID secara khusus
        if (name === "PHPSESSID") {
          this.phpsessid = value;
        }
      }
    }
  }

  /**
   * Helper: Build cookie string dari object cookies
   */
  buildCookieString() {
    return Object.entries(this.cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  /**
   * Helper: Get current PHPSESSID
   */
  getPHPSESSID() {
    return this.phpsessid;
  }

  /**
   * Helper: Get all cookies
   */
  getAllCookies() {
    return { ...this.cookies };
  }

  /**
   * Helper: Initialize dan login dalam satu langkah
   */
  async authenticate(captcha = "3") {
    await this.getInitialSession();
    await this.login(captcha);
    return this.isAuthenticated;
  }

  /**
   * Helper: Validasi apakah session masih aktif
   */
  async validateSession() {
    if (!this.isAuthenticated || !this.phpsessid) {
      return false;
    }

    try {
      // Test dengan endpoint ringan
      const response = await fetch("https://awscenter.bmkg.go.id/dashboard", {
        headers: {
          cookie: this.buildCookieString(),
        },
        redirect: "manual", // Jangan follow redirect
      });

      // Jika redirect ke login, berarti session expired
      if (response.status === 302 || response.status === 301) {
        return false;
      }

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Fetch dengan retry otomatis
   */
  async fetchWithRetry(
    endpoint: string,
    options: RequestInit = {},
    maxRetries = 1,
  ) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchData(endpoint, options);

        // Jika response ok, return
        if (response.ok) {
          return response;
        }

        // Jika gagal dan masih ada retry, coba lagi
        if (attempt < maxRetries) {
          console.log(`⚠ Request failed (${response.status}), retrying...`);
          this.isAuthenticated = false;
          await this.authenticate();
          continue;
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(`⚠ Error: ${errorMessage}, retrying...`);
          this.isAuthenticated = false;
          await this.authenticate();
        }
      }
    }

    throw lastError || new Error("Max retries reached");
  }
}

export { BMKGAuth };
