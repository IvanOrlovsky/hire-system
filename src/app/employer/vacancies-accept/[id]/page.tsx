"use client";

import { Card, Button, Modal, List, Collapse } from "antd";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

type VacancyType = {
	applications: {
		vacancyId: number;
		applicantId: number;
		status: string;
		applicant: {
			id: number;
			name: string;
			email: string;
			password: string;
			status: string;
			resumes: {
				id: number;
				applicantId: number;
				personalInfo: string;
				workExperience: string;
			} | null;
		};
	}[];
	applicantTestResult: {
		id: number;
		applicantId: number;
		vacancyId: number;
		score: number;
	}[];
} & {
	id: number;
	jobId: number;
	salary: number;
	title: string;
	description: string;
	status: string;
};

const apiCall = async (
	method: "get" | "post" | "put" | "delete" | "patch",
	url: string,
	data?: any
) => {
	try {
		const response = await axios[method](url, data);
		return response.data;
	} catch (error) {
		toast.error("Ошибка соединения \n " + error);
		throw error;
	}
};

export default function EmployerVacanciesAccept({
	params,
}: {
	params: { id: string };
}) {
	const { id: employerId } = params;

	const [vacancies, setVacancies] = useState<VacancyType[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [currentApplication, setCurrentApplication] = useState<
		VacancyType["applications"][0] | null
	>(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const { data: vacancies } = await apiCall(
				"get",
				`/api/employer/vacancies/${employerId}`
			);

			if (vacancies.length === 0) {
				toast.error("По вашим вакансиям нет откликов!");
				return;
			}

			setVacancies(vacancies);
		} catch (err) {
			toast.error("Ошибка при получении вакансий \n " + err);
		}
	};

	const handleAccept = async (vacancyId: number, applicantId: number) => {
		try {
			await apiCall(
				"put",
				`/api/employer/vacancies/${employerId}?vacancyId=${vacancyId}&applicantId=${applicantId}&accept=true`
			);
			toast.success("Заявка успешно принята!");
			fetchData();
		} catch (err) {
			toast.error("Ошибка при принятии заявки \n " + err);
		}
	};

	const handleReject = async (vacancyId: number, applicantId: number) => {
		try {
			await apiCall(
				"put",
				`/api/employer/vacancies/${employerId}?vacancyId=${vacancyId}&applicantId=${applicantId}`
			);
			toast.success("Заявка успешно отклонена!");
			fetchData();
		} catch (err) {
			toast.error("Ошибка при отклонении заявки \n " + err);
		}
	};

	const showApplicantDetails = (application: any) => {
		setCurrentApplication(application);
		setModalVisible(true);
	};

	const { Panel } = Collapse;

	return (
		<div className="container mx-auto px-4 py-8">
			<Toaster />
			<h1 className="text-3xl font-bold mb-6">Отклики на вакансии</h1>

			<div className="space-y-4">
				{vacancies.map((vacancy) => (
					<Card
						key={vacancy.id}
						title={vacancy.title}
						className="shadow-lg rounded-lg"
					>
						<List
							dataSource={vacancy.applications}
							renderItem={(application) => (
								<List.Item
									actions={[
										<Button
											key="ShowDetails"
											onClick={() =>
												showApplicantDetails(
													application
												)
											}
										>
											Посмотреть детали
										</Button>,
										<Button
											key={"AcceptBtnq"}
											onClick={() =>
												handleAccept(
													vacancy.id,
													application.applicantId
												)
											}
											type="primary"
										>
											Принять
										</Button>,
										<Button
											key={"RejectBtnq"}
											onClick={() =>
												handleReject(
													vacancy.id,
													application.applicantId
												)
											}
											danger
										>
											Отклонить
										</Button>,
									]}
								>
									<List.Item.Meta
										title={`${application.applicant.name}`}
										description={
											application.status === "pending"
												? "Ожидает решения"
												: application.status ===
												  "failed"
												? "Провалил тест"
												: application.status ===
												  "accepted"
												? "Соискатель принят"
												: application.status ===
												  "rejected"
												? "Отклик отклонен"
												: ""
										}
									/>
								</List.Item>
							)}
						/>
					</Card>
				))}
			</div>

			<Modal
				title={`Детали кандидата: ${currentApplication?.applicant.name}`}
				open={modalVisible}
				onCancel={() => setModalVisible(false)}
				footer={null}
				className="w-full max-w-3xl mx-auto"
			>
				<div className="space-y-4">
					{currentApplication && (
						<>
							<p>
								<strong>Статус:</strong>{" "}
								{currentApplication.status === "pending"
									? "Ожидает решения"
									: currentApplication.status === "failed"
									? "Провалил тест"
									: currentApplication.status === "accepted"
									? "Соискатель принят"
									: currentApplication.status === "rejected"
									? "Отклик отклонен"
									: ""}
							</p>
							<Collapse>
								<Panel header="Тестовые результаты" key="1">
									{vacancies.find(
										(val) =>
											val.id ===
											currentApplication.vacancyId
									)?.applicantTestResult ? (
										<ul>
											{vacancies
												.find(
													(val) =>
														val.id ===
														currentApplication.vacancyId
												)
												?.applicantTestResult.map(
													(result) => (
														<li key={result.id}>
															{result.score}%
														</li>
													)
												)}
										</ul>
									) : (
										<p>Нет тестовых результатов</p>
									)}
								</Panel>
								<Panel header="Резюме" key="2">
									{currentApplication.applicant.resumes ? (
										<div>
											<p>
												<strong>
													Личная информация:
												</strong>{" "}
												{
													currentApplication.applicant
														.resumes.personalInfo
												}
											</p>
											<p>
												<strong>Опыт работы:</strong>{" "}
												{
													currentApplication.applicant
														.resumes.workExperience
												}
											</p>
										</div>
									) : (
										<p>Резюме не предоставлено</p>
									)}
								</Panel>
							</Collapse>
						</>
					)}
				</div>
			</Modal>
		</div>
	);
}
