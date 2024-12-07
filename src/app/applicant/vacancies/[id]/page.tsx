export default function ApplicantVacancies({
	params,
}: {
	params: { id: string };
}) {
	const { id } = params;
	return (
		<div>
			<h1>Vacancies for applicant {id}</h1>
		</div>
	);
}
