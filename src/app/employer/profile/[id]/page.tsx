export default function EmployerProfile({
	params,
}: {
	params: { id: string };
}) {
	const { id } = params;
	return <>EmployerProfile {id}</>;
}
