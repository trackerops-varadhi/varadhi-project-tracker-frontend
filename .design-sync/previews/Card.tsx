import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, Button, Badge, Progress } from 'varadhi-tracker';
import { MoreHorizontal, CalendarDays } from 'lucide-react';

export const ProjectCard = () => (
  <Card className="w-[340px]">
    <CardHeader>
      <CardTitle>Website Redesign</CardTitle>
      <CardDescription>Marketing site refresh with the new brand system and CMS migration.</CardDescription>
      <CardAction>
        <Button variant="ghost" size="icon-sm" aria-label="Project actions"><MoreHorizontal /></Button>
      </CardAction>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>18 of 26 tasks done</span>
        <span className="font-medium text-foreground">69%</span>
      </div>
      <Progress value={69} />
      <div className="flex items-center gap-2">
        <Badge>Active</Badge>
        <Badge variant="outline"><CalendarDays />Due 24 Oct</Badge>
      </div>
    </CardContent>
    <CardFooter className="justify-between">
      <span className="text-xs text-muted-foreground">Manager: Jagdish R.</span>
      <Button size="sm" variant="outline">Open board</Button>
    </CardFooter>
  </Card>
);

export const StatCard = () => (
  <Card size="sm" className="w-[220px]">
    <CardHeader>
      <CardDescription>Open bugs</CardDescription>
      <CardTitle className="text-2xl font-semibold">42</CardTitle>
    </CardHeader>
    <CardContent>
      <span className="text-xs text-muted-foreground">7 breaching SLA this week</span>
    </CardContent>
  </Card>
);

export const Simple = () => (
  <Card className="w-[340px]">
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>You have 3 unread updates from your projects.</CardDescription>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      Priya moved "Fix login redirect" to In Review.
    </CardContent>
  </Card>
);
