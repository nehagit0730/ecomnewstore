import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { DEFAULT_SIZE_CHART } from "@/lib/size-chart-defaults";
import { toErrorResponse } from "@/server/errors/app-error";
import { z } from "zod";

const sizeChartSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function GET() {
  try {
    await requireSuperAdmin();
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "storefront.sizeChart" },
    });
    const value = setting?.value as { title?: string; content?: string } | undefined;
    return Response.json({
      title: value?.title ?? DEFAULT_SIZE_CHART.title,
      content: value?.content ?? DEFAULT_SIZE_CHART.content,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireSuperAdmin();
    const value = sizeChartSchema.parse(await request.json());
    const setting = await prisma.siteSetting.upsert({
      where: { key: "storefront.sizeChart" },
      create: { key: "storefront.sizeChart", value },
      update: { value },
    });
    return Response.json(setting.value);
  } catch (error) {
    return toErrorResponse(error);
  }
}
