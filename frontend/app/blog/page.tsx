import Link from "next/link";
import Footer from "../components/Footer";
import { BlogNewsletterForm } from "../components/ClientBits";
import FadeInUp from "../components/FadeInUp";
import Header from "../components/Header";
import {
  getBlogFeatured,
  getBlogGridPosts,
  getSiteSettings,
} from "../../lib/server-data";
import type { BlogPost } from "../../lib/types";
import { hasMediaSrc } from "../../lib/media";

export const metadata = {
  title: "Blog — daathwi.jpg",
  description:
    "Notes from the street — technique, light, and cultural stories behind the frames.",
};

function BlogCover({ post }: { post: BlogPost }) {
  if (!hasMediaSrc(post.image)) {
    return <div className="h-full w-full bg-surface-container" aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.image}
      alt={post.alt}
      className="hover-image-zoom h-full w-full object-cover"
    />
  );
}

function PostMeta({
  date,
  category,
  featured = false,
}: {
  date: string;
  category: string;
  featured?: boolean;
}) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <span className="font-label-caps text-label-caps text-on-surface-variant">
        {date}
      </span>
      {featured && (
        <>
          <span className="h-px w-8 bg-outline-variant" />
          <span className="font-label-caps text-label-caps uppercase text-primary">
            {category}
          </span>
        </>
      )}
      {!featured && (
        <span className="font-label-caps text-label-caps uppercase text-primary">
          {category}
        </span>
      )}
    </div>
  );
}

function FeaturedPost({ post }: { post: BlogPost | null }) {
  if (!post) return null;

  return (
    <FadeInUp delay={200}>
      <article className="group">
        <Link
          href={`/blog/${post.slug}`}
          className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12"
        >
          <div className="image-container aspect-[16/9] overflow-hidden rounded-lg bg-surface-container lg:col-span-8">
            <BlogCover post={post} />
          </div>
          <div className="lg:col-span-4 lg:pl-10">
            <PostMeta date={post.date} category={post.category} featured />
            <h2 className="mb-6 font-headline-md text-headline-md transition-colors group-hover:text-primary">
              {post.title}
            </h2>
            <p className="mb-8 line-clamp-3 font-body-md text-body-md text-on-surface-variant">
              {post.excerpt}
            </p>
            <span className="motion-link-arrow inline-flex items-center border-b border-primary/20 pb-1 font-label-caps text-label-caps transition-all group-hover:border-primary">
              Read Journal
              <span className="motion-link-icon material-symbols-outlined ml-2 text-[14px]">
                arrow_forward
              </span>
            </span>
          </div>
        </Link>
      </article>
    </FadeInUp>
  );
}

function GridPost({ post, delay }: { post: BlogPost; delay: number }) {
  const aspectClass =
    post.aspect === "4/3"
      ? "aspect-[4/3]"
      : post.aspect === "16/9"
        ? "aspect-[16/9]"
        : "aspect-square";

  return (
    <FadeInUp
      delay={delay}
      className={post.gridOffset ? "md:col-start-2" : undefined}
    >
      <article className="group">
        <Link href={`/blog/${post.slug}`} className="block">
          <div
            className={`image-container mb-8 overflow-hidden rounded-lg bg-surface-container ${aspectClass}`}
          >
            <BlogCover post={post} />
          </div>
          <PostMeta date={post.date} category={post.category} />
          <h3 className="mb-4 font-headline-sm text-headline-sm transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-2 font-body-md text-body-md text-on-surface-variant">
            {post.excerpt}
          </p>
        </Link>
      </article>
    </FadeInUp>
  );
}

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [featured, gridPosts, site] = await Promise.all([
    getBlogFeatured(),
    getBlogGridPosts(),
    getSiteSettings(),
  ]);

  const hasPosts = Boolean(featured) || gridPosts.length > 0;

  return (
    <>
      <Header />

      <header className="mx-auto mb-stack-lg mt-24 max-w-container-max px-margin-mobile pb-stack-lg pt-stack-lg md:px-margin-desktop">
        <FadeInUp delay={100}>
          <span className="mb-4 block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            Journal & Perspective
          </span>
          <h1 className="max-w-3xl font-display-lg text-display-lg-mobile md:text-display-lg">
            Notes on process, technique, and the frames that stuck.
          </h1>
        </FadeInUp>
      </header>

      <main className="mx-auto max-w-container-max px-margin-mobile pb-stack-lg md:px-margin-desktop">
        {hasPosts ? (
          <div className="grid grid-cols-1 gap-y-stack-lg">
            <FeaturedPost post={featured} />

            <div className="grid grid-cols-1 gap-x-gutter gap-y-stack-md border-t border-divider pt-stack-md md:grid-cols-2">
              {gridPosts.map((post, i) => (
                <GridPost key={post.id} post={post} delay={300 + i * 100} />
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-divider bg-surface-container-low px-8 py-stack-lg text-center">
            <p className="font-body-md text-on-surface-variant">
              No journal entries yet. Check back soon.
            </p>
          </div>
        )}
      </main>

      {/* Newsletter */}
      <section className="mb-stack-lg border-y border-divider bg-surface-container py-stack-lg">
        <div className="mx-auto max-w-container-max px-margin-mobile text-center md:px-margin-desktop">
          <h2 className="mb-6 font-headline-md text-headline-md">
            Stay in the loop
          </h2>
          <p className="mx-auto mb-10 max-w-xl font-body-md text-body-md text-on-surface-variant">
            Occasional notes on technique, new work, and process — no spam.
          </p>
          <BlogNewsletterForm contactEmail={site.contactEmail} />
        </div>
      </section>

      <Footer />
    </>
  );
}
