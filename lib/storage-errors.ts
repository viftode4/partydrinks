export function isStorageBucketMissingError(error: { message?: string | null } | null | undefined) {
  return error?.message?.toLowerCase().includes("not found") ?? false
}
