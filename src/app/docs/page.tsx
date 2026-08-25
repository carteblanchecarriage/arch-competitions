import { redirect } from "next/navigation";
import { getAllDocMetas } from "@/lib/docs";

export default function DocsIndexPage() {
  const docs = getAllDocMetas();
  if (docs.length > 0) {
    redirect(`/docs/${docs[0].slug}`);
  }
  return null;
}
