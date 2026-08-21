import { listTasks } from "@/lib/data";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from "@/app/actions/tasks";
import { isoToDate } from "@/lib/datetime";
import {
  PageHeader,
  EntityDialog,
  Button,
  Table,
  Th,
  Td,
  Badge,
  EmptyState,
  type FieldDef,
} from "@/components/ui";
import { LinksPanel } from "@/components/links/LinksPanel";
import type { TaskRow } from "@/db/schema";

const PRIORITY: Record<number, string> = { 1: "Alta", 2: "Media", 3: "Baja" };

const taskFields: FieldDef[] = [
  { name: "title", label: "Título", required: true },
  { name: "notes", label: "Notas", type: "textarea" },
  { name: "startDate", label: "Inicio", type: "date" },
  { name: "dueDate", label: "Vencimiento", type: "date" },
  {
    name: "priority",
    label: "Prioridad",
    type: "select",
    options: [
      { value: "1", label: "Alta" },
      { value: "2", label: "Media" },
      { value: "3", label: "Baja" },
    ],
  },
  {
    name: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "pending", label: "Pendiente" },
      { value: "done", label: "Hecha" },
    ],
  },
  { name: "category", label: "Categoría" },
];

function taskValues(t: TaskRow) {
  return {
    id: t.id,
    title: t.title,
    notes: t.notes,
    startDate: isoToDate(t.startDate),
    dueDate: isoToDate(t.dueDate),
    priority: t.priority,
    status: t.status,
    category: t.category,
  };
}

const triggerClass =
  "inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-zinc-700 dark:hover:bg-zinc-300";

export default async function TareasPage() {
  const tasks = await listTasks();

  return (
    <>
      <PageHeader
        title="Tareas"
        description="Lista de tareas con prioridad y vencimiento."
        action={
          <EntityDialog
            title="Nueva tarea"
            trigger="Nueva tarea"
            action={createTaskAction}
            fields={taskFields}
            triggerClassName={triggerClass}
          />
        }
      />
      <div className="p-4">
        {tasks.length === 0 ? (
          <EmptyState>No hay tareas todavía.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Título</Th>
                <Th>Vencimiento</Th>
                <Th>Prioridad</Th>
                <Th>Estado</Th>
                <Th>Categoría</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <Td>{t.title}</Td>
                  <Td>{t.dueDate ? isoToDate(t.dueDate) : "—"}</Td>
                  <Td>
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
                  </Td>
                  <Td>{t.status === "done" ? "Hecha" : "Pendiente"}</Td>
                  <Td>{t.category}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <EntityDialog
                        title="Editar tarea"
                        trigger="Editar"
                        action={updateTaskAction}
                        fields={taskFields}
                        values={taskValues(t)}
                        extra={<LinksPanel sourceType="task" sourceId={t.id} />}
                        onDelete={deleteTaskAction}
                      />
                      <form action={deleteTaskAction.bind(null, t.id)}>
                        <Button variant="danger" type="submit">
                          Eliminar
                        </Button>
                      </form>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
}
