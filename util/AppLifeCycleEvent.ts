export class AppLifeCycleEvent {
	public onAppStart(): void {
		alert("App started in react"); // Event logic here
	}
	public onBackground() {
		alert("App in background"); // Event logic here
	}
}
