"use client";

import { Button, Form, Input, Card } from "antd";
import { Resume } from "@prisma/client";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

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

export default function ApplicantResumes({
	params,
}: {
	params: { id: string };
}) {
	const { id: applicantId } = params;

	const [resume, setResume] = useState<Resume | null>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const { data: resumeData } = await apiCall(
				"get",
				`/api/user/applicant/${applicantId}/resume`
			);

			setResume(resumeData);
			if (resumeData) {
				form.setFieldsValue({
					personalInfo: resumeData.personalInfo,
					workExperience: resumeData.workExperience,
				});
			} else {
				form.setFieldsValue({
					personalInfo: "",
					workExperience: "",
				});
			}
		} catch (error) {
			toast.error("Ошибка получения резюме \n " + error);
			setResume(null);
		}
	};

	const handleCreateResume = async (values: any) => {
		try {
			await apiCall(
				"post",
				`/api/user/applicant/${applicantId}/resume`,
				values
			);
			toast.success("Резюме успешно создано");
			fetchData();
		} catch (error) {
			toast.error("Ошибка создания резюме \n " + error);
		}
	};

	const handleEditResume = async (values: any) => {
		try {
			await apiCall(
				"put",
				`/api/user/applicant/${applicantId}/resume`,
				values
			);
			toast.success("Резюме успешно изменено");
			fetchData();
		} catch (error) {
			toast.error("Ошибка изменения резюме \n " + error);
		}
	};

	const handleDeleteResume = async () => {
		try {
			await apiCall(
				"delete",
				`/api/user/applicant/${applicantId}/resume`
			);
			toast.success("Резюме успешно удалено");
			setResume(null);
		} catch (error) {
			toast.error("Ошибка удаления резюме \n " + error);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<Toaster />
			<h1 className="text-3xl font-bold mb-6">Резюме</h1>
			{resume ? (
				<Card className="shadow-lg rounded-lg overflow-hidden">
					<Form
						form={form}
						onFinish={handleEditResume}
						layout="vertical"
						className="space-y-4"
					>
						<Form.Item
							name="personalInfo"
							label="Личная информация"
							rules={[
								{
									required: true,
									message:
										"Пожалуйста, введите личную информацию",
								},
							]}
						>
							<Input.TextArea
								rows={4}
								placeholder="Имя, фамилия, контакты, адрес..."
							/>
						</Form.Item>

						<Form.Item
							name="workExperience"
							label="Опыт работы"
							rules={[
								{
									required: true,
									message: "Пожалуйста, введите опыт работы",
								},
							]}
						>
							<Input.TextArea
								rows={6}
								placeholder="Описание вашего профессионального опыта..."
							/>
						</Form.Item>

						<div className="flex justify-between">
							<Button
								type="primary"
								htmlType="submit"
								className="bg-blue-600 text-white hover:bg-blue-700"
							>
								Сохранить изменения
							</Button>
							<Button
								danger
								onClick={handleDeleteResume}
								className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
							>
								Удалить резюме
							</Button>
						</div>
					</Form>
				</Card>
			) : (
				<Card className="shadow-lg rounded-lg overflow-hidden text-center p-6">
					<p className="mb-4">У вас нет резюме. Хотите создать?</p>
					<Form
						form={form}
						onFinish={handleCreateResume}
						layout="vertical"
						className="space-y-4"
					>
						<Form.Item
							name="personalInfo"
							label="Личная информация"
							rules={[
								{
									required: true,
									message:
										"Пожалуйста, введите личную информацию",
								},
							]}
						>
							<Input.TextArea
								rows={4}
								placeholder="Имя, фамилия, контакты, адрес..."
							/>
						</Form.Item>

						<Form.Item
							name="workExperience"
							label="Опыт работы"
							rules={[
								{
									required: true,
									message: "Пожалуйста, введите опыт работы",
								},
							]}
						>
							<Input.TextArea
								rows={6}
								placeholder="Описание вашего профессионального опыта..."
							/>
						</Form.Item>

						<Button
							type="primary"
							htmlType="submit"
							className="w-full bg-green-600 text-white hover:bg-green-700"
						>
							Создать резюме
						</Button>
					</Form>
				</Card>
			)}
		</div>
	);
}
