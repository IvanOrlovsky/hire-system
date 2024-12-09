"use client";

import { Question, Tag, TagsOnVacancies, Test, Vacancy } from "@prisma/client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Button, Card, Modal, Input, Select, Form, List } from "antd";

const { TextArea } = Input;
const { Option } = Select;
const { Item } = Form;

type VacancyType = {
	test: ({ questions: Question[] } & Test) | null;
	tags: ({ tag: Tag } & TagsOnVacancies)[];
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

const QuestionManagementModal = ({
	open,
	onCancel,
	vacancy,
	onAddQuestion,
	onEditQuestion,
	onDeleteQuestion,
}: {
	open: boolean;
	onCancel: () => void;
	vacancy: VacancyType | null;
	onAddQuestion: (question: Omit<Question, "id">) => void;
	onEditQuestion: (question: Question) => void;
	onDeleteQuestion: (questionId: number) => void;
}) => {
	const [form] = Form.useForm();
	const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
		null
	);
	const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
		null
	);

	useEffect(() => {
		if (vacancy?.test?.questions && editingQuestionId) {
			const question = vacancy.test.questions.find(
				(q) => q.id === editingQuestionId
			);
			if (question) {
				setCurrentQuestion(question);
				form.setFieldsValue({
					...question,
					correctAnswer: question.correctAnswer.toString(),
				});
			}
		} else {
			setCurrentQuestion(null);
			form.resetFields();
		}
	}, [editingQuestionId, vacancy, form]);

	const handleSubmit = async (values: any) => {
		if (currentQuestion) {
			// Edit existing question
			onEditQuestion({
				...currentQuestion,
				...values,
				correctAnswer: Number(values.correctAnswer),
			});
		} else {
			// Add new question
			onAddQuestion({
				...values,
				correctAnswer: Number(values.correctAnswer),
			});
		}
		onCancel();
		toast.success(
			currentQuestion ? "Вопрос обновлен!" : "Вопрос добавлен!"
		);
		setEditingQuestionId(null); // Reset to add mode after operation
	};

	const handleEdit = (id: number) => {
		setEditingQuestionId(id);
	};

	const handleCancelEdit = () => {
		setEditingQuestionId(null);
		form.resetFields();
	};

	return (
		<Modal
			title={currentQuestion ? "Редактировать вопрос" : "Добавить вопрос"}
			open={open}
			onCancel={onCancel}
			footer={null}
			className="w-full max-w-lg mx-auto"
		>
			<div className="flex flex-col gap-4">
				<Form form={form} layout="vertical" onFinish={handleSubmit}>
					<Item
						name="questionText"
						label="Вопрос"
						rules={[{ required: true, message: "Введите вопрос" }]}
					>
						<Input placeholder="Введите вопрос" />
					</Item>
					{Array.from({ length: 4 }, (_, i) => (
						<Item
							key={i}
							name={`option${i + 1}`}
							label={`Вариант ${i + 1}`}
							rules={[
								{
									required: true,
									message: `Введите вариант ${i + 1}`,
								},
							]}
						>
							<Input placeholder={`Вариант ${i + 1}`} />
						</Item>
					))}
					<Item
						name="correctAnswer"
						label="Правильный ответ (1-4)"
						rules={[
							{
								required: true,
								message: "Выберите правильный ответ",
							},
							{
								validator: (_, value) => {
									if (
										value &&
										(Number(value) < 1 || Number(value) > 4)
									) {
										return Promise.reject(
											"Должен быть между 1 и 4"
										);
									}
									return Promise.resolve();
								},
							},
						]}
					>
						<Input
							type="number"
							min={1}
							max={4}
							placeholder="Номер правильного ответа"
						/>
					</Item>
					<div className="flex justify-end gap-2">
						{currentQuestion && (
							<Button
								onClick={handleCancelEdit}
								className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
							>
								Отменить редактирование
							</Button>
						)}
						<Button
							onClick={onCancel}
							className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
						>
							Закрыть
						</Button>
						<Button
							type="primary"
							htmlType="submit"
							className="bg-blue-600 border-blue-600 hover:bg-blue-700"
						>
							{currentQuestion ? "Сохранить" : "Добавить"}
						</Button>
					</div>
				</Form>

				<List
					header={
						<div className="text-lg font-semibold">
							Существующие вопросы
						</div>
					}
					itemLayout="horizontal"
					dataSource={vacancy?.test?.questions || []}
					renderItem={(item) => (
						<>
							<List.Item
								actions={[
									<Button
										key="edit"
										onClick={() => {
											handleEdit(item.id);
											onCancel();
										}}
									>
										Редактировать
									</Button>,
								]}
							>
								<List.Item.Meta
									title={item.questionText}
									description={
										item.option1 +
										", " +
										item.option2 +
										", " +
										item.option3 +
										", " +
										item.option4
									}
								/>
								<List.Item
									actions={[
										<Button
											key="delete"
											danger
											onClick={() => {
												onDeleteQuestion(item.id);
												onCancel();
											}}
										>
											Удалить
										</Button>,
									]}
								></List.Item>
							</List.Item>
						</>
					)}
				/>
			</div>
		</Modal>
	);
};

export default function WorkPage({
	params,
}: {
	params: { id: string; workId: string };
}) {
	const { workId } = params;

	const [vacancies, setVacancies] = useState<VacancyType[]>([]);
	const [allTags, setAllTags] = useState<Tag[]>([]);
	const [newVacancyModalOpen, setNewVacancyModalOpen] = useState(false);
	const [editVacancyModalOpen, setEditVacancyModalOpen] = useState(false);
	const [newTestModalOpen, setNewTestModalOpen] = useState(false);
	const [editTestModalOpen, setEditTestModalOpen] = useState(false);
	const [selectedVacancy, setSelectedVacancy] = useState<VacancyType | null>(
		null
	);

	useEffect(() => {
		fetchData();
		fetchAllTags();
	}, []);

	const fetchData = async () => {
		const { data: vacancies } = await apiCall(
			"get",
			`/api/vacancies/${workId}`
		);
		setVacancies(vacancies);
	};

	const fetchAllTags = async () => {
		const { data: tags } = await apiCall("get", `/api/tags`);
		setAllTags(tags);
	};

	const handleAddVacancy = async (values: any) => {
		await apiCall("post", `/api/vacancies/${workId}`, values);
		fetchData();
		fetchAllTags();
		setNewVacancyModalOpen(false);
		toast.success("Вакансия добавлена!");
	};

	const handleEditVacancy = async (values: any) => {
		if (!selectedVacancy) return;
		const response = await apiCall(
			"put",
			`/api/vacancies/${selectedVacancy.id}`,
			values
		);
		setVacancies((prev) =>
			prev.map((v) => (v.id === selectedVacancy.id ? response.data : v))
		);
		setEditVacancyModalOpen(false);
		toast.success("Вакансия обновлена!");
	};

	const handleDeleteVacancy = async (id: number) => {
		await apiCall("delete", `/api/vacancies/${id}`);
		setVacancies((prev) => prev.filter((v) => v.id !== id));
		toast.success("Вакансия удалена!");
	};

	const handleCreateTest = async (vacancyId: number) => {
		await apiCall("post", `/api/vacancies/${vacancyId}/test`);
		fetchData();
		setNewTestModalOpen(false);
		toast.success("Тест создан!");
	};

	const handleDeleteTest = async (vacancyId: number) => {
		await apiCall("delete", `/api/vacancies/${vacancyId}/test`);
		fetchData();
		toast.success("Тест удален!");
	};

	const handleAddQuestion = async (values: any) => {
		if (!selectedVacancy?.test) return;
		await apiCall(
			"post",
			`/api/vacancies/${selectedVacancy.test.id}/test/question`,
			{
				...values,
				correctAnswer: Number(values.correctAnswer),
			}
		);
		fetchData();
		toast.success("Вопрос добавлен!");
	};

	const handleEditQuestion = async (question: Question) => {
		await apiCall(
			"put",
			`/api/vacancies/${question.testId}/test/question`,
			question
		);
		fetchData();
		toast.success("Вопрос обновлен!");
	};

	const handleDeleteQuestion = async (questionId: number) => {
		await apiCall("delete", `/api/vacancies/${questionId}/test/question`);
		fetchData();
		toast.success("Вопрос удален!");
	};

	return (
		<div className="p-4">
			<Toaster />
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-lg font-bold">Вакансии</h1>
				<Button
					type="primary"
					onClick={() => setNewVacancyModalOpen(true)}
				>
					Добавить вакансию
				</Button>
			</div>
			{vacancies && vacancies.length !== 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{vacancies.map((vacancy) => (
						<Card key={vacancy.id} title={vacancy.title}>
							<p>{vacancy.description}</p>
							<p className="text-green-500 font-bold my-2">
								{vacancy.salary} ₽
							</p>
							<TagsDisplay tags={vacancy.tags} />
							<div className="mt-4 flex flex-col gap-2">
								<Button
									onClick={() => {
										setSelectedVacancy(vacancy);
										setEditVacancyModalOpen(true);
									}}
								>
									Редактировать
								</Button>
								<Button
									danger
									onClick={() =>
										handleDeleteVacancy(vacancy.id)
									}
								>
									Удалить
								</Button>
								{vacancy.test ? (
									<>
										<h2 className="self-center pt-2 border-t-2 border-black w-full text-center mt-2">
											Управление тестом
										</h2>
										<Button
											onClick={() => {
												setSelectedVacancy(vacancy);
												setEditTestModalOpen(true);
											}}
										>
											Редактировать вопросы
										</Button>
										<Button
											danger
											onClick={() =>
												handleDeleteTest(vacancy.id)
											}
										>
											Удалить тест
										</Button>
									</>
								) : (
									<Button
										onClick={() => {
											setSelectedVacancy(vacancy);
											setNewTestModalOpen(true);
										}}
									>
										Создать тест
									</Button>
								)}
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Модальное окно для добавления вакансии */}
			<Modal
				title="Добавить вакансию"
				open={newVacancyModalOpen}
				onCancel={() => setNewVacancyModalOpen(false)}
				footer={null}
			>
				<Form layout="vertical" onFinish={handleAddVacancy}>
					<Form.Item
						name="title"
						label="Название"
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="description"
						label="Описание"
						rules={[{ required: true }]}
					>
						<TextArea rows={3} />
					</Form.Item>
					<Form.Item
						name="salary"
						label="Зарплата"
						rules={[{ required: true, type: "number" }]}
						normalize={(value) =>
							value ? Number(value) : undefined
						}
					>
						<Input type="number" />
					</Form.Item>
					<Form.Item
						name="tagsId"
						label="Теги"
						rules={[{ required: true }]}
					>
						<Select
							mode="multiple"
							placeholder="Выберите теги"
							options={allTags.map((tag) => ({
								value: tag.id,
								label: tag.name,
							}))}
						/>
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Добавить
						</Button>
					</Form.Item>
				</Form>
			</Modal>

			{/* Модальное окно для редактирования вакансии */}
			<Modal
				title="Редактировать вакансию"
				open={editVacancyModalOpen}
				onCancel={() => setEditVacancyModalOpen(false)}
				footer={null}
			>
				<Form
					layout="vertical"
					initialValues={selectedVacancy || {}}
					onFinish={handleEditVacancy}
				>
					<Form.Item
						name="title"
						label="Название"
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="description"
						label="Описание"
						rules={[{ required: true }]}
					>
						<TextArea rows={3} />
					</Form.Item>
					<Form.Item
						name="salary"
						label="Зарплата"
						rules={[{ required: true, type: "number" }]}
						normalize={(value) =>
							value ? Number(value) : undefined
						}
					>
						<Input type="number" />
					</Form.Item>
					<Form.Item
						name="tagsId"
						label="Теги"
						rules={[{ required: true }]}
					>
						<Select mode="multiple" placeholder="Выберите теги">
							{allTags.map((tag) => (
								<Option key={tag.id} value={tag.id}>
									{tag.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Сохранить
						</Button>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Создать тест"
				open={newTestModalOpen}
				onCancel={() => setNewTestModalOpen(false)}
				footer={null}
			>
				<Form
					onFinish={() =>
						handleCreateTest(selectedVacancy?.id as number)
					}
				>
					<Button type="primary" htmlType="submit" block>
						Создать
					</Button>
				</Form>
			</Modal>

			<QuestionManagementModal
				open={editTestModalOpen}
				onCancel={() => setEditTestModalOpen(false)}
				vacancy={selectedVacancy}
				onAddQuestion={handleAddQuestion}
				onEditQuestion={handleEditQuestion}
				onDeleteQuestion={handleDeleteQuestion}
			/>
		</div>
	);
}
