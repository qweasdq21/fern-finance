import { requireChatGPTUser } from "./chatgpt-auth";
import FinanceDashboard from "../components/finance-dashboard";
export const dynamic = "force-dynamic";
export default async function Home() { const user = await requireChatGPTUser("/"); return <FinanceDashboard displayName={user.displayName} email={user.email} />; }
