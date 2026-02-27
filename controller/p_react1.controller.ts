// import { KloController } from "kloTouch/jspublic/KloController";
import BaseController, { BaseControllerState } from "kloReact/core/BaseController";
import { KloTransaction } from "kloBo/KloTransaction";
// declare let KloUI5: any;
// @KloUI5("eam.controller.p_0025_testing1")

export interface p_react1State extends BaseControllerState {
	items: any[];
	isDeleteing: boolean;
}

export default class p_react1 extends BaseController {
	// public onInit() {}
	// public onBeforeRendering() {}
	// public onAfterRendering() {}
	// public onExit() {}
	constructor(initialState?: p_react1State & { screenid?: string }) {
		super(initialState || { screenid: "" });
		this.slice.setState({ name: "p_react1", items: null, isDeleteing: false });
	}

	onClickId(e?: Event) {
		// alert("Save action triggered in p_react1 controller!");
		// Get the clicked item's ID from event or use a test ID
		const itemId = (e?.target as any)?.textContent || "TEST_123";
		
		// Navigate with params
		this.navTo({ 
			S: "p_react1", 
			C: "p_test_detail", 
			F: "react_test2",
			params: {
				id: itemId,
				mode: "view",
				timestamp: Date.now()
			}
		});
	}

	async onDelete(items, selection) {
		console.log(items, selection);
		const prevState = this.slice.getState() as p_react1State;
		this.slice.setState({ ...prevState, isDeleteing: true });
		await Promise.all(selection.map((s) => items[s]?.deleteP?.()));
		// const prevStateAfterDelete = this.slice.getState() as p_react1State;
		// this.slice.setState({ ...prevStateAfterDelete, isDeleteing: false });
		// this.slice.setState({ ...prevState, items: [...items] });
		this.slice.setState({ ...prevState, items: prevState.items.filter((_, index) => !selection.includes(index)), isDeleteing: false });
	}

	async fetchItems() {
		const txn = await KloTransaction.createTransaction("react_test2");
		const query = await txn.getQueryP("test1");
		query.setLoadAll(true);
		const result = await query.executeP();
		// await query.loadAllValuehelp(["breakdown_unit", "k_notif_id"]);
		console.log("Query Result:", result);
		const es = await Promise.all(result.map((item) => item.getJSON(undefined)));
		// this.slice.setState({ items: result ?? [] });
		this.slice.setState((prevState: p_react1State) => ({ ...prevState, items: es }));
		// return result ?? [];
		// Process result as needed
	}
}
