import { getController } from "kloReact/core/BaseController";
import { useTransnode } from "kloReact/hooks/useTransnode";
// import * as React from "react";
import { useState, useEffect, memo, useRef } from "react";
import { Flex, Box, Card, Grid, Input, Field, Tabs, Table, Spinner, Text, Stack, Button, Dialog, IconButton } from "@chakra-ui/react";
import PageToolbar from "react_waseem_test/components/PageToolbar";
import ValueHelpSelect from "react_waseem_test/components/ValueHelpSelect";
import type p_sales_order from "react_waseem_test/controller/p_sales_order.controller";
import { p_sales_orderState } from "react_waseem_test/controller/p_sales_order.controller";

interface SalesItemCardProps {
	item: any;
	index: number;
	onEdit: (item: any, idx: number) => void;
	onDelete: (item: any, idx: number) => void;
}

// Memoized card component for mobile view of sales items
const SalesItemCard = memo(({ item, index, onEdit, onDelete }: SalesItemCardProps) => {
	return (
		<Card.Root size="sm" variant="outline" bg="white" borderColor="gray.200">
			<Card.Body>
				<Stack gap={2}>
					<Flex justify="space-between" align="center">
						<Text fontSize="sm" fontWeight="semibold" color="gray.700">
							Item ID:
						</Text>
						<Text fontSize="sm" color="teal.600" fontWeight="medium">
							{item.item_id ?? ""}
						</Text>
					</Flex>
					<Flex justify="space-between" align="center">
						<Text fontSize="sm" fontWeight="semibold" color="gray.700">
							Order ID:
						</Text>
						<Text fontSize="sm" color="gray.600">
							{item.order_id ?? ""}
						</Text>
					</Flex>
					<Flex justify="space-between" align="center">
						<Text fontSize="sm" fontWeight="semibold" color="gray.700">
							Quantity:
						</Text>
						<Text fontSize="sm" color="gray.600">
							{item.quantity ?? ""}
						</Text>
					</Flex>
					<Flex justify="flex-end" gap={2} mt={2}>
						<IconButton size="xs" variant="ghost" colorScheme="blue" aria-label="Edit item" onClick={() => onEdit(item, index)}>
							✏️
						</IconButton>
						<IconButton size="xs" variant="ghost" colorScheme="red" aria-label="Delete item" onClick={() => onDelete(item, index)}>
							🗑️
						</IconButton>
					</Flex>
				</Stack>
			</Card.Body>
		</Card.Root>
	);
});

export default function DetailPage(props) {
	const { internalscreenid } = props;
	const controller = getController(internalscreenid) as p_sales_order;

	// Subscribe to reactstate for UI state
	const state = useTransnode("reactstate", internalscreenid).state as p_sales_orderState;
	const transactionMode = state?.transactionMode;
	const isLoadingSalesItems = state?.isLoadingSalesItems;
	const showAddItemDialog = state?.showAddItemDialog;
	const newItemData = state?.newItemData;
	const isCreatingItem = state?.isCreatingItem;
	const showEditItemDialog = state?.showEditItemDialog;
	const editItemData = state?.editItemData;
	const isUpdatingItem = state?.isUpdatingItem;
	const showDeleteItemDialog = state?.showDeleteItemDialog;
	const deleteItemData = state?.deleteItemData;
	const isDeletingItem = state?.isDeletingItem;

	// Subscribe to order_detail transnode for order data (normalized)
	const { state: orderDetailState } = useTransnode("order_detail", internalscreenid);
	const activeOrderEnt = controller.tm.getTN("order_detail").getRawData(); // Get raw entity data if needed

	// Access the entity from normalized state
	const activeOrder = (orderDetailState as any)?.ids?.length > 0 ? (orderDetailState as any).entities[(orderDetailState as any).ids[0]] : null;

	// Subscribe to items transnode for sales items data
	const { state: itemsState } = useTransnode("items", internalscreenid);
	const salesItems = (itemsState as any)?.ids?.length > 0 ? (itemsState as any).ids.map((id) => (itemsState as any).entities[id]) : [];

	const [activeTab, setActiveTab] = useState("details");

	const isEditMode = transactionMode === "EDIT" || transactionMode === "CREATE";

	// Track the current order ID to detect entity changes
	const currentOrderId = activeOrder?.order_id;
	const lastFetchedOrderIdRef = useRef<string | null>(null);

	// Fetch sales items when the items tab is selected or when the entity changes
	useEffect(() => {
		if (activeTab === "items" && activeOrder && currentOrderId && lastFetchedOrderIdRef.current !== currentOrderId) {
			lastFetchedOrderIdRef.current = currentOrderId;
			controller.fetchSalesItems();
		}
	}, [activeTab, currentOrderId, activeOrder, controller]);

	const toolbarActions =
		isEditMode ?
			[
				{
					label: "",
					icon: "md:save",
					onClick: () => controller.onSave(),
					colorScheme: "teal",
					isPrimary: true,
				},
				{
					label: "",
					icon: "delete",
					onClick: () => controller.prepareDeleteActiveOrder(),
					colorScheme: "red",
					variant: "outline" as const,
				},
			]
		:	[
				{
					label: "",
					icon: "md:edit",
					onClick: () => controller.onEdit(),
					colorScheme: "teal",
					isPrimary: true,
				},
				{
					label: "",
					icon: "delete",
					onClick: () => controller.prepareDeleteActiveOrder(),
					colorScheme: "red",
					variant: "outline" as const,
				},
			];

	return (
		<Flex direction="column" height="100vh">
			<PageToolbar title="Order Details" actions={toolbarActions} onBack={() => controller.onBack()} />

			<Box flex="1" overflowY="auto">
				<Box p={{ base: 3, md: 4, lg: 6 }} maxW={{ base: "100%", md: "900px", lg: "1200px" }} mx="auto">
					<Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
						<Tabs.List>
							<Tabs.Trigger value="details">Order Details</Tabs.Trigger>
							<Tabs.Trigger value="items">Items</Tabs.Trigger>
						</Tabs.List>

						<Tabs.Content value="details">
							<Card.Root mt={4}>
								<Card.Header>
									<Card.Title fontSize={{ base: "lg", md: "xl" }}>Order Information</Card.Title>
									<Card.Description fontSize={{ base: "sm", md: "md" }}>{isEditMode ? "Update the order details below" : "View order details"}</Card.Description>
								</Card.Header>
								<Card.Body>
									<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={{ base: 4, md: 6 }}>
										<Field.Root>
											<Field.Label>Order ID</Field.Label>
											<Input value={activeOrder?.order_id ?? ""} readOnly bg="gray.100" cursor="not-allowed" />
										</Field.Root>

										<Field.Root>
											<Field.Label>Status</Field.Label>
											{isEditMode ?
												<ValueHelpSelect valueHelp={activeOrderEnt?.status_vh} value={activeOrder?.status ?? ""} displayValue={activeOrder?.status_desc} onChange={(value) => controller.updateActiveOrderField("status", value)} placeholder="Select status" />
											:	<Input value={activeOrder?.status_desc ?? ""} readOnly bg="gray.100" cursor="not-allowed" />}
										</Field.Root>

										<Field.Root>
											<Field.Label>Customer Name</Field.Label>
											<Input
												value={activeOrder?.customer_name ?? ""}
												onChange={(e) => {
													controller.updateActiveOrderField("customer_name", e.target.value);
												}}
												placeholder="Enter customer name"
												readOnly={!isEditMode}
												bg={!isEditMode ? "gray.100" : "white"}
												cursor={!isEditMode ? "not-allowed" : "text"}
											/>
										</Field.Root>

										<Field.Root>
											<Field.Label>Address</Field.Label>
											<Input
												value={activeOrder?.address ?? ""}
												onChange={(e) => {
													controller.updateActiveOrderField("address", e.target.value);
												}}
												placeholder="Enter address"
												readOnly={!isEditMode}
												bg={!isEditMode ? "gray.100" : "white"}
												cursor={!isEditMode ? "not-allowed" : "text"}
											/>
										</Field.Root>

										<Field.Root>
											<Field.Label>Pincode</Field.Label>
											<Input
												value={activeOrder?.pincode ?? ""}
												onChange={(e) => {
													controller.updateActiveOrderField("pincode", e.target.value);
												}}
												placeholder="Enter pincode"
												readOnly={!isEditMode}
												bg={!isEditMode ? "gray.100" : "white"}
												cursor={!isEditMode ? "not-allowed" : "text"}
											/>
										</Field.Root>

										<Field.Root>
											<Field.Label>Country</Field.Label>
											{isEditMode ?
												<ValueHelpSelect valueHelp={activeOrderEnt?.country_vh_vh} value={activeOrder?.country_vh ?? ""} displayValue={activeOrder?.country_vh_desc} onChange={(value) => controller.updateActiveOrderField("country_vh", value)} placeholder="Select country" />
											:	<Input value={activeOrder?.country_vh_desc ?? ""} readOnly bg="gray.100" cursor="not-allowed" />}
										</Field.Root>
									</Grid>
								</Card.Body>
							</Card.Root>
						</Tabs.Content>

						<Tabs.Content value="items">
							<Card.Root mt={4}>
								<Card.Header>
									<Flex justify="space-between" align="center" width="100%">
										<Box>
											<Card.Title fontSize={{ base: "lg", md: "xl" }}>Sales Items</Card.Title>
											<Card.Description fontSize={{ base: "sm", md: "md" }}>Items associated with this order</Card.Description>
										</Box>
										<Button
											size="sm"
											colorScheme="teal"
											onClick={() => {
												console.log("Add Item clicked, mode:", transactionMode);
												controller.openAddItemDialog();
											}}
											disabled={transactionMode !== "EDIT" && transactionMode !== "CREATE"}>
											Add Item
										</Button>
									</Flex>
								</Card.Header>
								<Card.Body>
									{isLoadingSalesItems ?
										<Flex justify="center" align="center" minH="200px">
											<Spinner size="lg" color="teal.500" />
											<Text ml={3} color="gray.600">
												Loading items...
											</Text>
										</Flex>
									: salesItems && salesItems.length > 0 ?
										<>
											{/* Mobile Card View */}
											<Stack gap={3} display={{ base: "flex", md: "none" }}>
												{salesItems.map((item, index) => (
													<SalesItemCard key={item.item_id || index} item={item} index={index} onEdit={(item, idx) => controller.openEditItemDialog(item, idx)} onDelete={(item, idx) => controller.openDeleteItemDialog(item, idx)} />
												))}
											</Stack>

											{/* Desktop Table View */}
											<Box overflowX="auto" display={{ base: "none", md: "block" }}>
												<Table.Root size="sm" variant="outline">
													<Table.Header>
														<Table.Row>
															<Table.ColumnHeader>Item ID</Table.ColumnHeader>
															<Table.ColumnHeader>Order ID</Table.ColumnHeader>
															<Table.ColumnHeader>Quantity</Table.ColumnHeader>
															<Table.ColumnHeader>Actions</Table.ColumnHeader>
														</Table.Row>
													</Table.Header>
													<Table.Body>
														{salesItems.map((item, index) => (
															<Table.Row key={item.item_id || index}>
																<Table.Cell>{item.item_id ?? ""}</Table.Cell>
																<Table.Cell>{item.order_id ?? ""}</Table.Cell>
																<Table.Cell>{item.quantity ?? ""}</Table.Cell>
																<Table.Cell>
																	<Flex gap={2}>
																		<IconButton size="xs" variant="ghost" colorScheme="blue" aria-label="Edit item" onClick={() => controller.openEditItemDialog(item, index)}>
																			✏️
																		</IconButton>
																		<IconButton size="xs" variant="ghost" colorScheme="red" aria-label="Delete item" onClick={() => controller.openDeleteItemDialog(item, index)}>
																			🗑️
																		</IconButton>
																	</Flex>
																</Table.Cell>
															</Table.Row>
														))}
													</Table.Body>
												</Table.Root>
											</Box>
										</>
									:	<Flex justify="center" align="center" minH="200px">
											<Text color="gray.500">No items found for this order</Text>
										</Flex>
									}
								</Card.Body>
							</Card.Root>
						</Tabs.Content>
					</Tabs.Root>
				</Box>
			</Box>

			{/* Add Sales Item Dialog */}
			<Dialog.Root
				open={showAddItemDialog}
				onOpenChange={(e) => {
					if (!e.open && !isCreatingItem) {
						controller.closeAddItemDialog();
					}
				}}>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content maxW="md">
						<Dialog.Header>
							<Dialog.Title>Add Sales Item</Dialog.Title>
							<Dialog.Description>Item ID will be auto-generated</Dialog.Description>
						</Dialog.Header>
						<Dialog.Body>
							<Stack gap={4}>
								<Field.Root>
									<Field.Label>Quantity</Field.Label>
									<Input type="number" placeholder="Enter quantity" value={newItemData?.quantity || 0} onChange={(e) => controller.updateNewItemField("quantity", e.target.value)} disabled={isCreatingItem} />
								</Field.Root>
							</Stack>
						</Dialog.Body>
						<Dialog.Footer>
							<Flex gap={3} justify="flex-end" width="100%">
								<Button variant="outline" onClick={() => controller.closeAddItemDialog()} disabled={isCreatingItem}>
									Cancel
								</Button>
								<Button colorScheme="teal" onClick={() => controller.createSalesItem()} loading={isCreatingItem}>
									Add
								</Button>
							</Flex>
						</Dialog.Footer>
						<Dialog.CloseTrigger disabled={isCreatingItem} />
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>

			{/* Edit Sales Item Dialog */}
			<Dialog.Root
				open={showEditItemDialog}
				onOpenChange={(e) => {
					if (!e.open && !isUpdatingItem) {
						controller.closeEditItemDialog();
					}
				}}>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content maxW="md">
						<Dialog.Header>
							<Dialog.Title>Edit Sales Item</Dialog.Title>
							<Dialog.Description>Item ID: {editItemData?.item_id}</Dialog.Description>
						</Dialog.Header>
						<Dialog.Body>
							<Stack gap={4}>
								<Field.Root>
									<Field.Label>Quantity</Field.Label>
									<Input type="number" placeholder="Enter quantity" value={editItemData?.quantity || 0} onChange={(e) => controller.updateEditItemField("quantity", e.target.value)} disabled={isUpdatingItem} />
								</Field.Root>
							</Stack>
						</Dialog.Body>
						<Dialog.Footer>
							<Flex gap={3} justify="flex-end" width="100%">
								<Button variant="outline" onClick={() => controller.closeEditItemDialog()} disabled={isUpdatingItem}>
									Cancel
								</Button>
								<Button colorScheme="teal" onClick={() => controller.updateSalesItem()} loading={isUpdatingItem}>
									Save
								</Button>
							</Flex>
						</Dialog.Footer>
						<Dialog.CloseTrigger disabled={isUpdatingItem} />
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>

			{/* Delete Sales Item Confirmation Dialog */}
			<Dialog.Root
				open={showDeleteItemDialog}
				onOpenChange={(e) => {
					if (!e.open && !isDeletingItem) {
						controller.closeDeleteItemDialog();
					}
				}}>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content maxW="md">
						<Dialog.Header>
							<Dialog.Title>Delete Sales Item</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Are you sure you want to delete item <strong>{deleteItemData?.item_id}</strong>? This action cannot be undone.
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Flex gap={3} justify="flex-end" width="100%">
								<Button variant="outline" onClick={() => controller.closeDeleteItemDialog()} disabled={isDeletingItem}>
									Cancel
								</Button>
								<Button colorScheme="red" onClick={() => controller.confirmDeleteSalesItem()} loading={isDeletingItem}>
									Delete
								</Button>
							</Flex>
						</Dialog.Footer>
						<Dialog.CloseTrigger disabled={isDeletingItem} />
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</Flex>
	);
}
