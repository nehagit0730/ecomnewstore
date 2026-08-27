import { notFound } from "next/navigation";
import { storefrontService } from "@/server/services/storefront.service";
import { buildMetadata } from "@/lib/seo";
import { getSiteSeo } from "@/lib/site-seo";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const [page, seo] = await Promise.all([
    storefrontService.getPublishedPage(handle),
    getSiteSeo(),
  ]);
  if (!page) return {};
  return buildMetadata(
    {
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? undefined,
      path: `/pages/${handle}`,
    },
    seo
  );
}

export default async function CmsPage({ params }: Props) {
  const { handle } = await params;
  const page = await storefrontService.getPublishedPage(handle);
  if (!page) notFound();

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="font-serif text-3xl md:text-4xl mb-8">{page.title}</h1>
      <div
        className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.body.replace(/\n/g, "<br />") }}
      />
    </article>
  );
}
