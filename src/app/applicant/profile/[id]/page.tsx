export default function ApplicantProfile({
	params,
}: {
	params: { id: string };
}) {
	const { id } = params;
	return <>ApplicantProfile {id}</>;
}
