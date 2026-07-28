"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ApiBlogPost } from "../../../../../lib/api";
import { fetchBlogPostAdmin } from "../../../../../lib/admin-api";
import BlogEditor from "../../../components/BlogEditor";
import { useAdminToast } from "../../../components/AdminToast";

export default function AdminBlogEditPage() {
  const params = useParams<{ slug: string }>();
  const { showToast } = useAdminToast();
  const [post, setPost] = useState<ApiBlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPost(await fetchBlogPostAdmin(params.slug));
    } catch {
      showToast("Failed to load post", "error");
    } finally {
      setLoading(false);
    }
  }, [params.slug, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <p className="px-margin-desktop py-stack-lg font-body-md text-on-surface-variant">
        Loading…
      </p>
    );
  }

  if (!post) {
    return (
      <p className="px-margin-desktop py-stack-lg font-body-md text-on-surface-variant">
        Post not found.
      </p>
    );
  }

  return <BlogEditor mode="edit" initial={post} />;
}
