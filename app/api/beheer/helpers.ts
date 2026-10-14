export const fail = (error: string, status = 400) => Response.json({ error }, { status });
export const notLoggedIn = () => fail("Je bent niet (meer) ingelogd. Laad de pagina opnieuw.", 401);

export function text(form: FormData, name: string, max: number): string {
  const v = form.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Een meegestuurd bestand, of null als er geen is gekozen. */
export function file(form: FormData, name: string): File | null {
  const v = form.get(name);
  return v instanceof File && v.size > 0 ? v : null;
}
