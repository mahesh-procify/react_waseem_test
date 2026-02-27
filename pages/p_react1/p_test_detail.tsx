import * as React from "react";
import { useEffect } from "react";

export default function p_test_detail({ sliceid, navParams }) {
	// Log whenever component mounts or params change
	useEffect(() => {
		console.log("[p_test_detail] Component mounted/updated with navParams:", navParams);
	}, [navParams]);

	return (
		<>
			<div style={{ padding: "20px" }}>
				<h2>p_test_detail - Navigation Testing</h2>
				<div style={{ marginTop: "20px" }}>
					<h3>Received Parameters:</h3>
					<pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "4px" }}>
						{JSON.stringify(navParams, null, 2)}
					</pre>
				</div>
				{navParams?.id && (
					<div style={{ marginTop: "20px" }}>
						<p><strong>Item ID:</strong> {navParams.id}</p>
						<p><strong>Mode:</strong> {navParams.mode}</p>
						<p><strong>Timestamp:</strong> {new Date(navParams.timestamp).toLocaleString()}</p>
					</div>
				)}
			</div>
		</>
	);
}
