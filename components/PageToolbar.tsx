// import * as React from "react";
import { Flex, Box, Button, Spacer, MenuRoot, MenuTrigger, MenuContent, MenuItem, Text } from "@chakra-ui/react";
import Icon from "kloReact/components/Icon";

interface ToolbarAction {
	label: string;
	icon: string;
	onClick: () => void;
	variant?: "solid" | "outline" | "ghost";
	colorScheme?: string;
	loading?: boolean;
	loadingText?: string;
	disabled?: boolean;
	isPrimary?: boolean; // First action shown on mobile
}

interface PageToolbarProps {
	title: string;
	actions: ToolbarAction[];
	onBack?: () => void;
}

export default function PageToolbar({ title, actions, onBack }: PageToolbarProps) {
	// Separate primary action (first one or marked as primary) from overflow actions
	//Needs to be tested
	const primaryAction = actions.find((a) => a.isPrimary) || actions[0];
	const overflowActions = actions.filter((a) => a !== primaryAction);
	console.log("PageToolbar - primaryAction:", primaryAction, "overflowActions:", overflowActions);
	return (
		<Flex align="center" p={{ base: 3, md: 4, lg: 5 }} borderBottomWidth="1px" bg="white" flexShrink={0}>
			{/* Left side: Back button (optional) + Title */}
			<Flex align="center" gap={3}>
				{onBack && (
					<Button variant="ghost" onClick={onBack} size={{ base: "sm", md: "md" }}>
						<Icon name="md:arrow_back" />
					</Button>
				)}
				<Box fontSize={{ base: "lg", md: "xl", lg: "2xl" }} fontWeight="bold">
					{title}
				</Box>
			</Flex>

			<Spacer />

			{/* Desktop: Show all actions */}
			<Flex gap={2} display={{ base: "none", md: "flex" }}>
				{actions.map((action, index) => (
					<Button colorScheme={action.colorScheme || "teal"} variant={action.variant || "solid"} onClick={action.onClick} loading={action.loading} loadingText={action.loadingText} disabled={action.disabled} size="md">
						<Icon name={action.icon} />
						{action.label}
					</Button>
				))}
			</Flex>

			{/* Mobile: Primary action + overflow menu (if multiple actions) */}
			<Flex gap={2} display={{ base: "flex", md: "none" }}>
				{primaryAction && (
					<Button colorScheme={primaryAction.colorScheme || "teal"} variant={primaryAction.variant || "solid"} onClick={primaryAction.onClick} loading={primaryAction.loading} disabled={primaryAction.disabled} size="sm">
						<Icon name={primaryAction.icon} />
						<Box display={{ base: "none", sm: "inline" }}>{primaryAction.label}</Box>
					</Button>
				)}

				{overflowActions.length > 0 && (
					<MenuRoot>
						<MenuTrigger>
							<Button size="sm" variant="outline">
								<Icon name="md:more_horiz" />
							</Button>
						</MenuTrigger>
						<MenuContent>
							{overflowActions.map((action, index) => (
								<MenuItem key={index} value={action.label} onClick={action.onClick} disabled={action.disabled || action.loading}>
									<Flex align="center" gap={2}>
										<Icon name={action.icon} />
										<Text>{action.loading ? action.loadingText || action.label : action.label}</Text>
									</Flex>
								</MenuItem>
							))}
						</MenuContent>
					</MenuRoot>
				)}
			</Flex>
		</Flex>
	);
}
