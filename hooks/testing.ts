async function thisIsAHook() {
	let a = "testing hooks";
	let b = await new Promise((res, rej) => {
		setTimeout(() => {
			res("resolved");
		}, 2000);
	});
	console.log(a, b);
	return a;
}
