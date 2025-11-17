export function validatePDF(filename: string | null | undefined): boolean {
  if (!filename || typeof filename !== 'string') return false;

  const parts = filename.split('.');
  if (parts.length < 2) return false;

  const extension = parts.pop()!.toLowerCase();

  return extension === 'pdf';
}
