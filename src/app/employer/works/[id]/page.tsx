"use client";

import { Job } from "@prisma/client";
import { Button, Modal, Input } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EmployerWorks({ params }: { params: { id: string } }) {
	const { id: employerId } = params;
	const [works, setWorks] = useState<Job[]>([]);
	const [selectedWork, setSelectedJob] = useState<Job | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [newWork, setNewWork] = useState({ title: "", description: "" });
	const [isEditing, setIsEditing] = useState(false);

	const router = useRouter();

	const fetchWorks = async () => {
		try {
			const response = await axios.get(`/api/works/${employerId}`);
			const { message, data } = response.data;
			if (message === "Работы не найдены, создайте хотя бы одну!") {
				toast.error(message);
				return;
			}

			setWorks(data);
		} catch (error) {
			toast.error("Ошибка соединения \n " + error);
		}
	};

	const addWork = async () => {
		try {
			const response = await axios.post(`/api/works/${employerId}`, {
				...newWork,
			});
			const { message, data } = response.data;

			if (response.status === 500) {
				toast.error(message);
				return;
			}

			toast.success(message);
			setWorks((prev) => [...prev, data]);
			setIsModalOpen(false);
			setNewWork({ title: "", description: "" });
		} catch (error) {
			toast.error("Ошибка соединения \n " + error);
		}
	};

	const editWork = async () => {
		if (!selectedWork) return;
		try {
			const response = await axios.put(`/api/works/${selectedWork.id}`, {
				...newWork,
				employerId,
			});
			const { message, data } = response.data;

			if (response.status === 500) {
				toast.error(message);
				return;
			}

			toast.success(message);
			setWorks((prev) =>
				prev.map((work) => (work.id === selectedWork.id ? data : work))
			);
			setIsModalOpen(false);
			setNewWork({ title: "", description: "" });
			setSelectedJob(null);
			setIsEditing(false);
		} catch (error) {
			toast.error("Ошибка соединения \n " + error);
		}
	};

	const deleteWork = async (work: Job) => {
		try {
			await axios.delete(`/api/works/${work.id}`);
			setWorks((prev) => prev.filter((w) => w.id !== work.id));
			setSelectedJob(null);
			toast.success("Работа успешно удалена!");
		} catch (error) {
			toast.error("Ошибка соединения \n " + error);
		}
	};

	const handleDelete = (work: Job) => {
		toast((t) => (
			<div>
				<p>
					Вы уверены, что хотите удалить работу? Это удалит все
					связанные вакансии, тесты и отклики.
				</p>
				<div className="flex justify-end gap-2 mt-2">
					<Button
						danger
						onClick={() => {
							toast.dismiss(t.id);
							deleteWork(work);
						}}
					>
						Удалить
					</Button>
					<Button
						onClick={() => {
							toast.dismiss(t.id);
							setSelectedJob(null);
						}}
					>
						Отмена
					</Button>
				</div>
			</div>
		));
	};

	const openEditModal = (work: Job) => {
		setNewWork({ title: work.title, description: work.description });
		setSelectedJob(work);
		setIsEditing(true);
		setIsModalOpen(true);
	};

	useEffect(() => {
		fetchWorks();
	}, []);

	return (
		<div className="p-4">
			<Toaster />
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Мои работы</h1>
				<Button
					type="primary"
					onClick={() => {
						setNewWork({ title: "", description: "" });
						setIsEditing(false);
						setIsModalOpen(true);
					}}
				>
					Добавить работу
				</Button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{works.map((work) => (
					<div
						key={work.id}
						className="p-6 border rounded-lg shadow hover:shadow-lg transition"
					>
						<h2 className="text-lg font-bold mb-2">{work.title}</h2>
						<p className="text-gray-700 mb-4">{work.description}</p>
						<div className="flex flex-col gap-2">
							<Button
								type="primary"
								variant="solid"
								onClick={() =>
									router.push(`${employerId}/work/${work.id}`)
								}
							>
								Вакансии
							</Button>
							<Button
								type="default"
								variant="solid"
								onClick={() => openEditModal(work)}
							>
								Редактировать
							</Button>
							<Button
								type="default"
								variant="solid"
								danger
								onClick={() => {
									handleDelete(work);
								}}
							>
								Удалить
							</Button>
						</div>
					</div>
				))}
			</div>
			{/* Модальное окно для добавления/редактирования работы */}
			<Modal
				title={isEditing ? "Редактировать работу" : "Добавить работу"}
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={isEditing ? editWork : addWork}
				okText={isEditing ? "Сохранить изменения" : "Добавить"}
				cancelText="Отмена"
			>
				<Input
					placeholder="Название работы"
					value={newWork.title}
					onChange={(e) =>
						setNewWork({ ...newWork, title: e.target.value })
					}
					className="mb-2"
				/>
				<Input.TextArea
					placeholder="Описание работы"
					value={newWork.description}
					onChange={(e) =>
						setNewWork({ ...newWork, description: e.target.value })
					}
					rows={4}
				/>
			</Modal>
		</div>
	);
}
