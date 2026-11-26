/*
 * Server-safe primitives only. Client components (Tabs, Reveal,
 * BranchStatusChip) are imported by path: re-exporting them here put their
 * code, and Reveal's motion dependency, into the client bundle of every page
 * that imports this file, whether or not the page rendered them.
 * (Section does use Reveal, deliberately: every page reveals its sections.)
 */
export { Accordion, type AccordionEntry } from "./Accordion";
export { Badge } from "./Badge";
export { Breadcrumbs, type Crumb } from "./Breadcrumbs";
export { Button, type ButtonProps } from "./Button";
export { Card } from "./Card";
export { Container } from "./Container";
export { Section } from "./Section";
export { SectionHeading } from "./SectionHeading";
