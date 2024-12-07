"use client";

import { Tag, TagsOnVacancies, Test, Vacancy } from "@prisma/client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Button, Card, Modal, Input, Select, Form } from "antd";

const { TextArea } = Input;
const { Option } = Select;

type VacancyType = {
	test: Test | null;
	tags: ({ tag: Tag } & TagsOnVacancies)[];
} & Vacancy;

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
	const [selectedVacancy, setSelectedVacancy] = useState<VacancyType | null>(
		null
	);

	const fetchAllTags = async () => {
		try {
			const response = await axios.get(`/api/tags`);
			const { data: tags } = response.data;
			setAllTags(tags);
		} catch (error) {
			toast.error("Ошибка получения тегов \n " + error);
		}
	};

	const fetchData = async () => {
		try {
			const response = await axios.get(`/api/vacancies/${workId}`);
			const { message, data: vacancies } = response.data;

			if (message) {
				toast.error(message);
				return;
			}
			setVacancies(vacancies);
		} catch (error) {
			toast.error("Ошибка соединения \n " + error);
		}
	};

	const addVacancy = async (values: {
		title: string;
		description: string;
		salary: number;
		tagsId: number[];
	}) => {
		try {
			const response = await axios.post(
				`/api/vacancies/${workId}`,
				values
			);
			toast.success(response.data.message);
			setVacancies((prev) => [...prev, response.data.data]);
			setNewVacancyModalOpen(false);
		} catch (error) {
			toast.error("Ошибка при добавлении вакансии");
		}
	};

	const editVacancy = async (values: {
		title: string;
		description: string;
		salary: number;
		tagsId: number[];
	}) => {
		if (!selectedVacancy) return;

		try {
			const response = await axios.put(
				`/api/vacancies/${selectedVacancy.id}`,
				values
			);
			toast.success(response.data.message);

			setVacancies((prev) =>
				prev.map((vacancy) =>
					vacancy.id === selectedVacancy.id
						? response.data.data
						: vacancy
				)
			);
			setEditVacancyModalOpen(false);
		} catch (error) {
			toast.error("Ошибка при редактировании вакансии");
		}
	};

	const deleteVacancy = async (vacancyId: number) => {
		try {
			await axios.delete(`/api/vacancies/${vacancyId}`);
			setVacancies((prev) => prev.filter((v) => v.id !== vacancyId));
			toast.success("Вакансия успешно удалена");
		} catch (error) {
			toast.error("Ошибка при удалении вакансии");
		}
	};

	useEffect(() => {
		fetchData();
		fetchAllTags();
	}, []);

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
			{vacancies.length !== 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{vacancies.map((vacancy) => (
						<Card key={vacancy.id} title={vacancy.title}>
							<p>{vacancy.description}</p>
							<p className="text-green-500 font-bold my-2">
								{vacancy.salary} ₽
							</p>
							{vacancy.tags && Array.isArray(vacancy.tags) ? (
								vacancy.tags.map((tag) => (
									<span
										key={tag.tag.id}
										className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
									>
										{tag.tag.name}
									</span>
								))
							) : (
								<span className="text-gray-500">
									Теги отсутствуют
								</span>
							)}
							<div className="mt-4 flex flex-col gap-2">
								<Button
									type="default"
									onClick={() => {
										setSelectedVacancy(vacancy);
										setEditVacancyModalOpen(true);
									}}
								>
									Редактировать
								</Button>
								<Button
									type="default"
									danger
									onClick={() => deleteVacancy(vacancy.id)}
								>
									Удалить
								</Button>
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
				<Form layout="vertical" onFinish={addVacancy}>
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
					onFinish={editVacancy}
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
		</div>
	);
}
