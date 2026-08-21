import { listNotes } from "@/lib/data";
import {
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
} from "@/app/actions/notes";
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
import type { NoteRow } from "@/db/schema";

const noteFields: FieldDef[] = [
  { name: "title", label: "Título", required: true },
  { name: "category", label: "Categoría" },
  { name: "content", label: "Contenido", type: "textarea" },
];

function noteValues(n: NoteRow) {
  return {
    id: n.id,
    title: n.title,
    category: n.category,
    content: n.content,
  };
}

const triggerClass =
  "inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-zinc-700 dark:hover:bg-zinc-300";

export default async function NotasPage() {
  const notes = await listNotes();

  return (
    <>
      <PageHeader
        title="Notas"
        description="Notas libres (markdown)."
        action={
          <EntityDialog
            title="Nueva nota"
            trigger="Nueva nota"
            action={createNoteAction}
            fields={noteFields}
            triggerClassName={triggerClass}
          />
        }
      />
      <div className="p-4">
        {notes.length === 0 ? (
          <EmptyState>No hay notas todavía.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Título</Th>
                <Th>Categoría</Th>
                <Th>Actualizada</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n.id}>
                  <Td>{n.title}</Td>
                  <Td>
                    <Badge>{n.category}</Badge>
                  </Td>
                  <Td>{n.updatedAt?.slice(0, 10)}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <EntityDialog
                        title="Editar nota"
                        trigger="Editar"
                        action={updateNoteAction}
                        fields={noteFields}
                        values={noteValues(n)}
                        extra={<LinksPanel sourceType="note" sourceId={n.id} />}
                        onDelete={deleteNoteAction}
                      />
                      <form action={deleteNoteAction.bind(null, n.id)}>
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
