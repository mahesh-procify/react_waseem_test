import type { ToastMessage } from "react_waseem_test/components/Toast";

type ShowToastFn = (toast: Omit<ToastMessage, "id">) => void;

// Singleton toast manager
class ToastManager {
	private showToastFn: ShowToastFn | null = null;

	register(fn: ShowToastFn) {
		this.showToastFn = fn;
	}

	show(toast: Omit<ToastMessage, "id">) {
		if (this.showToastFn) {
			this.showToastFn(toast);
		} else {
			console.warn("Toast manager not initialized");
		}
	}
}

export const toastManager = new ToastManager();
