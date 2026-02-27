import * as React from "react";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useSlice } from "kloReact/hooks/useSlice";
import { getController } from "kloReact/core/BaseController";
import p_react1Controller, { type p_react1State } from "react_test2/controller/p_react1.controller";

import { Table, Link, ActionBar, Button, Portal, Checkbox } from "@chakra-ui/react";

import Icon from "kloReact/components/Icon";

interface TableRowItemProps {
	item: any;
	isSelected: boolean;
	onToggleSelect: (itemId: string, checked: boolean) => void;
	onClickId: (e: any) => void;
}

// Memoized row component to prevent re-rendering all rows on selection change
const TableRowItem = memo(({ item, isSelected, onToggleSelect, onClickId }: TableRowItemProps) => {
	return (
		<Table.Row data-selected={isSelected ? "" : undefined}>
			<Table.Cell>
				<Checkbox.Root size="sm" mt="0.5" aria-label="Select row" checked={isSelected} onCheckedChange={(changes) => onToggleSelect(item.k_notif_id, changes.checked)}>
					<Checkbox.HiddenInput />
					<Checkbox.Control />
				</Checkbox.Root>
			</Table.Cell>
			<Table.Cell>
				<Link colorPalette="teal" onClick={onClickId}>
					{item.my_key}
				</Link>
			</Table.Cell>
			<Table.Cell>{item.t1}</Table.Cell>
			<Table.Cell>{item.t2}</Table.Cell>
			<Table.Cell>{item.t3}</Table.Cell>
		</Table.Row>
	);
});

export default function MyPage(props) {
	const controller = getController(props.sliceid) as InstanceType<typeof p_react1Controller>;

	// Subscribe to items from the slice state - this will re-render when items change
	const items = useSlice(props.sliceid, (state) => (state as p_react1State).items);
	const isDeleteing = useSlice(props.sliceid, (state) => (state as p_react1State).isDeleteing);
	
	// Subscribe to route data - this will re-render when navigation params change
	const routeData = useSlice(props.sliceid, (state) => (state as p_react1State).routeData);

	// Use Set for O(1) lookup performance, storing item IDs instead of indices
	const [selection, setSelection] = useState<Set<string>>(new Set());

	const indeterminate = useMemo(() => selection.size > 0 && selection.size < items?.length, [selection.size, items?.length]);

	useEffect(() => {
		console.log(`[p_react1] Component mounted/route changed. RouteData:`, routeData);
		// Fetch items and set up property change monitoring
		controller.fetchItems();
	}, [routeData?.C, routeData?.D]); // Re-run when subscreen or data changes

	// Memoize handlers for better performance
	const handleSelectAll = useCallback(
		(changes) => {
			if (changes.checked) {
				setSelection(new Set(items.map((item) => item.my_key)));
			} else {
				setSelection(new Set());
			}
		},
		[items],
	);

	const handleDelete = useCallback(
		(e) => {
			// Convert selected IDs to indices for the controller
			const selectedIds = Array.from(selection);
			const selectedIndices = items.map((item, idx) => (selectedIds.includes(item.my_key) ? idx : -1)).filter((idx) => idx !== -1);
			controller.onDelete(items, selectedIndices).finally(() => {
				setSelection(new Set());
			});
		},
		[controller, items, selection],
	);

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

	return (
		<>
			<ActionBar.Root open={selection.size > 0}>
				<Portal>
					<ActionBar.Positioner>
						{/* @ts-ignore - Chakra UI ActionBar.Content type definition issue */}
						<ActionBar.Content>
							{/* <ActionBar.CloseTrigger /> */}
							{/* <ActionBar.SelectionTrigger /> */}
							<Button>
								<Icon name="save" />
							</Button>
							<ActionBar.Separator />
							{/* <IconButton onClick={handleDelete} isLoading={isDeleteing} loadingText="Deleting..."> */}
							<Button onClick={handleDelete} loading={isDeleteing} loadingText="Deleting...">
								<Icon name="delete" />
							</Button>
						</ActionBar.Content>
					</ActionBar.Positioner>
				</Portal>
			</ActionBar.Root>
			<Table.Root size="sm" stickyHeader>
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeader w="6">
							<Checkbox.Root size="sm" mt="0.5" aria-label="Select all rows" checked={indeterminate ? "indeterminate" : selection.size > 0} onCheckedChange={handleSelectAll}>
								<Checkbox.HiddenInput />
								<Checkbox.Control />
							</Checkbox.Root>
						</Table.ColumnHeader>
						<Table.ColumnHeader>Primary Key</Table.ColumnHeader>
						<Table.ColumnHeader>T1</Table.ColumnHeader>
						<Table.ColumnHeader>T2</Table.ColumnHeader>
						<Table.ColumnHeader>T3</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{typeof items === "undefined" || items === null ?
						<Table.Row>
							<Table.Cell colSpan={5} textAlign="center">
								Loading...
							</Table.Cell>
						</Table.Row>
					:	items.map((item) => <TableRowItem key={item.my_key} item={item} isSelected={selection.has(item.my_key)} onToggleSelect={handleToggleSelect} onClickId={handleClickId} />)}
				</Table.Body>
			</Table.Root>
		</>
	);
}
