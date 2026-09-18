import { desc, eq, and } from "drizzle-orm";
import { getDb } from "../../../db";
import { accounts, attachments, debts, projects, settings, transactions } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

const initialProjects = ["个人", "OCL", "上班（LEBREW）", "打火机套大作战（坏苹果）", "临时"];

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "未登录" }, { status: 401 });
  try {
    const db = getDb();
    let userProjects = await db.select().from(projects).where(eq(projects.ownerEmail, user.email));
    if (!userProjects.length) {
      await db.insert(projects).values(initialProjects.map(name => ({ ownerEmail: user.email, name })));
      await db.insert(settings).values({ ownerEmail: user.email });
      userProjects = await db.select().from(projects).where(eq(projects.ownerEmail, user.email));
    }
    const [items, userDebts, userAccounts] = await Promise.all([
      db.select().from(transactions).where(eq(transactions.ownerEmail, user.email)).orderBy(desc(transactions.transactionDate), desc(transactions.id)).limit(100),
      db.select().from(debts).where(and(eq(debts.ownerEmail, user.email), eq(debts.status, "open"))),
      db.select().from(accounts).where(and(eq(accounts.ownerEmail, user.email), eq(accounts.archived, false))),
    ]);
    return Response.json({ projects: userProjects, transactions: items, debts: userDebts, accounts: userAccounts });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "数据库暂不可用" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "未登录" }, { status: 401 });
  const body = await request.json() as { entity?: string; name?: string; type?: string; date?: string; kind?: string; amount?: number; currency?: string; category?: string; note?: string; projectId?: number; accountId?: number; toAccountId?: number; sourceProjectId?: number; targetProjectId?: number; direction?: string; counterparty?: string; title?: string; dueDate?: string };
  if (body.entity === "project" && body.name?.trim()) { const [row] = await getDb().insert(projects).values({ ownerEmail: user.email, name: body.name.trim() }).returning(); return Response.json({ project: row }, { status: 201 }); }
  if (body.entity === "account" && body.name?.trim()) { const [row] = await getDb().insert(accounts).values({ ownerEmail: user.email, name: body.name.trim(), type: body.type ?? "bank", currency: body.currency ?? "CNY", openingBalance: Number(body.amount ?? 0), currentBalance: Number(body.amount ?? 0) }).returning(); return Response.json({ account: row }, { status: 201 }); }
  if (body.entity === "debt" && body.title?.trim() && body.counterparty?.trim()) { const [row] = await getDb().insert(debts).values({ ownerEmail: user.email, title: body.title.trim(), counterparty: body.counterparty.trim(), direction: body.direction ?? "borrowed", principal: Number(body.amount ?? 0), outstanding: Number(body.amount ?? 0), dueDate: body.dueDate ?? null }).returning(); return Response.json({ debt: row }, { status: 201 }); }
  if (!body.amount || !body.kind) return Response.json({ error: "amount and kind are required" }, { status: 400 });
  try {
    const db = getDb();
    const [row] = await db.insert(transactions).values({ ownerEmail: user.email, transactionDate: body.date ?? new Date().toISOString().slice(0, 10), kind: body.kind, amount: Number(body.amount), currency: body.currency ?? "CNY", category: body.category ?? null, note: body.note ?? "", projectId: body.projectId ?? null, accountId: body.accountId ?? null, toAccountId: body.toAccountId ?? null, sourceProjectId: body.sourceProjectId ?? null, targetProjectId: body.targetProjectId ?? null }).returning();
    return Response.json({ transaction: row }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "未登录" }, { status: 401 });
  const body = await request.json() as { entity?: string; id?: number; amount?: number; note?: string; category?: string; name?: string; counterparty?: string; direction?: string };
  if (!body.id) return Response.json({ error: "id is required" }, { status: 400 });
  if (body.entity === "project") {
    const [row] = await getDb().update(projects).set({ name: body.name?.trim() || "未命名项目", updatedAt: new Date().toISOString() }).where(and(eq(projects.id, body.id), eq(projects.ownerEmail, user.email))).returning();
    return row ? Response.json({ project: row }) : Response.json({ error: "项目不存在" }, { status: 404 });
  }
  if (body.entity === "account") {
    const [row] = await getDb().update(accounts).set({ name: body.name?.trim() || "未命名账户", currentBalance: Number(body.amount ?? 0), updatedAt: new Date().toISOString() }).where(and(eq(accounts.id, body.id), eq(accounts.ownerEmail, user.email))).returning();
    return row ? Response.json({ account: row }) : Response.json({ error: "账户不存在" }, { status: 404 });
  }
  if (body.entity === "debt") {
    const [row] = await getDb().update(debts).set({ title: body.name?.trim() || "未命名借款", counterparty: body.counterparty?.trim() || "待填写", direction: body.direction ?? "borrowed", outstanding: Number(body.amount ?? 0), updatedAt: new Date().toISOString() }).where(and(eq(debts.id, body.id), eq(debts.ownerEmail, user.email))).returning();
    return row ? Response.json({ debt: row }) : Response.json({ error: "债务不存在" }, { status: 404 });
  }
  const [row] = await getDb().update(transactions).set({ amount: Number(body.amount ?? 0), note: body.note ?? "", category: body.category ?? null, updatedAt: new Date().toISOString() }).where(and(eq(transactions.id, body.id), eq(transactions.ownerEmail, user.email))).returning();
  return row ? Response.json({ transaction: row }) : Response.json({ error: "记录不存在" }, { status: 404 });
}
