import { db } from "../lib/db";
import {
  events,
  tasks,
  contacts,
  notes,
  anniversaries,
  projects,
  plannerItems,
  links,
} from "../db/schema";

async function main() {
  const now = new Date().toISOString();

  const [event1, , event3] = await db
    .insert(events)
    .values([
      {
        title: "Reunión de equipo",
        description: "Repaso semanal del sprint.",
        startAt: "2026-08-19T10:00:00",
        endAt: "2026-08-19T11:00:00",
        location: "Sala A",
        reminderMin: 30,
      },
      {
        title: "Cumpleaños de Ana",
        description: "",
        startAt: "2026-08-21T09:00:00",
        endAt: "2026-08-21T10:00:00",
        allDay: true,
      },
      {
        title: "Viaje a la capital",
        description: "Reservar hotel.",
        startAt: "2026-08-25T07:30:00",
        endAt: "2026-08-25T20:00:00",
        location: "Terminal",
        reminderMin: 120,
      },
    ])
    .returning();

  await db.insert(tasks).values([
    {
      title: "Enviar informe mensual",
      notes: "Compilar cifras de ventas.",
      dueDate: "2026-08-20",
      priority: 1,
      category: "Trabajo",
    },
    {
      title: "Comprar regalo",
      notes: "",
      dueDate: "2026-08-21",
      priority: 2,
      category: "Personal",
    },
    {
      title: "Renovar dominio",
      notes: "Vence pronto.",
      dueDate: "2026-09-01",
      priority: 3,
      category: "Trabajo",
    },
    { title: "Leer artículo de Next.js 16", notes: "", category: "Personal" },
  ]);

  const [contact1] = await db
    .insert(contacts)
    .values([
      {
        firstName: "Ana",
        lastName: "García",
        company: "Innova",
        jobTitle: "Diseñadora",
        email: "ana@innova.example",
        telMobile: "600111222",
      },
      {
        firstName: "Luis",
        lastName: "Pérez",
        company: "Acme",
        jobTitle: "Ingeniero",
        email: "luis@acme.example",
        telWork: "911333444",
      },
      {
        firstName: "María",
        lastName: "López",
        nickname: "Maru",
        email: "maria@mail.example",
      },
    ])
    .returning();

  await db.insert(notes).values([
    {
      title: "Ideas para el planner",
      content: "Dividir el proyecto en hitos pequeños y medibles.",
      category: "Planificación",
    },
    {
      title: "Lista de la compra",
      content: "- Pan\n- Leche\n- Café",
      category: "Personal",
    },
  ]);

  await db.insert(anniversaries).values([
    { name: "Ana García", date: "08-21", type: "birthday", reminderMin: 1440 },
    { name: "Aniversario de boda", date: "12-05", type: "anniversary", reminderMin: 2880 },
  ]);

  const [project1] = await db
    .insert(projects)
    .values([
      {
        name: "Lanzamiento web",
        description: "Nueva web corporativa.",
        startDate: "2026-08-01",
        targetDate: "2026-09-15",
        status: "active",
        color: "#3b82f6",
      },
    ])
    .returning();

  await db.insert(plannerItems).values([
    {
      projectId: project1.id,
      title: "Definir requisitos",
      dueDate: "2026-08-10",
      status: "done",
      progress: 100,
      priority: 1,
    },
    {
      projectId: project1.id,
      title: "Diseño de maquetas",
      dueDate: "2026-08-25",
      status: "in_progress",
      progress: 60,
      priority: 2,
    },
    {
      projectId: project1.id,
      title: "Despliegue en producción",
      dueDate: "2026-09-15",
      status: "todo",
      progress: 0,
      priority: 1,
    },
  ]);

  await db.insert(links).values([
    {
      sourceType: "event",
      sourceId: event1.id,
      targetType: "contact",
      targetId: contact1.id,
      note: "Ana organiza la reunión",
    },
    {
      sourceType: "event",
      sourceId: event3.id,
      targetType: "task",
      targetId: 1,
      note: "Preparar antes del viaje",
    },
  ]);

  console.log("Seed completado:", {
    events: 3,
    tasks: 4,
    contacts: 3,
    notes: 2,
    anniversaries: 2,
    projects: 1,
    plannerItems: 3,
    links: 2,
    now,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
