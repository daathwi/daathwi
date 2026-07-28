import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleReadingProgress from "../../components/ArticleReadingProgress";
import ArticleShare from "../../components/ArticleShare";
import ArticleToc from "../../components/ArticleToc";
import Footer from "../../components/Footer";
import { ArticleNewsletterForm } from "../../components/ClientBits";
import Header from "../../components/Header";
import {
  getBlogArticleBySlug,
  getBlogPostBySlug,
  getBlogPosts,
  getSiteSettings,
} from "../../../lib/server-data";
import {
  enrichBodyHtmlWithToc,
  tocFromLegacySections,
} from "../../../lib/blog-toc";
import type { BlogArticle, BlogPost } from "../../../lib/types";
import { hasMediaSrc } from "../../../lib/media";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Blog — daathwi.jpg" };

  return {
    title: `${post.title} | daathwi.jpg`,
    description: post.excerpt,
  };
}

function LegacyArticleBody({
  article,
  tocIds,
}: {
  article: BlogArticle;
  tocIds: string[];
}) {
  let headingIndex = 0;

  return (
    <>
      {article.intro.map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}

      {article.figure && hasMediaSrc(article.figure.src) && (
        <figure className="article-breakout">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.figure.src} alt={article.figure.alt} />
          <figcaption>{article.figure.caption}</figcaption>
        </figure>
      )}

      {article.sections.map((section) => {
        const id = section.heading ? tocIds[headingIndex++] : undefined;
        return (
          <section key={section.heading ?? section.paragraphs[0]?.slice(0, 40)}>
            {section.heading && (
              <h2 id={id} className="scroll-mt-28">
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>
        );
      })}

      {article.gallery.length > 0 && (
        <div className="article-gallery">
          {article.gallery.map((image) => (
            <figure key={image.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt} />
            </figure>
          ))}
        </div>
      )}

      {article.pullQuote && (
        <blockquote>
          <p>&ldquo;{article.pullQuote.text}&rdquo;</p>
          <cite>{article.pullQuote.cite}</cite>
        </blockquote>
      )}

      {article.closing.map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
    </>
  );
}

function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-divider bg-background px-margin-mobile py-stack-lg md:px-margin-desktop">
      <div className="mx-auto w-full max-w-container-max">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-headline-sm text-headline-sm">Keep reading</h2>
          <Link
            href="/blog"
            className="font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary"
          >
            All posts →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <article>
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container">
                  {hasMediaSrc(post.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image}
                      alt={post.alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full bg-surface-container-high" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <time className="mb-2 block font-label-caps text-[11px] tracking-widest text-hero-fg/70">
                      {post.date}
                    </time>
                    <h3 className="font-headline-sm text-body-lg text-hero-fg">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const [post, article, site, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogArticleBySlug(slug),
    getSiteSettings(),
    getBlogPosts(),
  ]);

  if (!post || !article) notFound();

  const { html: bodyHtml, toc: htmlToc } = article.bodyHtml
    ? enrichBodyHtmlWithToc(article.bodyHtml)
    : { html: "", toc: [] };

  const legacyToc = !article.bodyHtml
    ? tocFromLegacySections(article.sections)
    : [];
  const toc = htmlToc.length > 0 ? htmlToc : legacyToc;
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const shareUrl = `${site.siteUrl.replace(/\/$/, "")}/blog/${post.slug}`;
  const coverSrc = post.image || article.heroImage;
  const coverAlt = post.alt || article.heroAlt || post.title;

  return (
    <>
      <Header />
      <ArticleReadingProgress />

      <main className="article-layout">
        {/* Visual-first hero: image dominates */}
        {hasMediaSrc(coverSrc) && (
          <section className="relative mt-20 overflow-hidden md:mt-24">
            <div className="relative mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
              <figure className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-container sm:aspect-[16/10] md:aspect-[21/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrc}
                  alt={coverAlt}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
                  <nav className="mb-4 flex flex-wrap items-center gap-2 font-label-caps text-[11px] tracking-widest text-hero-fg/70">
                    <Link href="/blog" className="hover:text-hero-fg">
                      Journal
                    </Link>
                    <span aria-hidden>/</span>
                    <span>{article.categoryTag}</span>
                  </nav>
                  <h1 className="max-w-4xl font-display-lg text-[2.4rem] leading-[1.08] text-hero-fg md:text-display-lg">
                    {post.title}
                  </h1>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-label-caps text-[11px] tracking-widest text-hero-fg/65">
                    <span>{article.dateLong}</span>
                    <span aria-hidden>·</span>
                    <span>{article.readTime}</span>
                    <span aria-hidden>·</span>
                    <span>{article.author.name}</span>
                  </div>
                </div>
              </figure>
            </div>
          </section>
        )}

        {!hasMediaSrc(coverSrc) && (
          <header className="px-margin-mobile pb-stack-md pt-32 md:px-margin-desktop md:pt-40">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="mb-6 inline-block font-label-caps text-label-caps text-on-surface-variant hover:text-primary"
              >
                ← Journal
              </Link>
              <h1 className="font-display-lg text-display-lg-mobile text-primary md:text-display-lg">
                {post.title}
              </h1>
            </div>
          </header>
        )}

        <article
          id="article-content"
          className="px-margin-mobile py-stack-lg md:px-margin-desktop"
        >
          <div className="mx-auto grid w-full max-w-container-max grid-cols-1 gap-gutter lg:grid-cols-12">
            <div className="lg:col-span-8 lg:col-start-1 xl:col-span-7 xl:col-start-2">
              {article.lede && (
                <p className="mb-10 font-headline-sm text-[1.35rem] italic leading-relaxed text-on-surface-variant md:text-headline-sm">
                  {article.lede}
                </p>
              )}

              {article.bodyHtml ? (
                <div
                  className="article-body article-body--magazine"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              ) : (
                <div className="article-body article-body--magazine">
                  <LegacyArticleBody
                    article={article}
                    tocIds={legacyToc.map((item) => item.id)}
                  />
                </div>
              )}

              <div className="mt-16 flex flex-col gap-8 border-t border-divider pt-10 sm:flex-row sm:items-center sm:justify-between">
                <ArticleShare title={post.title} url={shareUrl} />
                <Link
                  href="/blog"
                  className="font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  ← Back to journal
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-4 rounded-lg border border-divider bg-surface-container-low p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container font-headline-sm text-headline-sm text-on-surface-variant">
                  {hasMediaSrc(article.author.avatar) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.author.avatar}
                      alt={article.author.avatarAlt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    article.author.name.slice(0, 1)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-headline-sm text-body-lg text-primary">
                    {article.author.name}
                  </p>
                  <p className="mt-1 font-body-md text-sm text-on-surface-variant">
                    {article.author.role}
                  </p>
                </div>
                <Link
                  href="/about"
                  className="ml-auto shrink-0 font-label-caps text-[11px] tracking-widest text-on-surface-variant hover:text-primary"
                >
                  About →
                </Link>
              </div>
            </div>

            {toc.length > 0 && (
              <aside className="relative hidden lg:col-span-4 lg:block xl:col-span-3">
                <div className="sticky top-28 border-l border-divider pl-8">
                  <ArticleToc items={toc} variant="sidebar" />
                </div>
              </aside>
            )}
          </div>

          {toc.length > 0 && <ArticleToc items={toc} variant="mobile" />}
        </article>

        <RelatedPosts posts={related} />

        <section className="border-y border-divider bg-surface-container-low px-margin-mobile py-stack-lg md:px-margin-desktop">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="mb-3 font-headline-sm text-headline-sm text-primary">
              Stay in the loop
            </h3>
            <p className="mb-8 font-body-md text-on-surface-variant">
              New photos and journal notes — occasional, never spam.
            </p>
            <ArticleNewsletterForm contactEmail={site.contactEmail} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
