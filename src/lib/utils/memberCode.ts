/**
 * Generates a unique member code for event members
 * @returns A unique alphanumeric string
 */
export function generateMemberCode(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${randomStr}`.toUpperCase();
}
