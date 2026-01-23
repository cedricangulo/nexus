import MeetingsPage from "@/components/shared/meetings/meetings-page";

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
	return <MeetingsPage searchParams={searchParams} />;
}
