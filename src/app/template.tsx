import type { ReactNode } from "react";
import { PageTransition } from "@/components/layout/PageTransition";

/**
 * Enter animation between top-level sections. A template is only remounted
 * when its own segment changes, so /services and /locations have their own
 * for moving between their pages.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
