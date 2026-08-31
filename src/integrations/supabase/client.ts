// Bu dosya artık Supabase kullanmıyor.
//
// SPOLDER, Vercel + Supabase'ten Natro üzerinde kendi sunucumuza (self-hosted
// Node/Express + PostgreSQL backend) taşındı. Bu dosya, geri kalan tüm
// sayfaların (`.from(table).select()...`, `.auth.signInWithPassword()` vb.)
// hiç değişmeden çalışmaya devam etmesi için Supabase JS istemcisinin API
// yüzeyinin bir alt kümesini taklit eden küçük bir "shim" (uyum katmanı).
// Gerçek istekler kendi backend'imizin /api/db/* ve /api/auth/* uçlarına gider.
//
// Not: Frontend ve backend aynı origin'den (Nginx -> Express) servis
// edildiği için burada ayrı bir API taban URL'sine gerek yok, hepsi göreli
// (relative) yollarla çalışıyor.

type SbResult<T = any> = { data: T | null; error: { message: string } | null; count?: number };

const jsonHeaders = { "Content-Type": "application/json" };

async function parseJsonSafe(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function networkError(e: unknown): SbResult<null> {
  const message = e instanceof Error ? e.message : "Ağ hatası";
  return { data: null, error: { message } };
}

class QueryBuilder<T = any> implements PromiseLike<SbResult<T>> {
  private table: string;
  private params = new URLSearchParams();
  private method: "GET" | "POST" | "PUT" | "DELETE" | "UPSERT" = "GET";
  private body: any;
  private onConflictField?: string;
  private idEq?: string | number;
  private idIn?: Array<string | number>;
  private wantSingle = false;
  private selectCols?: string;
  private countExact = false;
  private headOnly = false;

  constructor(table: string) {
    this.table = table;
  }

  select(cols?: string, opts?: { count?: "exact"; head?: boolean }) {
    if (cols) this.selectCols = cols;
    if (opts?.count === "exact") this.countExact = true;
    if (opts?.head) this.headOnly = true;
    return this;
  }

  eq(field: string, value: any) {
    if (field === "id" && (this.method === "PUT" || this.method === "DELETE")) {
      this.idEq = value;
    } else {
      this.params.append(`eq_${field}`, String(value));
    }
    return this;
  }

  neq(field: string, value: any) {
    this.params.append(`neq_${field}`, String(value));
    return this;
  }

  in(field: string, values: Array<string | number>) {
    if (field === "id" && (this.method === "PUT" || this.method === "DELETE")) {
      this.idIn = values;
    } else {
      this.params.append(`in_${field}`, values.join(","));
    }
    return this;
  }

  not(field: string, op: "is" | "eq", value: any) {
    if (op === "is") {
      this.params.append(`not_is_${field}`, value === null ? "null" : String(value));
    } else if (op === "eq") {
      this.params.append(`not_eq_${field}`, String(value));
    }
    return this;
  }

  or(expression: string) {
    this.params.set("or", expression);
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this.params.set("order", field);
    this.params.set("orderDirection", opts?.ascending === false ? "desc" : "asc");
    return this;
  }

  limit(n: number) {
    this.params.set("limit", String(n));
    return this;
  }

  single() {
    this.wantSingle = true;
    this.params.set("single", "true");
    return this;
  }

  insert(rows: any) {
    this.method = "POST";
    this.body = rows;
    return this;
  }

  update(values: any) {
    this.method = "PUT";
    this.body = values;
    return this;
  }

  upsert(rows: any, opts?: { onConflict?: string }) {
    this.method = "UPSERT";
    this.body = rows;
    this.onConflictField = opts?.onConflict;
    return this;
  }

  delete() {
    this.method = "DELETE";
    return this;
  }

  private async execute(): Promise<SbResult<T>> {
    try {
      if (this.method === "GET") {
        if (this.selectCols) this.params.set("select", this.selectCols);
        if (this.countExact) this.params.set("count", "exact");
        if (this.headOnly) this.params.set("head", "true");
        const res = await fetch(`/api/db/${this.table}?${this.params.toString()}`, {
          credentials: "include",
        });
        const json = await parseJsonSafe(res);
        if (!res.ok) return { data: null, error: json.error || { message: `İstek başarısız (${res.status})` } };
        const data = this.wantSingle && Array.isArray(json.data) ? json.data[0] ?? null : json.data;
        return { data, error: null, count: json.count };
      }

      if (this.method === "POST") {
        const res = await fetch(`/api/db/${this.table}`, {
          method: "POST",
          credentials: "include",
          headers: jsonHeaders,
          body: JSON.stringify(this.body),
        });
        const json = await parseJsonSafe(res);
        if (!res.ok) return { data: null, error: json.error || { message: `İstek başarısız (${res.status})` } };
        return { data: json.data, error: null };
      }

      if (this.method === "UPSERT") {
        const qs = this.onConflictField ? `?onConflict=${encodeURIComponent(this.onConflictField)}` : "";
        const res = await fetch(`/api/db/${this.table}/upsert${qs}`, {
          method: "POST",
          credentials: "include",
          headers: jsonHeaders,
          body: JSON.stringify(this.body),
        });
        const json = await parseJsonSafe(res);
        if (!res.ok) return { data: null, error: json.error || { message: `İstek başarısız (${res.status})` } };
        return { data: json.data, error: null };
      }

      if (this.method === "PUT") {
        // Backend only supports updating a single row by id. `.update().in('id', [...])`
        // (bulk update) is handled here as several parallel single-row updates.
        if (this.idIn) {
          const results = await Promise.all(
            this.idIn.map((id) =>
              fetch(`/api/db/${this.table}/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: jsonHeaders,
                body: JSON.stringify(this.body),
              }),
            ),
          );
          for (const res of results) {
            if (!res.ok) {
              const json = await parseJsonSafe(res);
              return { data: null, error: json.error || { message: `İstek başarısız (${res.status})` } };
            }
          }
          return { data: null, error: null };
        }

        const res = await fetch(`/api/db/${this.table}/${this.idEq}`, {
          method: "PUT",
          credentials: "include",
          headers: jsonHeaders,
          body: JSON.stringify(this.body),
        });
        const json = await parseJsonSafe(res);
        if (!res.ok) return { data: null, error: json.error || { message: `İstek başarısız (${res.status})` } };
        return { data: json.data, error: null };
      }

      if (this.method === "DELETE") {
        if (this.idEq !== undefined) {
          const res = await fetch(`/api/db/${this.table}/${this.idEq}`, {
            method: "DELETE",
            credentials: "include",
          });
          const json = await parseJsonSafe(res);
          if (!res.ok) return { data: null, error: json.error || { message: `İstek başarısız (${res.status})` } };
          return { data: json.data, error: null };
        }
        if (this.idIn) {
          const qs = new URLSearchParams();
          qs.set("in_id", this.idIn.join(","));
          const res = await fetch(`/api/db/${this.table}?${qs.toString()}`, {
            method: "DELETE",
            credentials: "include",
          });
          const json = await parseJsonSafe(res);
          if (!res.ok) return { data: null, error: json.error || { message: `İstek başarısız (${res.status})` } };
          return { data: json.data, error: null };
        }
        const res = await fetch(`/api/db/${this.table}?${this.params.toString()}`, {
          method: "DELETE",
          credentials: "include",
        });
        const json = await parseJsonSafe(res);
        if (!res.ok) return { data: null, error: json.error || { message: `İstek başarısız (${res.status})` } };
        return { data: json.data, error: null };
      }

      return { data: null, error: { message: "Bilinmeyen işlem" } };
    } catch (e) {
      return networkError(e);
    }
  }

  // Makes the builder awaitable: `await supabase.from(x).select()...`
  then<TResult1 = SbResult<T>, TResult2 = never>(
    onfulfilled?: ((value: SbResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from<T = any>(table: string) {
    return new QueryBuilder<T>(table);
  },
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: jsonHeaders,
          body: JSON.stringify({ email, password }),
        });
        const json = await parseJsonSafe(res);
        if (!res.ok) {
          return { data: { session: null, user: null }, error: json.error || { message: "Giriş başarısız" } };
        }
        return { data: json.data, error: null };
      } catch (e) {
        return { data: { session: null, user: null }, error: networkError(e).error };
      }
    },
    async getSession() {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        const json = await parseJsonSafe(res);
        return { data: json.data ?? { session: null }, error: null };
      } catch (e) {
        return { data: { session: null }, error: networkError(e).error };
      }
    },
    async signOut() {
      try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        return { error: null };
      } catch (e) {
        return { error: networkError(e).error };
      }
    },
  },
};
