import CreateForm from "@/components/create-form";

type CreatePageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
    const resolvedSearchParams = await searchParams;
    const signedUrl = resolvedSearchParams.signedUrl as string | undefined;
    const filePath = resolvedSearchParams.filePath as string | undefined;

    return <CreateForm signedUrl={signedUrl} filePath={filePath} />
}