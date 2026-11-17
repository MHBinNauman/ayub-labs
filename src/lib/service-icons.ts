/**
 * Lucide icons that `services[].icon` in site-data.ts may name. An explicit
 * map, not `import * as icons`, so only these icons reach the client bundle.
 * Add an entry here when a service uses a new icon; the unit test fails until
 * every service's icon is listed.
 */
import {
  Apple,
  Dna,
  Droplets,
  HeartPulse,
  Microscope,
  Pill,
  ScanSearch,
  Sparkles,
  Syringe,
  Video,
  Waves,
  type LucideIcon,
} from "lucide-react";

export const serviceIcons: Record<string, LucideIcon> = {
  Apple,
  Dna,
  Droplets,
  HeartPulse,
  Microscope,
  Pill,
  ScanSearch,
  Sparkles,
  Syringe,
  Video,
  Waves,
};

/** The icon component for a service, or null if the name is not mapped. */
export function serviceIcon(name: string): LucideIcon | null {
  return Object.hasOwn(serviceIcons, name) ? serviceIcons[name] : null;
}
