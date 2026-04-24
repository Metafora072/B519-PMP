import { Layers3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ProjectModule } from "@/services/types";

type ModuleSummaryListProps = {
  modules: ProjectModule[];
};

export function ModuleSummaryList({ modules }: ModuleSummaryListProps) {
  return (
    <Card className="border-[#e6eaf2] shadow-[0_12px_32px_rgba(31,35,41,0.05)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <p className="text-sm text-[#8b95a7]">模块摘要</p>
          <CardTitle className="mt-1">按模块看推进结构</CardTitle>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f4ff] text-[#3370ff]">
          <Layers3 className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.length > 0 ? (
          modules.map((moduleItem) => (
            <div
              key={moduleItem.id}
              className="rounded-[22px] border border-[#e9edf5] bg-[#fbfcff] p-4 transition hover:border-[#cbd9ff]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: moduleItem.color ?? "#3370ff" }}
                  />
                  <div>
                    <p className="font-medium text-[#1f2329]">{moduleItem.name}</p>
                    <p className="mt-1 text-xs text-[#8b95a7]">负责人：{moduleItem.owner.name}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4e5969] shadow-sm">
                  {moduleItem._count.tasks} 项任务
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#646a73]">
                {moduleItem.description || "当前模块暂无补充说明，后续可继续补充目标与边界。"}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#d7dce5] bg-[#fbfcff] p-6 text-sm leading-6 text-[#8b95a7]">
            当前项目还没有模块数据，后续可以继续补齐模块管理入口。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
