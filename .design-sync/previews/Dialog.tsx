import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, Button, Input, Label } from 'varadhi-tracker';

export const EditProject = () => (
  <Dialog defaultOpen modal={false}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit project</DialogTitle>
        <DialogDescription>Update the project name and due date. Members are notified of changes.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="project-name">Project name</Label>
          <Input id="project-name" defaultValue="Website Redesign" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="due-date">Due date</Label>
          <Input id="due-date" type="date" defaultValue="2026-10-24" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
        <Button>Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
