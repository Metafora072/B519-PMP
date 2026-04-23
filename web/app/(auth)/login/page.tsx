import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="app-grid-background flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-white to-[#edf4ff] p-10 shadow-card lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-[#eaf1ff] px-4 py-1 text-sm font-medium text-[#3370ff]">
              Code Project Platform
            </span>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[#1f2329]">
                面向研发协作的代码项目管理平台
              </h1>
              <p className="max-w-xl text-base leading-7 text-[#646a73]">
                聚合项目、模块、任务与代码上下文，用更轻量的方式搭起飞书项目风格的工程协作界面。
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "项目沉淀", value: "12+", desc: "结构化管理研发项目" },
              { label: "任务流转", value: "4步", desc: "Todo / In Progress / Done / Closed" },
              { label: "信息密度", value: "轻量", desc: "白底、浅灰、圆角、轻阴影" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#e5e6eb] bg-white/85 p-5 shadow-panel">
                <p className="text-sm text-[#646a73]">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[#1f2329]">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-[#86909c]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e5e6eb] bg-white p-6 shadow-card sm:p-8">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}

