import { listEvents, listTasks, listUpcomingPlannerItems } from "@/lib/data";
import { CalendarView } from "@/components/calendar/CalendarView";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
} from "@/app/actions/events";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  EmptyState,
  Badge,
} from "@/components/ui";

const PRIORITY: Record<number, string> = { 1: "Alta", 2: "Media", 3: "Baja" };

export default async function CalendarioPage() {
  const [events, tasks, planner] = await Promise.all([
    listEvents(),
    listTasks({ status: "pending" }),
    listUpcomingPlannerItems(),
  ]);

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Citas y eventos (vista mes)."
        action={
          <a
            href="/api/calendar"
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            Exportar .ics
          </a>
        }
      />
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CalendarView
            events={events}
            createAction={createEventAction}
            updateAction={updateEventAction}
            deleteAction={deleteEventAction}
          />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Tareas pendientes"
              description={`${tasks.length} por hacer`}
            />
            <CardBody className="space-y-2">
              {tasks.length === 0 ? (
                <EmptyState>Sin tareas pendientes</EmptyState>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate">{t.title}</span>
                    <Badge
                      tone={
                        t.priority === 1
                          ? "danger"
                          : t.priority === 2
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {PRIORITY[t.priority]}
                    </Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Próximos hitos" description="Planner (30 días)" />
            <CardBody className="space-y-2">
              {planner.length === 0 ? (
                <EmptyState>Sin hitos próximos</EmptyState>
              ) : (
                planner.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="text-xs text-zinc-500">
                      {p.dueDate?.slice(0, 10)}
                    </span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
