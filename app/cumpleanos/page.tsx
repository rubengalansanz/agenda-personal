import { listAnniversariesWithNext } from "@/lib/data";
import {
  createAnniversaryAction,
  updateAnniversaryAction,
  deleteAnniversaryAction,
} from "@/app/actions/anniversaries";
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
import type { AnniversaryRow } from "@/db/schema";

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const TYPE_LABEL: Record<string, string> = {
  birthday: "Cumpleaños",
  anniversary: "Aniversario",
  other: "Otro",
};
const TYPE_TONE: Record<string, "info" | "success" | "neutral"> = {
  birthday: "info",
  anniversary: "success",
  other: "neutral",
};

const annFields: FieldDef[] = [
  { name: "name", label: "Nombre", required: true },
  { name: "date", label: "Fecha", type: "date", required: true },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    options: [
      { value: "birthday", label: "Cumpleaños" },
      { value: "anniversary", label: "Aniversario" },
      { value: "other", label: "Otro" },
    ],
  },
  { name: "reminderMin", label: "Recordar (min antes)", type: "number" },
];

function annValues(a: AnniversaryRow) {
  return {
    id: a.id,
    name: a.name,
    date: isoToDate(a.date),
    type: a.type,
    reminderMin: a.reminderMin,
  };
}

function fmt(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MESES[(m ?? 1) - 1]}`;
}

function untilLabel(days: number) {
  if (days <= 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `en ${days} días`;
}

const triggerClass =
  "inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-zinc-700 dark:hover:bg-zinc-300";

export default async function CumpleanosPage() {
  const items = await listAnniversariesWithNext();
  const sorted = [...items].sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <>
      <PageHeader
        title="Cumpleaños / Aniversarios"
        description="Fechas anuales recurrentes con recordatorio."
        action={
          <EntityDialog
            title="Nuevo aniversario"
            trigger="Nuevo"
            action={createAnniversaryAction}
            fields={annFields}
            triggerClassName={triggerClass}
          />
        }
      />
      <div className="p-4">
        {sorted.length === 0 ? (
          <EmptyState>No hay fechas registradas todavía.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Tipo</Th>
                <Th>Próxima</Th>
                <Th>Cuándo</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id}>
                  <Td>{a.name}</Td>
                  <Td>
                    <Badge tone={TYPE_TONE[a.type]}>{TYPE_LABEL[a.type]}</Badge>
                  </Td>
                  <Td>{fmt(a.nextDate)}</Td>
                  <Td>{untilLabel(a.daysUntil)}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <EntityDialog
                        title="Editar"
                        trigger="Editar"
                        action={updateAnniversaryAction}
                        fields={annFields}
                        values={annValues(a)}
                        extra={<LinksPanel sourceType="anniversary" sourceId={a.id} />}
                        onDelete={deleteAnniversaryAction}
                      />
                      <form action={deleteAnniversaryAction.bind(null, a.id)}>
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
