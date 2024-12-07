"use client";

import { Layout, Menu, Button, MenuProps } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

export default function EmployerSideBar() {
	const router = useRouter();
	const id = getCookie("id")?.toString();

	const employerItems: MenuItem[] = [
		{
			label: "Работы - главная",
			key: "works",
			onClick: () => router.push(`/employer/works/${id}`),
		},
		{
			label: "Профиль",
			key: "profile",
			onClick: () => router.push(`/employer/profile/${id}`),
		},
		{
			label: "Аналитика",
			key: "analytics",
			onClick: () => router.push(`/employer/analytics/${id}`),
		},
	];

	return (
		<Sider
			className="fixed left-0 top-0 h-full bg-gray-800 text-white"
			width={250}
			theme="dark"
		>
			<div className="flex flex-col justify-between h-full">
				<Menu theme="dark" mode="inline" items={employerItems} />
				<EmployerSideBar.UserBar id={id as string} router={router} />
			</div>
		</Sider>
	);
}

EmployerSideBar.UserBar = ({
	id,
	router,
}: {
	id: string;
	router: AppRouterInstance;
}) => {
	const [user, setUser] = useState<{ name: string; email: string } | null>(
		null
	);

	const fetchUserData = async () => {
		const response = await axios.get(`/api/user/employer/${id}`);
		setUser({
			name: response.data.name,
			email: response.data.email,
		});
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	const handleLogout = () => {
		deleteCookie("id");
		deleteCookie("role");
		router.push("/login");
	};

	return (
		<div className="px-4 py-4 border-t border-gray-600">
			{user && (
				<div className="mb-4 text-white">
					<div className="font-bold">{user.name}</div>
					<div className="text-sm opacity-80">{user.email}</div>
				</div>
			)}
			<Button
				type="primary"
				icon={<LogoutOutlined />}
				block
				onClick={handleLogout}
				className="bg-red-600 hover:bg-red-700"
			>
				Выйти
			</Button>
		</div>
	);
};
