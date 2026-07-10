import { api, auth } from "@/lib/api";

const safeSelect = (select: string) => {
  if (!select || select.trim() === "") return "*";
  return select
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ") || "*";
};

const safeField = (field: string) => {
  if (!/^[a-zA-Z0-9_]+$/.test(field)) {
    throw new Error(`Invalid field name: ${field}`);
  }
  return field;
};

class SupabaseQuery {
  table: string;
  selectColumns = "*";
  filters: Array<{ type: string; field: string; value: any }> = [];
  orderField?: string;
  orderDirection = "ASC";
  limitValue?: number;
  orExpression?: string;
  singleFlag = false;
  headFlag = false;
  countType?: string;

  constructor(table: string) {
    this.table = table;
  }

  select(select = "*", options?: { count?: string; head?: boolean }) {
    this.selectColumns = safeSelect(select);
    if (options?.count) this.countType = options.count;
    if (options?.head) this.headFlag = true;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ type: "eq", field, value });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({ type: "in", field, value: values });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = safeField(field);
    this.orderDirection = options?.ascending === false ? "DESC" : "ASC";
    return this;
  }

  limit(limit: number) {
    this.limitValue = limit;
    return this;
  }

  or(expression: string) {
    this.orExpression = expression;
    return this;
  }

  single() {
    this.singleFlag = true;
    return this;
  }

  head(options?: { count?: string; head?: boolean }) {
    if (options?.count) this.countType = options.count;
    this.headFlag = true;
    return this;
  }

  buildQuery() {
    const query: Record<string, unknown> = { select: this.selectColumns };
    if (this.orderField) {
      query.order = this.orderField;
      query.orderDirection = this.orderDirection;
    }
    if (this.limitValue != null) query.limit = this.limitValue;
    if (this.singleFlag) query.single = true;
    if (this.headFlag) query.head = true;
    if (this.countType) query.count = this.countType;
    if (this.orExpression) query.or = this.orExpression;

    this.filters.forEach((filter) => {
      if (filter.type === "eq") {
        query[`eq_${filter.field}`] = filter.value;
      }
      if (filter.type === "in") {
        query[`in_${filter.field}`] = filter.value;
      }
    });

    return query;
  }

  async execute() {
    return api.get(`/api/db/${this.table}`, this.buildQuery());
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch(onrejected: any) {
    return this.execute().catch(onrejected);
  }

  async insert(values: any) {
    return api.post(`/api/db/${this.table}`, values);
  }

  async update(values: any) {
    const idFilter = this.filters.find((filter) => filter.type === "eq" && filter.field === "id");
    if (!idFilter) {
      throw new Error("Update requires .eq('id', value) for this backend adapter.");
    }
    return api.put(`/api/db/${this.table}/${idFilter.value}`, values);
  }

  async delete() {
    const idFilter = this.filters.find((filter) => filter.type === "eq" && filter.field === "id");
    if (idFilter) {
      return api.delete(`/api/db/${this.table}/${idFilter.value}`);
    }
    return api.delete(`/api/db/${this.table}`, this.buildQuery());
  }

  async upsert(values: any, options?: { onConflict?: string }) {
    return api.post(`/api/db/${this.table}/upsert`, values, {
      onConflict: options?.onConflict,
    });
  }
}

export const supabase = {
  from: (table: string) => new SupabaseQuery(table),
  auth: {
    getSession: async () => {
      const response = await auth.getSession();
      return { data: response.data, error: null };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await auth.login(email, password);
        return { data: response.data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message || "Giriş başarısız" } };
      }
    },
    signOut: async () => {
      try {
        const response = await auth.logout();
        return { data: response.data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message || "Çıkış yapılamadı" } };
      }
    },
  },
};