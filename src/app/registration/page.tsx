"use client";

import { Applicant, Employer } from "@prisma/client";
import { Tabs, Form, Input, Button } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { setCookie } from "cookies-next";
import { Toaster, toast } from "react-hot-toast";
import type { TabsProps } from "antd";

export default function RegistrationPage() {
	const [loading, setLoading] = useState(false);
	const [tab, setTab] = useState<"applicant" | "employer">("applicant");
	const router = useRouter();

	const onFinish = async (values: {
		name: string;
		email: string;
		password: string;
	}) => {
		setLoading(true);
		try {
			const response = await axios.post("/api/auth/registration", {
				...values,
				role: tab,
			});

			const user: Applicant | Employer = response.data.data;

			if (user && Object.keys(user).length > 0) {
				// Сохранение куки
				setCookie("id", user.id.toString());
				setCookie("role", tab);

				// Успех
				toast.success(response.data.message);
				router.push("/"); // Редирект на главную
			} else {
				throw new Error("Ошибка регистрации");
			}
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				"Произошла ошибка при регистрации";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	const items: TabsProps["items"] = [
		{
			key: "applicant",
			label: "Я соискатель",
			children: (
				<RegistrationForm loading={loading} onFinish={onFinish} />
			),
		},
		{
			key: "employer",
			label: "Я работодатель",
			children: (
				<RegistrationForm loading={loading} onFinish={onFinish} />
			),
		},
	];

	return (
		<>
			<Toaster />
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<div
					style={{
						width: 400,
						padding: 24,
						boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
						borderRadius: 8,
					}}
				>
					<Tabs
						defaultActiveKey="applicant"
						items={items}
						onChange={(key) =>
							setTab(key as "applicant" | "employer")
						}
					/>
				</div>
			</div>
		</>
	);
}

function RegistrationForm({
	loading,
	onFinish,
}: {
	loading: boolean;
	onFinish: (values: {
		name: string;
		email: string;
		password: string;
	}) => Promise<void>;
}) {
	return (
		<>
			<Form layout="vertical" onFinish={onFinish}>
				<Form.Item
					label="Имя"
					name="name"
					rules={[
						{
							required: true,
							message: "Пожалуйста, введите ваше имя!",
						},
					]}
				>
					<Input type="text" placeholder="Введите ваше имя" />
				</Form.Item>
				<Form.Item
					label="Email"
					name="email"
					rules={[
						{
							required: true,
							message: "Пожалуйста, введите email!",
						},
						{ type: "email", message: "Введите корректный email!" },
					]}
				>
					<Input type="email" placeholder="Введите ваш email" />
				</Form.Item>
				<Form.Item
					label="Пароль"
					name="password"
					rules={[
						{
							required: true,
							message: "Пожалуйста, введите пароль!",
						},
						{
							min: 6,
							message: "Пароль должен быть не менее 6 символов!",
						},
					]}
				>
					<Input.Password placeholder="Введите ваш пароль" />
				</Form.Item>
				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						loading={loading}
						block
					>
						Зарегистрироваться
					</Button>
				</Form.Item>
			</Form>
			<Link href="/login">Уже зарегистрированы? Войти</Link>
		</>
	);
}
