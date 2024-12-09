"use client";

import { Tabs, Card, Button, Modal, Form, Select } from "antd";
import { useState, useEffect } from "react";
import {
	Employer,
	Job,
	Question,
	Resume,
	Tag,
	TagsOnVacancies,
	Test,
	Vacancy,
	VacancyApplication,
} from "@prisma/client";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

type VacancyType = {
	test: ({ questions: Question[] } & Test) | null;
	tags: ({ tag: Tag } & TagsOnVacancies)[];
	job: { employer: Employer } & Job;
	applications: VacancyApplication[];
} & Vacancy;

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

const TagsDisplay = ({
	tags,
}: {
	tags: ({ tag: Tag } & TagsOnVacancies)[];
}) => (
	<div className="my-2">
		{tags && Array.isArray(tags) ? (
			tags.map((tag) => (
				<span
					key={tag.tag.id}
					className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
				>
					{tag.tag.name}
				</span>
			))
		) : (
			<span className="text-gray-500">Теги отсутствуют</span>
		)}
	</div>
);

export default function ApplicantVacancies({
	params,
}: {
	params: { id: string };
}) {
	const { id: applicantId } = params;

	const [notAcceptedVacancies, setNotAcceptedVacancies] = useState<
		VacancyType[]
	>([]);
	const [acceptedVacancies, setAcceptedVacancies] = useState<VacancyType[]>(
		[]
	);
	const [activeTab, setActiveTab] = useState("available");
	const [testModalVisible, setTestModalVisible] = useState(false);
	const [currentVacancy, setCurrentVacancy] = useState<VacancyType | null>(
		null
	);
	const [testAnswers, setTestAnswers] = useState<
		{ questionId: number; answerNumber: number }[]
	>([]);

	const [resume, setResume] = useState<Resume | null>(null);

	useEffect(() => {
		fetchVacancies();
	}, []);

	const fetchVacancies = async () => {
		const [notAccepted, accepted, resume] = await Promise.all([
			apiCall("get", `/api/vacancies/applicant/${applicantId}`),
			apiCall(
				"get",
				`/api/vacancies/applicant/${applicantId}?areAccepted=yes`
			),
			apiCall("get", `/api/user/applicant/${applicantId}/resume`),
		]);

		setNotAcceptedVacancies(notAccepted.data);
		setAcceptedVacancies(accepted.data);
		setResume(resume.data);
	};

	const handleAcceptVacancy = async (vacancyId: string) => {
		if (resume) {
			await apiCall(
				"post",
				`/api/vacancies/applicant/${applicantId}/accept`,
				{ vacancyId }
			);
			toast.success("Отклик успешно оставлен!");
			fetchVacancies();
		} else {
			toast.error("Для отклика по вакансии необходимо иметь резюме!");
		}
	};

	const handleAcceptVacancyWithTest = async () => {
		if (currentVacancy) {
			await apiCall(
				"post",
				`/api/vacancies/applicant/${applicantId}/accept?hasTest=true`,
				{
					vacancyId: currentVacancy.id.toString(),
					testInfo: testAnswers,
				}
			);
			toast.success("Отклик успешно оставлен!");
			setTestModalVisible(false);
			fetchVacancies();
		}
	};

	const handleDeleteAcceptVacancy = async (vacancyId: string) => {
		await apiCall(
			"delete",
			`/api/vacancies/applicant/${applicantId}/accept?vacancyId=${vacancyId}`
		);
		toast.success("Отклик успешно отклонен!");
		fetchVacancies();
	};

	const onAnswerChange = (questionId: number, answerNumber: number) => {
		setTestAnswers((prev) => {
			const newAnswers = [...prev];
			const answerIndex = newAnswers.findIndex(
				(a) => a.questionId === questionId
			);
			if (answerIndex > -1) {
				newAnswers[answerIndex] = { questionId, answerNumber };
			} else {
				newAnswers.push({ questionId, answerNumber });
			}
			return newAnswers;
		});
	};

	const renderVacancyCard = (vacancy: VacancyType) => {
		const vacancyApplication = vacancy.applications.find(
			(application) => application.applicantId === +applicantId
		);

		const pendingBtn = (
			<div className="flex flex-row gap-2">
				<Button
					disabled
					className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
				>
					Отклик оставлен
				</Button>
				<Button
					onClick={() => {
						setCurrentVacancy(vacancy);
						handleDeleteAcceptVacancy(vacancy.id.toString());
					}}
					danger
					className="mt-4 bg-blue-600  hover:bg-blue-700"
				>
					Убрать отклик
				</Button>
			</div>
		);

		const failedBtn = (
			<div className="flex flex-row gap-2">
				<Button
					disabled
					className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
				>
					Вы провалили тест
				</Button>
			</div>
		);

		const rejectedBtn = (
			<div className="flex flex-row gap-2">
				<Button
					disabled
					className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
				>
					Работадатель вас не принял
				</Button>
			</div>
		);

		const acceptBtn = (
			<div className="flex flex-col gap-2">
				<div className="p-3 text-white text-xl bg-green-600">
					Поздравляем, работодатель принял ваш отклик!
				</div>
				<span className="text-xl">
					Свяжитесь с работодателем:{" "}
					<Link href={`mailto:${vacancy.job.employer.email}`}>
						{vacancy.job.employer.email}
					</Link>
				</span>
			</div>
		);

		const defaultBtn = (
			<Button
				onClick={() => {
					if (vacancy.test) {
						if (resume) {
							setCurrentVacancy(vacancy);
							setTestModalVisible(true);
						} else {
							toast.error(
								"Для отклика по вакансии необходимо иметь резюме!"
							);
						}
					} else {
						handleAcceptVacancy(vacancy.id.toString());
					}
				}}
				className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
			>
				Откликнуться
			</Button>
		);

		return (
			<Card
				key={vacancy.id}
				title={vacancy.title}
				className="mb-4 shadow-lg rounded-lg overflow-hidden"
			>
				<p className="text-gray-700">{vacancy.description}</p>
				<p className="text-green-600 font-semibold mt-2">
					{vacancy.salary} ₽
				</p>
				<div className="mt-2">
					<p className="font-bold">
						Работодатель: {vacancy.job.employer.name}
					</p>
					<p>Работа: {vacancy.job.title}</p>
				</div>

				<TagsDisplay tags={vacancy.tags} />

				{!vacancyApplication && defaultBtn}
				{vacancyApplication?.status === "pending" && pendingBtn}
				{vacancyApplication?.status === "failed" && failedBtn}
				{vacancyApplication?.status === "rejected" && rejectedBtn}
				{vacancyApplication?.status === "accepted" && acceptBtn}
			</Card>
		);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<h1 className="text-3xl font-bold mb-6">Вакансии</h1>
			<Tabs
				activeKey={activeTab}
				onChange={(key) => setActiveTab(key)}
				items={[
					{
						label: "Доступные",
						key: "available",
						children: (
							<div className="grid grid-cols-1 gap-4">
								{notAcceptedVacancies.map(renderVacancyCard)}
							</div>
						),
					},
					{
						label: "Архив",
						key: "archived",
						children: (
							<div className="grid grid-cols-1 gap-4">
								{acceptedVacancies.map(renderVacancyCard)}
							</div>
						),
					},
				]}
				className="w-full"
			/>

			<Modal
				title="Пройдите тест для отклика"
				open={testModalVisible}
				onCancel={() => setTestModalVisible(false)}
				footer={[
					<Button
						key="submit"
						onClick={handleAcceptVacancyWithTest}
						className="bg-blue-600 text-white hover:bg-blue-700"
					>
						Отправить ответы
					</Button>,
					<Button
						key="back"
						onClick={() => setTestModalVisible(false)}
					>
						Отмена
					</Button>,
				]}
			>
				<Form layout="vertical">
					{currentVacancy?.test?.questions?.map((question, index) => (
						<div key={question.id}>
							<p className="font-bold">
								{index + 1}. {question.questionText}
							</p>
							<Form.Item name={`question_${question.id}`}>
								<Select
									onChange={(value) =>
										onAnswerChange(question.id, value)
									}
									placeholder="Выберите ответ"
								>
									{[
										question.option1,
										question.option2,
										question.option3,
										question.option4,
									].map((option, optIndex) => (
										<Select.Option
											key={optIndex + 1}
											value={optIndex + 1}
										>
											{option}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
						</div>
					))}
				</Form>
			</Modal>

			<Toaster />
		</div>
	);
}
