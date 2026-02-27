// import { KloController } from "kloTouch/jspublic/KloController";
import type { KloEntitySet } from "kloBo/KloEntitySet";
import BaseController from "kloReact/core/BaseController";
import { BaseControllerState } from "kloReact/Interfaces/kloReactInterfaces";
import type { d_sales_order } from "react_waseem_test/entity_gen/d_sales_order";
import { toastManager } from "react_waseem_test/util/toaster";
import { TransNode } from "kloReact/core/Transnode";
// import { KloTransaction } from "kloBo/KloTransaction";
// declare let KloUI5: any;
// @KloUI5("eam.controller.p_sales_order")

export type TransactionMode = "DISPLAY" | "EDIT" | "CREATE";

export interface p_sales_orderState extends BaseControllerState {
	isDeleteing: boolean;
	transactionMode: TransactionMode;
	showDeleteDialog: boolean;
	showMessageDialog: boolean;
	messageDialogTitle: string;
	messageDialogMessage: string;
	pendingDeleteData: { selection: string[] } | null;
	shouldClearSelection: boolean;
	isLoadingSalesItems: boolean;
	showAddItemDialog: boolean;
	newItemData: { quantity: number };
	isCreatingItem: boolean;
	showEditItemDialog: boolean;
	isUpdatingItem: boolean;
	showDeleteItemDialog: boolean;
	deleteItemData: { item_id: string; index: number } | null;
	isDeletingItem: boolean;
	showDeleteOrderDialog: boolean;
	isDeletingOrder: boolean;
	editItemData: any;
	salesItems: any[];
	activeOrderEntity: d_sales_order | null;
	activeOrderId: string | null;
	activeOrder: d_sales_order | null;
}

export default class p_sales_order extends BaseController {
	async onAddNewItem() {
		try {
			const tn = this.tm.getTN("reactstate");
			const ordersTN = this.tm.getTN("orders");

			// Get the raw orders entityset
			const entitySet = ordersTN.getRawData() as KloEntitySet<d_sales_order>;

			if (!entitySet) {
				console.error("Orders entityset not found");
				return;
			}

			// Switch to CREATE mode
			tn.setProperty("transactionMode", "CREATE");

			// Navigate to detail page
			this.navTo({ S: "p_sales_order", C: "p_detail_test", F: "react_waseem_test" });

			// Create a new entity (this adds it to the entitySet)
			const newEntity = await entitySet.newEntityP(0);

			// Update the orders TransNode (will auto-normalize)
			await ordersTN.setData(entitySet);

			// Store the new entity in order_detail TransNode
			const orderDetailTN = this.tm.getTN("order_detail");
			await orderDetailTN.setData(newEntity);

			// Clear items transnode to ensure fresh data is loaded
			const itemsTN = this.tm.getTN("items");
			await itemsTN.setData(null);
		} catch (error) {
			console.error("Error creating new order:", error);
		}
	}
	// public onInit() {}
	// public onBeforeRendering() {}
	// public onAfterRendering() {}
	// public onExit() {}

	constructor(initialState?: p_sales_orderState) {
		super(initialState);
		// State initialization now happens in initializeReactState() after setPage() is called
	}

	/**
	 * Initialize the TransNode with the full state structure
	 * Called after the page is attached and TransNode is available
	 */
	private initializeReactState() {
		try {
			const tn = this.tm.getTN("reactstate");
			const currentData = tn.getData() || {};

			// Merge metadata state with controller state
			const fullState: p_sales_orderState = {
				name: "p_sales_order",
				isDeleteing: false,
				transactionMode: "DISPLAY",
				showDeleteDialog: false,
				showMessageDialog: false,
				messageDialogTitle: "",
				messageDialogMessage: "",
				pendingDeleteData: null,
				shouldClearSelection: false,
				isLoadingSalesItems: false,
				showAddItemDialog: false,
				newItemData: { quantity: 0 },
				isCreatingItem: false,
				showEditItemDialog: false,

				isUpdatingItem: false,
				showDeleteItemDialog: false,
				deleteItemData: null,
				isDeletingItem: false,
				showDeleteOrderDialog: false,
				isDeletingOrder: false,
				editItemData: null,
				salesItems: [],
				activeOrderEntity: null,
				activeOrderId: null,
				activeOrder: null,
			};

			tn.setData(fullState);
		} catch (error) {
			console.error("Failed to initialize react state:", error);
		}
	}

	async onClickId(e: Event) {
		const tn = this.tm.getTN("reactstate");
		const ordersTN = this.tm.getTN("orders");

		// Get the raw orders entityset
		const ordersEntitySet = ordersTN.getRawData() as KloEntitySet<d_sales_order>;

		if (!ordersEntitySet) {
			console.error("Orders entityset not found");
			return;
		}

		// Find the clicked order by order_id
		const clickedOrderId = (e?.target as HTMLElement)?.innerText;
		let clickedOrderEntity: d_sales_order | undefined;

		for (const order of ordersEntitySet) {
			if (order.order_id === clickedOrderId) {
				clickedOrderEntity = order;
				break;
			}
		}

		if (!clickedOrderEntity) {
			console.error("Clicked order not found:", clickedOrderId);
			return;
		}

		// Store the clicked entity in order_detail TransNode
		const orderDetailTN = this.tm.getTN("order_detail");
		await orderDetailTN.setData(clickedOrderEntity);

		// Clear items transnode to ensure fresh data is loaded
		const itemsTN = this.tm.getTN("items");
		await itemsTN.setData(null);

		tn.setProperty("transactionMode", "DISPLAY");
		this.navTo({ S: "p_sales_order", C: "p_detail_test", F: "react_waseem_test" });
	}

	updateActiveOrderField(field: string, value: string) {
		const orderDetailTN = this.tm.getTN("order_detail");
		const orderEntity = orderDetailTN.getRawData() as d_sales_order;

		// Update the entity object directly (for persistence)
		if (orderEntity) {
			orderEntity[field] = value;
			// Re-normalize to trigger UI update
			orderDetailTN.setData(orderEntity);
		}
	}

	onBack() {
		// Navigate back to list
		window.history.back();
	}

	onEdit() {
		// Switch to edit mode
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("transactionMode", "EDIT");
	}

	async onSave() {
		try {
			const tn = this.tm.getTN("reactstate");
			const ordersTN = this.tm.getTN("orders");
			const prevState = tn.getData() as p_sales_orderState;
			const isCreateMode = prevState.transactionMode === "CREATE";

			// Save the order by committing the transaction
			await this.commitP();

			// Get the raw orders entityset and update the TransNode (will auto-normalize)
			const orders = ordersTN.getRawData() as KloEntitySet<d_sales_order>;
			if (orders) {
				await ordersTN.setData(orders);
			}

			// Show success message
			toastManager.show({
				title: "Save successful",
				type: "success",
				duration: 3000,
			});

			if (isCreateMode) {
				// In CREATE mode, navigate back to the list page
				this.onBack();
			} else {
				// In EDIT mode, refresh order_detail TransNode and switch back to display mode
				const orderDetailTN = this.tm.getTN("order_detail");
				const orderEntity = orderDetailTN.getRawData() as d_sales_order;
				if (orderEntity) {
					await orderDetailTN.setData(orderEntity);
				}
				tn.setProperty("transactionMode", "DISPLAY");
			}
		} catch (error) {
			console.error("Error saving order:", error);
			// Show error message
			toastManager.show({
				title: "Error",
				description: "Failed to save order: " + String(error),
				type: "error",
				duration: 5000,
			});
		}
	}

	prepareDeleteActiveOrder() {
		// Show confirmation dialog for deleting the active order
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showDeleteOrderDialog", true);
	}

	cancelDeleteActiveOrder() {
		// Close the delete order confirmation dialog
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showDeleteOrderDialog", false);
	}

	async confirmDeleteActiveOrder() {
		// Delete the active order after confirmation
		const tn = this.tm.getTN("reactstate");
		const orderDetailTN = this.tm.getTN("order_detail") as TransNode;
		const ordersTN = this.tm.getTN("orders") as TransNode;

		// Set deleting state
		tn.setProperty("isDeletingOrder", true);
		tn.setProperty("showDeleteOrderDialog", false);

		try {
			// Delete the entity from order_detail TransNode
			const deleted = await orderDetailTN.deleteEntity();

			if (!deleted) {
				throw new Error("Failed to delete order");
			}

			// Commit the transaction to save changes
			await this.transaction.commitP();

			// Re-fetch the orders from backend to update the list
			const query = await this.transaction.getQueryP("d_sales_order");
			query.setLoadAll(true);
			const result = await query.executeP();
			await query.loadAllValuehelp(["status", "country_vh"]);
			await ordersTN.setData(result);

			// Reset state
			tn.setProperty("isDeletingOrder", false);

			toastManager.show({
				title: "Success",
				description: "Order deleted successfully",
				type: "success",
				duration: 3000,
			});

			// Navigate back to list
			this.onBack();
		} catch (error) {
			console.error("Error deleting order:", error);
			tn.setProperty("isDeletingOrder", false);
			toastManager.show({
				title: "Error",
				description: "Failed to delete order: " + String(error),
				type: "error",
				duration: 5000,
			});
		}
	}

	async fetchSalesItems() {
		const tn = this.tm.getTN("reactstate");
		const itemsTN = this.tm.getTN("items");
		const prevState = tn.getData() as p_sales_orderState;

		// Set loading state
		tn.setProperty("isLoadingSalesItems", true);

		try {
			// Get the active order entity from order_detail TransNode
			const orderDetailTN = this.tm.getTN("order_detail");
			const activeEntity = orderDetailTN.getRawData() as d_sales_order;

			if (!activeEntity) {
				console.error("No active order entity available");
				tn.setProperty("isLoadingSalesItems", false);
				return;
			}

			// Fetch the sales items associated with this order (KloEntitySet)
			const items = await activeEntity.d_sales_order_d_sales_items.fetch();

			// Store the KloEntitySet in items TransNode (will auto-normalize)
			await itemsTN.setData(items);

			tn.setProperty("isLoadingSalesItems", false);
		} catch (error) {
			console.error("Error fetching sales items:", error);
			tn.setProperty("isLoadingSalesItems", false);
			// Set empty array on error to indicate loaded but empty
			itemsTN.setData([]);
			toastManager.show({
				title: "Error",
				description: "Failed to load items: " + String(error),
				type: "error",
				duration: 5000,
			});
		}
	}

	openAddItemDialog() {
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showAddItemDialog", true);
		tn.setProperty("newItemData", { quantity: 0 });
	}

	closeAddItemDialog() {
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showAddItemDialog", false);
		tn.setProperty("newItemData", { quantity: 0 });
	}

	updateNewItemField(field: "quantity", value: any) {
		const tn = this.tm.getTN("reactstate");
		const prevState = tn.getData() as p_sales_orderState;
		tn.setProperty("newItemData", {
			...prevState.newItemData,
			[field]: value,
		});
	}

	async createSalesItem() {
		const tn = this.tm.getTN("reactstate");
		const prevState = tn.getData() as p_sales_orderState;
		const { quantity } = prevState.newItemData;

		// Get the active order entity from order_detail TransNode
		const orderDetailTN = this.tm.getTN("order_detail");
		const activeEntity = orderDetailTN.getRawData() as d_sales_order;

		if (!activeEntity) {
			toastManager.show({
				title: "Error",
				description: "No active order found",
				type: "error",
				duration: 3000,
			});
			return;
		}

		// Set creating state
		tn.setProperty("isCreatingItem", true);

		try {
			// Create new sales item entity in the relation (item_id is auto-generated)
			const newItem = await activeEntity.d_sales_order_d_sales_items.newEntityP(null, {
				quantity: Number(quantity) || 0,
			});

			// Commit the transaction to persist the new item
			await this.transaction.commitP();

			// Close dialog
			tn.setProperty("showAddItemDialog", false);
			tn.setProperty("newItemData", { quantity: 0 });
			tn.setProperty("isCreatingItem", false);

			// Refresh the sales items list
			await this.fetchSalesItems();

			toastManager.show({
				title: "Success",
				description: "Sales item created successfully",
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error("Error creating sales item:", error);
			tn.setProperty("isCreatingItem", false);
			toastManager.show({
				title: "Error",
				description: "Failed to create sales item: " + String(error),
				type: "error",
				duration: 5000,
			});
		}
	}

	async openEditItemDialog(item: any, index: number) {
		try {
			const tn = this.tm.getTN("reactstate");
			const itemDetailTN = this.tm.getTN("item_detail");

			// Get the active order entity from order_detail TransNode
			const orderDetailTN = this.tm.getTN("order_detail");
			const orderEntity = orderDetailTN.getRawData() as d_sales_order;

			if (!orderEntity) {
				console.error("No active order entity available");
				return;
			}

			// Get the items relation and find the actual entity
			const itemsRelation = orderEntity.d_sales_order_d_sales_items;
			await itemsRelation.fetch();

			const itemEntity = itemsRelation.find((i: any) => i.item_id === item.item_id);

			if (!itemEntity) {
				console.error("Item entity not found");
				return;
			}

			// Store the item entity in item_detail TransNode
			await itemDetailTN.setData(itemEntity);

			// Show the dialog
			tn.setProperty("showEditItemDialog", true);
		} catch (error) {
			console.error("Error opening edit item dialog:", error);
		}
	}

	closeEditItemDialog() {
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showEditItemDialog", false);
	}

	updateEditItemField(field: "quantity", value: any) {
		const itemDetailTN = this.tm.getTN("item_detail");
		const itemEntity = itemDetailTN.getRawData();

		// Update the entity object directly (for persistence)
		if (itemEntity) {
			itemEntity[field] = value;
			// Re-normalize to trigger UI update
			itemDetailTN.setData(itemEntity);
		}
	}

	async updateSalesItem() {
		const tn = this.tm.getTN("reactstate");
		const itemDetailTN = this.tm.getTN("item_detail");
		const itemEntity = itemDetailTN.getRawData();

		if (!itemEntity) {
			toastManager.show({
				title: "Error",
				description: "No item data available",
				type: "error",
				duration: 3000,
			});
			return;
		}

		// Set updating state
		tn.setProperty("isUpdatingItem", true);

		try {
			// The item entity is already updated by updateEditItemField
			// Just commit the transaction to save changes

			// Commit the transaction to save changes
			await this.transaction.commitP();

			// Close dialog
			tn.setProperty("showEditItemDialog", false);
			tn.setProperty("isUpdatingItem", false);

			// Refresh the sales items list
			await this.fetchSalesItems();

			toastManager.show({
				title: "Success",
				description: "Sales item updated successfully",
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error("Error updating sales item:", error);
			tn.setProperty("isUpdatingItem", false);
			toastManager.show({
				title: "Error",
				description: "Failed to update sales item: " + String(error),
				type: "error",
				duration: 5000,
			});
		}
	}

	openDeleteItemDialog(item: any, index: number) {
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showDeleteItemDialog", true);
		tn.setProperty("deleteItemData", {
			item_id: item.item_id,
			index: index,
		});
	}

	closeDeleteItemDialog() {
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showDeleteItemDialog", false);
		tn.setProperty("deleteItemData", null);
	}

	async confirmDeleteSalesItem() {
		const tn = this.tm.getTN("reactstate");
		const itemsTN = this.tm.getTN("items");
		const prevState = tn.getData() as p_sales_orderState;
		const deleteData = prevState.deleteItemData;

		if (!deleteData) {
			toastManager.show({
				title: "Error",
				description: "No item data available",
				type: "error",
				duration: 3000,
			});
			return;
		}

		// Set deleting state
		tn.setProperty("isDeletingItem", true);

		try {
			// Get the raw entityset to find the entity's unique key
			const itemsEntitySet = itemsTN.getRawData() as KloEntitySet<any>;

			if (!itemsEntitySet) {
				throw new Error("Items entityset not found");
			}

			// Find the entity by item_id and get its unique key
			let entityKey: string | null = null;
			for (const item of itemsEntitySet) {
				if (item.item_id === deleteData.item_id) {
					entityKey = item.getEntityUniqueKey();
					break;
				}
			}

			if (!entityKey) {
				throw new Error("Item not found");
			}

			// Delete the entity using the new deleteEntity API
			const deleted = await itemsTN.deleteEntity(entityKey);

			if (!deleted) {
				throw new Error("Failed to delete item");
			}

			// Commit the transaction to save changes
			await this.transaction.commitP();

			// Re-fetch the sales items to update the UI after commit
			await this.fetchSalesItems();

			// Close dialog and reset state
			tn.setProperty("showDeleteItemDialog", false);
			tn.setProperty("deleteItemData", null);
			tn.setProperty("isDeletingItem", false);

			toastManager.show({
				title: "Success",
				description: "Sales item deleted successfully",
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error("Error deleting sales item:", error);
			tn.setProperty("isDeletingItem", false);
			toastManager.show({
				title: "Error",
				description: "Failed to delete sales item: " + String(error),
				type: "error",
				duration: 5000,
			});
		}
	}

	prepareDelete(selection: string[]) {
		const tn = this.tm.getTN("reactstate");

		// Check if any items are selected
		if (selection.length === 0) {
			tn.setProperty("showMessageDialog", true);
			tn.setProperty("messageDialogTitle", "No items selected");
			tn.setProperty("messageDialogMessage", "Please select at least one item to delete");
			return;
		}

		// Show confirmation dialog
		tn.setProperty("showDeleteDialog", true);
		tn.setProperty("pendingDeleteData", { selection });
	}

	closeMessageDialog() {
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showMessageDialog", false);
		tn.setProperty("messageDialogTitle", "");
		tn.setProperty("messageDialogMessage", "");
	}

	cancelDelete() {
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("showDeleteDialog", false);
		tn.setProperty("pendingDeleteData", null);
		tn.setProperty("shouldClearSelection", false);
	}

	resetClearSelectionFlag() {
		const tn = this.tm.getTN("reactstate");
		tn.setProperty("shouldClearSelection", false);
	}

	async confirmDelete() {
		const tn = this.tm.getTN("reactstate");
		const ordersTN = this.tm.getTN("orders");
		const prevState = tn.getData() as p_sales_orderState;
		const { selection } = prevState.pendingDeleteData || {};

		if (!selection || selection.length === 0) {
			return;
		}

		console.log("Deleting entity IDs:", selection);
		tn.setProperty("isDeleteing", true);
		tn.setProperty("showDeleteDialog", false);

		try {
			// Delete each entity using the TransNode deleteEntity API
			// Pass the entity unique key directly
			for (const entityId of selection) {
				const deleted = await ordersTN.deleteEntity(entityId);

				if (!deleted) {
					console.warn(`Entity with ID ${entityId} not found or failed to delete`);
				}
			}

			// Commit the transaction to save the deletion
			await this.commitP();

			// Re-fetch the orders from backend to update the UI after commit
			const query = await this.transaction.getQueryP("d_sales_order");
			query.setLoadAll(true);
			const result = await query.executeP();
			await query.loadAllValuehelp(["status", "country_vh"]);
			await ordersTN.setData(result);

			tn.setProperty("isDeleteing", false);
			tn.setProperty("showDeleteDialog", false);
			tn.setProperty("pendingDeleteData", null);
			tn.setProperty("shouldClearSelection", true);

			toastManager.show({
				title: "Deleted successfully",
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error("Error deleting items:", error);
			tn.setProperty("isDeleteing", false);
			tn.setProperty("showDeleteDialog", false);
			tn.setProperty("pendingDeleteData", null);
			tn.setProperty("shouldClearSelection", false);
			toastManager.show({
				title: "Error",
				description: "Failed to delete items: " + String(error),
				type: "error",
				duration: 5000,
			});
			throw error;
		}
	}

	async fetchItems() {
		// Initialize TransNode with full state structure on first load
		this.initializeReactState();

		const query = await this.transaction.getQueryP("d_sales_order");
		query.setLoadAll(true);
		const result = await query.executeP();

		await query.loadAllValuehelp(["status", "country_vh"]);

		console.log("Query Result:", result);

		// Store the raw entityset in the orders TransNode (will auto-normalize)
		const ordersTN = this.tm.getTN("orders");
		await ordersTN.setData(result);
	}
}
