export default function EmployerVacanciesAccept({
	params,
}: {
	params: { id: string };
}) {
	const { id: employerId } = params;
	return <>EmployerVacanciesAccept {employerId}</>;
}
