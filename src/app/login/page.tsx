"use client";

import { Applicant, Employer } from "@prisma/client";
import { Tabs, Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import type { TabsProps } from "antd";
import { isApplicant, isEmployer } from "@/lib/utils";

export default function LoginPage() {
	const [loading, setLoading] = useState(false);
	const [tab, setTab] = useState<"applicant" | "employer">("applicant");
	const router = useRouter();

	const onFinish = async (values: { email: string; password: string }) => {
		setLoading(true);
		try {
			const response = await axios.post("/api/auth/login", {
				...values,
				role: tab,
			});

			const { message, data } = response.data;

			if (response.status === 200) {
				// Устанавливаем cookies и выводим сообщение об успешном входе
				setCookie("id", data.id.toString());
				setCookie("role", data.role);
				toast.success(
					`Добро пожаловать, ${data.name || "пользователь"}!`
				);
				router.push("/");
			} else {
				// Обработка неожиданных ответов
				toast.error("Неожиданный ответ от сервера: " + message);
			}
		} catch (error: any) {
			if (error.response?.status === 404) {
				toast.error("Пользователь с таким email не найден");
			} else if (error.response?.status === 401) {
				toast.error("Неверный пароль");
			} else {
				toast.error("Сетевая ошибка: " + error.message);
			}
		} finally {
			setLoading(false);
		}
	};

	const items: TabsProps["items"] = [
		{
			key: "applicant",
			label: "Я соискатель",
			children: <LoginForm loading={loading} onFinish={onFinish} />,
		},
		{
			key: "employer",
			label: "Я работодатель",
			children: <LoginForm loading={loading} onFinish={onFinish} />,
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
					<h1 style={{ textAlign: "center", marginBottom: 24 }}>
						Вход в систему
					</h1>
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

function LoginForm({
	loading,
	onFinish,
}: {
	loading: boolean;
	onFinish: (values: { email: string; password: string }) => Promise<void>;
}) {
	return (
		<>
			<Form layout="vertical" onFinish={onFinish}>
				<Form.Item
					label="Email"
					name="email"
					rules={[
						{
							required: true,
							message: "Пожалуйста, введите email!",
						},
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
						Войти
					</Button>
				</Form.Item>
			</Form>
			<Link href="/registration">Я не зарегистрирован в системе!</Link>
		</>
	);
}
