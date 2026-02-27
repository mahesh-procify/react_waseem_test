import * as React from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { Box, Stack, Card, Flex, Text } from "@chakra-ui/react";
import Icon from "kloReact/components/Icon";

export interface ToastMessage {
	id: string;
	title: string;
	description?: string;
	type: "success" | "error" | "info" | "warning";
	duration?: number;
}

interface ToastContextType {
	showToast: (toast: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within ToastProvider");
	}
	return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const showToast = (toast: Omit<ToastMessage, "id">) => {
		const id = Date.now().toString();
		const newToast: ToastMessage = {
			id,
			...toast,
			duration: toast.duration || 3000,
		};
		setToasts((prev) => [...prev, newToast]);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
	return (
		<Box position="fixed" bottom={4} left="50%" transform="translateX(-50%)" zIndex={9999} maxW="400px" w="full" px={4}>
			<Stack gap={2}>
				{toasts.map((toast) => (
					<ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
				))}
			</Stack>
		</Box>
	);
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsExiting(true);
			setTimeout(() => onRemove(toast.id), 300);
		}, toast.duration);

		return () => clearTimeout(timer);
	}, [toast.id, toast.duration, onRemove]);

	const getColorScheme = () => {
		switch (toast.type) {
			case "success":
				return { bg: "green.500", icon: "check-circle" };
			case "error":
				return { bg: "red.500", icon: "x-circle" };
			case "warning":
				return { bg: "orange.500", icon: "alert-triangle" };
			case "info":
			default:
				return { bg: "blue.500", icon: "info" };
		}
	};

	const { bg, icon } = getColorScheme();

	return (
		<Card.Root
			bg={bg}
			color="white"
			p={3}
			shadow="lg"
			cursor="pointer"
			onClick={() => {
				setIsExiting(true);
				setTimeout(() => onRemove(toast.id), 300);
			}}
			css={{
				animation: isExiting ? "slideOut 0.3s ease-out forwards" : "slideIn 0.3s ease-out",
				"@keyframes slideIn": {
					from: { transform: "translateY(100%)", opacity: 0 },
					to: { transform: "translateY(0)", opacity: 1 },
				},
				"@keyframes slideOut": {
					from: { transform: "translateY(0)", opacity: 1 },
					to: { transform: "translateY(100%)", opacity: 0 },
				},
			}}>
			<Flex gap={3} align="start">
				<Box mt={0.5}>
					<Icon name={icon} size={20} color="white" />
				</Box>
				<Box flex="1">
					<Text fontWeight="semibold" fontSize="sm">
						{toast.title}
					</Text>
					{toast.description && (
						<Text fontSize="xs" mt={1} opacity={0.9}>
							{toast.description}
						</Text>
					)}
				</Box>
			</Flex>
		</Card.Root>
	);
};
