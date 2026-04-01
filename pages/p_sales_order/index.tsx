import * as React from "react";
import { useEffect } from "react";
// import { getController } from "kloReact/core/BaseController";
import DetailPage from "react_test2/pages/p_sales_order/p_detail_test";
import ListPage from "react_test2/pages/p_sales_order/p_list";
import { ToastProvider, useToast } from "react_test2/components/Toast";
import { toastManager } from "react_test2/util/toaster";

// import type p_sales_order from "react_test2/controller/p_sales_order.controller";

function AppContent(props) {
	const { navParams, internalscreenid } = props;
	const { showToast } = useToast();

	// Register the toast function with the toast manager
	useEffect(() => {
		toastManager.register(showToast);
	}, [showToast]);

	return (
		navParams.C === "index" ? <ListPage navParams={navParams} internalscreenid={internalscreenid} />
		: navParams.C === "p_detail_test" ? <DetailPage navParams={navParams} internalscreenid={internalscreenid} />
		: <ListPage navParams={navParams} internalscreenid={internalscreenid} />
	);
}

export default function MyPage(props) {
	return (
		<ToastProvider>
			<AppContent {...props} />
		</ToastProvider>
	);
}
