import { listProjects, listPlannerItems } from "@/lib/data";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  createPlannerItemAction,
  updatePlannerItemAction,
  deletePlannerItemAction,
} from "@/app/actions/planner";
import { isoToDate } from "@/lib/datetime";
import {
  PageHeader,
  EntityDialog,
  Card,
  CardHeader,
  CardBody,
  Badge,
  EmptyState,
  type FieldDef,
} from "@/components/ui";
import { LinksPanel } from "@/components/links/LinksPanel";
import type { ProjectRow, PlannerItemRow } from "@/db/schema";

const PROJECT_STATUS: Record<string, { label: string; tone: "neutral" | "info" | "success" | "warning" }> = {
  planning: { label: "Planificación", tone: "warning" },
  active: { label: "Activo", tone: "info" },
  done: { label: "Hecho", tone: "success" },
  archived: { label: "Archivado", tone: "neutral" },
};

const ITEM_STATUS: Record<string, { label: string; tone: "neutral" | "info" | "success" }> = {
  todo: { label: "Por hacer", tone: "neutral" },
  in_progress: { label: "En curso", tone: "info" },
  done: { label: "Hecho", tone: "success" },
};

const PRIORITY: Record<number, string> = { 1: "Alta", 2: "Media", 3: "Baja" };

const projectFields: FieldDef[] = [
  { name: "name", label: "Nombre", required: true },
  { name: "description", label: "Descripción", type: "textarea" },
  { name: "startDate", label: "Inicio", type: "date" },
  { name: "targetDate", label: "Fecha objetivo", type: "date" },
  {
    name: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "planning", label: "Planificación" },
      { value: "active", label: "Activo" },
      { value: "done", label: "Hecho" },
      { value: "archived", label: "Archivado" },
    ],
  },
  { name: "color", label: "Color (#hex)" },
];

const itemFields: FieldDef[] = [
  { name: "title", label: "Título", required: true },
  { name: "startDate", label: "Inicio", type: "date" },
  { name: "dueDate", label: "Vencimiento", type: "date" },
  {
    name: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "todo", label: "Por hacer" },
      { value: "in_progress", label: "En curso" },
      { value: "done", label: "Hecho" },
    ],
  },
  { name: "progress", label: "Progreso (%)", type: "number" },
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
  { name: "notes", label: "Notas", type: "textarea" },
];

function projectValues(p: ProjectRow) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    startDate: isoToDate(p.startDate),
    targetDate: isoToDate(p.targetDate),
    status: p.status,
    color: p.color,
  };
}

function itemValues(it: PlannerItemRow) {
  return {
    id: it.id,
    projectId: it.projectId,
    title: it.title,
    startDate: isoToDate(it.startDate),
    dueDate: isoToDate(it.dueDate),
    status: it.status,
    progress: it.progress,
    priority: it.priority,
    notes: it.notes,
  };
}

const triggerClass =
  "inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-zinc-700 dark:hover:bg-zinc-300";

export default async function PlannerPage() {
  const projects = await listProjects();
  const withItems = await Promise.all(
    projects.map(async (p) => ({
      project: p,
      items: await listPlannerItems(p.id),
    })),
  );

  return (
    <>
      <PageHeader
        title="Planner"
        description="Proyectos e hitos con fechas objetivo."
        action={
          <EntityDialog
            title="Nuevo proyecto"
            trigger="Nuevo proyecto"
            action={createProjectAction}
            fields={projectFields}
            triggerClassName={triggerClass}
          />
        }
      />
      <div className="space-y-4 p-4">
        {withItems.length === 0 ? (
          <EmptyState>
            No hay proyectos todavía. Crea uno con «Nuevo proyecto».
          </EmptyState>
        ) : (
          withItems.map(({ project, items }) => {
            const ps = PROJECT_STATUS[project.status];
            return (
              <Card key={project.id}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </span>
                  }
                  description={
                    project.targetDate
                      ? `Objetivo: ${isoToDate(project.targetDate)}`
                      : undefined
                  }
                  action={
                    <div className="flex items-center gap-2">
                      <Badge tone={ps.tone}>{ps.label}</Badge>
                      <EntityDialog
                        title="Editar proyecto"
                        trigger="Editar"
                        action={updateProjectAction}
                        fields={projectFields}
                        values={projectValues(project)}
                        extra={<LinksPanel sourceType="project" sourceId={project.id} />}
                        onDelete={deleteProjectAction}
                      />
                    </div>
                  }
                />
                <CardBody className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Sin hitos.{" "}
                      <EntityDialog
                        title="Nuevo hito"
                        trigger="Añadir hito"
                        action={createPlannerItemAction}
                        fields={itemFields}
                        hiddenValues={{ projectId: project.id }}
                        triggerClassName="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      />
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {[...items]
                        .sort((a, b) =>
                          (a.dueDate ?? "").localeCompare(b.dueDate ?? ""),
                        )
                        .map((it) => {
                          const is = ITEM_STATUS[it.status];
                          return (
                            <li
                              key={it.id}
                              className="flex items-start gap-3 rounded-md border border-zinc-100 p-2 dark:border-zinc-900"
                            >
                              <span
                                className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate text-sm font-medium">
                                    {it.title}
                                  </span>
                                  <span className="shrink-0 text-xs text-zinc-500">
                                    {it.dueDate
                                      ? isoToDate(it.dueDate)
                                      : "sin fecha"}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge tone={is.tone}>{is.label}</Badge>
                                  <Badge tone="neutral">
                                    {PRIORITY[it.priority]}
                                  </Badge>
                                </div>
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${Math.max(0, Math.min(100, it.progress))}%`,
                                      backgroundColor: project.color,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex shrink-0 flex-col gap-1">
                                <EntityDialog
                                  title="Editar hito"
                                  trigger="✎"
                                  action={updatePlannerItemAction}
                                  fields={itemFields}
                                  values={itemValues(it)}
                                  hiddenValues={{ projectId: project.id }}
                                  onDelete={deletePlannerItemAction}
                                />
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
