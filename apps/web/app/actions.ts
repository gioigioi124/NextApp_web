"use server";

import { revalidateTag, revalidatePath } from "next/cache";

export async function clearCacheByTag(tag: string) {
  // @ts-ignore
  revalidateTag(tag);
}

export async function clearCacheByPath(path: string) {
  // @ts-ignore
  revalidatePath(path);
}
