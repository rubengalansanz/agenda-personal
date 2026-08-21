import { listContacts } from "@/lib/data";
import {
  createContactAction,
  updateContactAction,
  deleteContactAction,
} from "@/app/actions/contacts";
import { isoToDate } from "@/lib/datetime";
import {
  PageHeader,
  EntityDialog,
  Button,
  Table,
  Th,
  Td,
  EmptyState,
  type FieldDef,
} from "@/components/ui";
import { LinksPanel } from "@/components/links/LinksPanel";
import type { ContactRow } from "@/db/schema";

const contactFields: FieldDef[] = [
  {
    name: "title",
    label: "Trato",
    type: "select",
    options: [
      { value: "", label: "(sin)" },
      { value: "Sr.", label: "Sr." },
      { value: "Sra.", label: "Sra." },
      { value: "Srta.", label: "Srta." },
      { value: "Dr.", label: "Dr." },
    ],
  },
  { name: "firstName", label: "Nombre" },
  { name: "lastName", label: "Apellidos" },
  { name: "nickname", label: "Alias" },
  { name: "company", label: "Empresa" },
  { name: "jobTitle", label: "Cargo" },
  { name: "telHome", label: "Tel. casa" },
  { name: "telWork", label: "Tel. trabajo" },
  { name: "telMobile", label: "Móvil" },
  { name: "telFax", label: "Fax" },
  { name: "email", label: "Email" },
  { name: "birthday", label: "Cumpleaños", type: "date" },
  { name: "addressHome", label: "Dirección casa", type: "textarea" },
  { name: "addressWork", label: "Dirección trabajo", type: "textarea" },
  { name: "notes", label: "Notas", type: "textarea" },
];

function contactValues(c: ContactRow) {
  const r = c as unknown as Record<string, unknown>;
  const v: Record<string, string | number | boolean | null> = { id: c.id };
  for (const f of contactFields) {
    const val = r[f.name];
    if (val == null) v[f.name] = "";
    else if (f.type === "date") v[f.name] = isoToDate(String(val));
    else if (typeof val === "boolean") v[f.name] = val;
    else v[f.name] = String(val);
  }
  return v;
}

function fullName(c: ContactRow) {
  return [c.title, c.firstName, c.lastName].filter(Boolean).join(" ") || "(sin nombre)";
}

const triggerClass =
  "inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-zinc-700 dark:hover:bg-zinc-300";

export default async function ContactosPage() {
  const contacts = await listContacts();

  return (
    <>
      <PageHeader
        title="Contactos"
        description="Agenda de contactos y direcciones."
        action={
          <EntityDialog
            title="Nuevo contacto"
            trigger="Nuevo contacto"
            action={createContactAction}
            fields={contactFields}
            triggerClassName={triggerClass}
          />
        }
      />
      <div className="p-4">
        {contacts.length === 0 ? (
          <EmptyState>No hay contactos todavía.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Empresa</Th>
                <Th>Email</Th>
                <Th>Móvil</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <Td>{fullName(c)}</Td>
                  <Td>{c.company ?? "—"}</Td>
                  <Td>{c.email ?? "—"}</Td>
                  <Td>{c.telMobile ?? "—"}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <EntityDialog
                        title="Editar contacto"
                        trigger="Editar"
                        action={updateContactAction}
                        fields={contactFields}
                        values={contactValues(c)}
                        extra={<LinksPanel sourceType="contact" sourceId={c.id} />}
                        onDelete={deleteContactAction}
                      />
                      <form action={deleteContactAction.bind(null, c.id)}>
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
