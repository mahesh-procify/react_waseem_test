import * as React from "react";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useTransnode } from "kloReact/hooks/useTransnode";
import { Table, Link, Checkbox, Flex, Box, Card, Stack, Text, Spinner, Dialog, Button, Portal } from "@chakra-ui/react";
import { getController } from "kloReact/core/BaseController";
import PageToolbar from "react_test2/components/PageToolbar";
import { NormalizedData } from "kloReact/Interfaces/kloReactInterfaces";
import type p_sales_order from "react_test2/controller/p_sales_order.controller";
import type { p_sales_orderState } from "react_test2/controller/p_sales_order.controller";

interface CardItemProps {
	itemId: string;
	item: any;
	isSelected: boolean;
	onToggleSelect: (itemId: string, checked: boolean) => void;
	onClickId: (e: any) => void;
}

// Memoized card component for mobile view
const CardItem = memo(({ itemId, item, isSelected, onToggleSelect, onClickId }: CardItemProps) => {
	const handleCardClick = (e) => {
		// Create a synthetic event that mimics clicking on the order_id link
		const syntheticEvent = {
			...e,
			target: {
				...e.target,
				innerText: item.order_id,
			},
			currentTarget: {
				...e.currentTarget,
				innerText: item.order_id,
			},
		};
		onClickId(syntheticEvent);
	};

	return (
		<Card.Root size="sm" variant="outline" bg={isSelected ? "teal.50" : "white"} borderColor={isSelected ? "teal.500" : "gray.200"}>
			<Card.Body>
				<Flex justify="space-between" align="start" gap={3}>
					<Checkbox.Root size="sm" mt={1} aria-label="Select order" checked={isSelected} onCheckedChange={(changes) => onToggleSelect(itemId, !!changes.checked)}>
						<Checkbox.HiddenInput />
						<Checkbox.Control />
					</Checkbox.Root>
					<Stack gap={2} flex="1" onClick={handleCardClick} cursor="pointer" data-item-id={itemId}>
						<Flex justify="space-between" align="center">
							<Link colorPalette="teal" fontWeight="semibold" fontSize="md">
								{item.order_id}
							</Link>
							<Text fontSize="sm" color="gray.600" fontWeight="medium">
								{item.status}
							</Text>
						</Flex>
						<Text fontSize="sm" color="gray.700">
							{item.customer_name}
						</Text>
						<Text fontSize="sm" color="gray.500">
							{item.pincode}
						</Text>
					</Stack>
				</Flex>
			</Card.Body>
		</Card.Root>
	);
});

interface TableRowItemProps {
	itemId: string;
	item: any;
	isSelected: boolean;
	onToggleSelect: (itemId: string, checked: boolean) => void;
	onClickId: (e: any) => void;
}

// Memoized row component to prevent re-rendering all rows on selection change
const TableRowItem = memo(({ itemId, item, isSelected, onToggleSelect, onClickId }: TableRowItemProps) => {
	return (
		<Table.Row data-selected={isSelected ? "" : undefined}>
			<Table.Cell>
				<Checkbox.Root size="sm" mt="0.5" aria-label="Select row" checked={isSelected} onCheckedChange={(changes) => onToggleSelect(itemId, !!changes.checked)}>
					<Checkbox.HiddenInput />
					<Checkbox.Control />
				</Checkbox.Root>
			</Table.Cell>
			<Table.Cell>
				<Link colorPalette="teal" onClick={onClickId}>
					{item.order_id}
				</Link>
			</Table.Cell>
			<Table.Cell>{item.status}</Table.Cell>
			<Table.Cell>{item.status_desc}</Table.Cell>
			<Table.Cell>{item.country_vh_desc}</Table.Cell>
			<Table.Cell display={{ base: "none", md: "table-cell" }}>{item.pincode}</Table.Cell>
			<Table.Cell>{item.customer_name}</Table.Cell>
			{/* <Table.Cell>{item.address}</Table.Cell> */}
		</Table.Row>
	);
});

export default function MyPage(props) {
	const { navParams, internalscreenid } = props;
	const controller = getController(internalscreenid) as p_sales_order;

	// Subscribe to the reactstate TransNode for UI-specific state
	const { state } = useTransnode("reactstate", internalscreenid);

	// Subscribe to the orders TransNode for orders data (auto-normalized)
	const { state: ordersState } = useTransnode("orders", internalscreenid);

	// Extract state properties
	const items = ordersState as NormalizedData; // This is { ids: [...], entities: {...} } from auto-normalization
	const isDeleteing = (state as p_sales_orderState)?.isDeleteing;
	const showDeleteDialog = (state as p_sales_orderState)?.showDeleteDialog;
	const showMessageDialog = (state as p_sales_orderState)?.showMessageDialog;
	const messageDialogTitle = (state as p_sales_orderState)?.messageDialogTitle;
	const messageDialogMessage = (state as p_sales_orderState)?.messageDialogMessage;
	const pendingDeleteData = (state as p_sales_orderState)?.pendingDeleteData;
	const shouldClearSelection = (state as p_sales_orderState)?.shouldClearSelection;

	// Use Set for O(1) lookup performance, storing item IDs instead of indices
	const [selection, setSelection] = useState<Set<string>>(new Set());

	const indeterminate = useMemo(() => selection.size > 0 && selection.size < items?.ids?.length, [selection.size, items?.ids?.length]);

	useEffect(() => {
		// Fetch items and set up property change monitoring
		controller.fetchItems();
	}, []);

	// Memoize handlers for better performance
	const handleSelectAll = useCallback(
		(changes) => {
			if (changes.checked && items?.ids) {
				setSelection(new Set(items.ids));
			} else {
				setSelection(new Set());
			}
		},
		[items],
	);

	const handleDelete = useCallback(() => {
		if (!items?.ids) return;

		// Pass the selected entity IDs directly
		const selectedIds = Array.from(selection) as string[];
		controller.prepareDelete(selectedIds);
	}, [controller, selection, items]);

	// Clear selection after successful delete
	useEffect(() => {
		if (shouldClearSelection) {
			setSelection(new Set());
			controller.resetClearSelectionFlag();
		}
	}, [shouldClearSelection, controller]);

	// Stable callback for toggling individual row selection
	const handleToggleSelect = useCallback((itemId: string, checked: boolean) => {
		setSelection((prev) => {
			const newSet = new Set(prev);
			if (checked) {
				newSet.add(itemId);
			} else {
				newSet.delete(itemId);
			}
			return newSet;
		});
	}, []);

	// Stable callback for clicking ID
	const handleClickId = useCallback(
		(e) => {
			controller.onClickId(e);
		},
		[controller],
	);

	const toolbarActions = [
		{
			label: "Add",
			icon: "md:add",
			onClick: () => controller.onAddNewItem(),
			colorScheme: "teal",
			isPrimary: true,
		},
		{
			label: "",
			icon: "save",
			onClick: () => controller.onSave(),
			colorScheme: "teal",
			variant: "outline" as const,
		},
		{
			label: "",
			icon: "delete",
			onClick: handleDelete,
			colorScheme: "red",
			variant: "outline" as const,
			loading: isDeleteing,
			loadingText: "Deleting...",
		},
	];

	return (
		<>
			<PageToolbar title="Sales Orders" actions={toolbarActions} />

			{/* Mobile Card View */}
			<Box display={{ base: "block", md: "none" }} p={3}>
				{!items?.ids || items.ids.length === 0 ?
					<Flex justify="center" align="center" py={8}>
						<Spinner size="lg" color="teal.500" />
					</Flex>
				:	<Stack gap={3}>
						{items.ids.map((id) => (
							<CardItem key={id} itemId={id} item={items.entities[id]} isSelected={selection.has(id)} onToggleSelect={handleToggleSelect} onClickId={handleClickId} />
						))}
					</Stack>
				}
			</Box>

			{/* Desktop Table View */}
			<Box display={{ base: "none", md: "block" }} overflowX="auto">
				<Table.Root size={{ base: "sm", md: "md" }} stickyHeader>
					<Table.Header>
						<Table.Row>
							<Table.ColumnHeader w="6">
								<Checkbox.Root size="sm" mt="0.5" aria-label="Select all rows" checked={indeterminate ? "indeterminate" : selection.size > 0} onCheckedChange={handleSelectAll}>
									<Checkbox.HiddenInput />
									<Checkbox.Control />
								</Checkbox.Root>
							</Table.ColumnHeader>
							<Table.ColumnHeader>Order ID</Table.ColumnHeader>
							<Table.ColumnHeader>Status</Table.ColumnHeader>
							<Table.ColumnHeader>Status Description</Table.ColumnHeader>
							<Table.ColumnHeader>Country</Table.ColumnHeader>
							<Table.ColumnHeader display={{ base: "none", md: "table-cell" }}>Pincode</Table.ColumnHeader>
							<Table.ColumnHeader>Customer Name</Table.ColumnHeader>
							{/* <Table.ColumnHeader>Address</Table.ColumnHeader> */}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{!items?.ids || items.ids.length === 0 ?
							<Table.Row>
								<Table.Cell colSpan={7} textAlign="center" py={8}>
									<Flex justify="center" align="center">
										<Spinner size="lg" color="teal.500" />
									</Flex>
								</Table.Cell>
							</Table.Row>
						:	items.ids.map((id) => <TableRowItem key={id} itemId={id} item={items.entities[id]} isSelected={selection.has(id)} onToggleSelect={handleToggleSelect} onClickId={handleClickId} />)}
					</Table.Body>
				</Table.Root>
			</Box>

			{/* Delete Confirmation Dialog */}
			<Dialog.Root open={showDeleteDialog} onOpenChange={(e) => !e.open && controller.cancelDelete()}>
				<Portal>
					<Dialog.Backdrop />
					<Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>Confirm Delete</Dialog.Title>
							</Dialog.Header>
							<Dialog.Body>
								<Text>
									Are you sure you want to delete {pendingDeleteData?.selection.length} selected item{pendingDeleteData?.selection.length !== 1 ? "s" : ""}? This action cannot be undone.
								</Text>
							</Dialog.Body>
							<Dialog.Footer>
								<Button variant="outline" onClick={() => controller.cancelDelete()}>
									Cancel
								</Button>
								<Button colorPalette="red" onClick={() => controller.confirmDelete()} ml={3}>
									Delete
								</Button>
							</Dialog.Footer>
							<Dialog.CloseTrigger />
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>

			{/* Message Dialog */}
			<Dialog.Root open={showMessageDialog} onOpenChange={(e) => !e.open && controller.closeMessageDialog()}>
				<Portal>
					<Dialog.Backdrop />
					<Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>{messageDialogTitle}</Dialog.Title>
							</Dialog.Header>
							<Dialog.Body>
								<Text>{messageDialogMessage}</Text>
							</Dialog.Body>
							<Dialog.Footer>
								<Button onClick={() => controller.closeMessageDialog()}>OK</Button>
							</Dialog.Footer>
							<Dialog.CloseTrigger />
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>
		</>
	);
}
