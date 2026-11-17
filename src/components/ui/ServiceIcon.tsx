import type { LucideProps } from "lucide-react";
import { createElement } from "react";
import { serviceIcon } from "@/lib/service-icons";

/**
 * The lucide icon named by `services[].icon`, or nothing if it is not mapped.
 * Rendered through createElement so components never hold a looked-up
 * component in a local variable (which the React Compiler lint reads as a
 * component created during render). Always decorative.
 */
export function ServiceIcon({
  name,
  ...props
}: { name: string } & Omit<LucideProps, "ref">) {
  const icon = serviceIcon(name);
  return icon ? createElement(icon, { "aria-hidden": true, ...props }) : null;
}
