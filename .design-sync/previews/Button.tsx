import { Button } from 'varadhi-tracker';
import { Plus, Trash2, Download, ChevronRight, MoreHorizontal, Pencil } from 'lucide-react';

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button>Create project</Button>
    <Button variant="outline">Cancel</Button>
    <Button variant="secondary">Save draft</Button>
    <Button variant="ghost">Skip</Button>
    <Button variant="destructive">Delete task</Button>
    <Button variant="link">View all</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button size="xs">Extra small</Button>
    <Button size="sm">Small</Button>
    <Button>Default</Button>
    <Button size="lg">Large</Button>
  </div>
);

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button><Plus data-icon="inline-start" />New task</Button>
    <Button variant="outline"><Download data-icon="inline-start" />Export report</Button>
    <Button variant="secondary">Next step<ChevronRight data-icon="inline-end" /></Button>
    <Button variant="destructive"><Trash2 data-icon="inline-start" />Remove</Button>
  </div>
);

export const IconOnly = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button size="icon-xs" variant="ghost" aria-label="More"><MoreHorizontal /></Button>
    <Button size="icon-sm" variant="outline" aria-label="Edit"><Pencil /></Button>
    <Button size="icon" aria-label="Add"><Plus /></Button>
    <Button size="icon-lg" variant="secondary" aria-label="Download"><Download /></Button>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button disabled>Create project</Button>
    <Button variant="outline" disabled>Cancel</Button>
  </div>
);
