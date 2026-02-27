import * as React from "react";
import { useState, useRef } from "react";
import { Input, Box, Popover, Button, Grid, Text, Flex, IconButton, Stack } from "@chakra-ui/react";
import Icon from "kloReact/components/Icon";

interface DateTimePickerProps {
	value: Date | null;
	onChange: (date: Date | null) => void;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
}

export default function DateTimePicker({ value, onChange, placeholder = "Select date and time", disabled = false, readOnly = false }: DateTimePickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [selectedHour, setSelectedHour] = useState(value ? value.getHours() : 12);
	const [selectedMinute, setSelectedMinute] = useState(value ? value.getMinutes() : 0);
	const inputRef = useRef<HTMLInputElement>(null);

	const formatDateTime = (date: Date | null) => {
		if (!date) return "";
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${day}/${month}/${year} ${hours}:${minutes}`;
	};

	const getDaysInMonth = (year: number, month: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (year: number, month: number) => {
		return new Date(year, month, 1).getDay();
	};

	const handleDateClick = (day: number) => {
		const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, selectedHour, selectedMinute);
		onChange(selectedDate);
	};

	const handleTimeChange = () => {
		if (value) {
			const updatedDate = new Date(value);
			updatedDate.setHours(selectedHour);
			updatedDate.setMinutes(selectedMinute);
			onChange(updatedDate);
		}
	};

	const handlePrevMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
	};

	const handleNow = () => {
		const now = new Date();
		onChange(now);
		setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
		setSelectedHour(now.getHours());
		setSelectedMinute(now.getMinutes());
		setIsOpen(false);
	};

	const handleClear = () => {
		onChange(null);
		setIsOpen(false);
	};

	const handleOk = () => {
		setIsOpen(false);
	};

	const renderCalendar = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const daysInMonth = getDaysInMonth(year, month);
		const firstDay = getFirstDayOfMonth(year, month);
		const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		const days: (number | null)[] = [];
		for (let i = 0; i < firstDay; i++) {
			days.push(null);
		}
		for (let i = 1; i <= daysInMonth; i++) {
			days.push(i);
		}

		const isSelected = (day: number) => {
			if (!value) return false;
			return value.getDate() === day && value.getMonth() === month && value.getFullYear() === year;
		};

		const isToday = (day: number) => {
			const today = new Date();
			return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
		};

		return (
			<Box p={3} bg="white" borderRadius="md" boxShadow="lg" minW="320px">
				{/* Month/Year Header with Navigation */}
				<Flex justify="space-between" align="center" mb={3}>
					<IconButton size="sm" variant="ghost" onClick={handlePrevMonth} aria-label="Previous month">
						<Icon name="md:chevron-left" size={20} />
					</IconButton>
					<Text fontWeight="semibold" fontSize="sm">
						{monthNames[month]} {year}
					</Text>
					<IconButton size="sm" onClick={handleNextMonth} aria-label="Next month">
						<Icon name="md:chevron-right" size={20} />
					</IconButton>
				</Flex>

				{/* Day Names */}
				<Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
					{dayNames.map((day) => (
						<Text key={day} fontSize="xs" fontWeight="medium" textAlign="center" color="gray.600">
							{day}
						</Text>
					))}
				</Grid>

				{/* Calendar Days */}
				<Grid templateColumns="repeat(7, 1fr)" gap={1} mb={3}>
					{days.map((day, index) =>
						day ?
							<Button
								key={index}
								size="sm"
								variant={isSelected(day) ? "solid" : "ghost"}
								colorScheme={
									isSelected(day) ? "teal"
									: isToday(day) ?
										"blue"
									:	"gray"
								}
								onClick={() => handleDateClick(day)}
								fontSize="xs"
								h="32px"
								minW="32px"
								p={0}>
								{day}
							</Button>
						:	<Box key={index} h="32px" />,
					)}
				</Grid>

				{/* Time Picker */}
				<Box borderTop="1px solid" borderColor="gray.200" pt={3} mb={3}>
					<Text fontSize="xs" fontWeight="medium" color="gray.600" mb={2}>
						Time
					</Text>
					<Flex gap={2} align="center">
						<Stack gap={0} flex={1}>
							<Text fontSize="xs" color="gray.500" textAlign="center">
								Hour
							</Text>
							<Input
								type="number"
								size="sm"
								min={0}
								max={23}
								value={selectedHour}
								onChange={(e) => {
									const hour = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
									setSelectedHour(hour);
									handleTimeChange();
								}}
								textAlign="center"
							/>
						</Stack>
						<Text fontSize="lg" fontWeight="bold" mt={4}>
							:
						</Text>
						<Stack gap={0} flex={1}>
							<Text fontSize="xs" color="gray.500" textAlign="center">
								Minute
							</Text>
							<Input
								type="number"
								size="sm"
								min={0}
								max={59}
								value={selectedMinute}
								onChange={(e) => {
									const minute = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
									setSelectedMinute(minute);
									handleTimeChange();
								}}
								textAlign="center"
							/>
						</Stack>
					</Flex>
				</Box>

				{/* Action Buttons */}
				<Flex gap={2} justify="space-between">
					<Button size="xs" variant="outline" onClick={handleNow} flex={1}>
						Now
					</Button>
					<Button size="xs" variant="outline" colorScheme="red" onClick={handleClear} flex={1}>
						Clear
					</Button>
					<Button size="xs" colorScheme="teal" onClick={handleOk} flex={1}>
						OK
					</Button>
				</Flex>
			</Box>
		);
	};

	return (
		<Popover.Root open={isOpen} onOpenChange={(e) => !disabled && !readOnly && setIsOpen(e.open)}>
			<Popover.Trigger asChild>
				<Box position="relative">
					<Input
						ref={inputRef}
						value={formatDateTime(value)}
						placeholder={placeholder}
						readOnly
						cursor={
							disabled ? "not-allowed"
							: readOnly ?
								"not-allowed"
							:	"pointer"
						}
						onClick={() => !disabled && !readOnly && setIsOpen(true)}
						bg={disabled || readOnly ? "gray.100" : "white"}
						pr="40px"
					/>
					<Box position="absolute" right="8px" top="50%" transform="translateY(-50%)" pointerEvents="none">
						<Icon name="md:access-time" size={20} color={disabled || readOnly ? "gray.400" : "gray.600"} />
					</Box>
				</Box>
			</Popover.Trigger>
			<Popover.Positioner>
				<Popover.Content width="auto">{renderCalendar()}</Popover.Content>
			</Popover.Positioner>
		</Popover.Root>
	);
}
