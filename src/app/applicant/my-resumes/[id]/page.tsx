export default function ApplicantResumes({
	params,
}: {
	params: { id: string };
}) {
	const { id } = params;
	return <>ApplicantResumes {id}</>;
}
