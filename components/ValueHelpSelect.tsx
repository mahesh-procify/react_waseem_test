import * as React from "react";
import { useState, useEffect } from "react";
import { NativeSelectRoot, NativeSelectField, Spinner, Box } from "@chakra-ui/react";
import Icon from "kloReact/components/Icon";

interface ValueHelpSelectProps {
	valueHelp: any;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	displayValue?: string; // Optional display text to show while options are loading
}

export default function ValueHelpSelect({ valueHelp, value, onChange, placeholder = "Select...", disabled = false, displayValue }: ValueHelpSelectProps) {
	const [options, setOptions] = useState<any[]>([]);
	const [vhInfo, setVhInfo] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	// Load options function
	const loadOptions = async () => {
		if (!isLoaded && valueHelp && !isLoading) {
			setIsLoading(true);
			try {
				// Get metadata first
				const metadata = await valueHelp.getVhInfoMetadata();
				setVhInfo(metadata);

				// Then load suggestion items
				await valueHelp.getSuggestionItemsP();
				const items = valueHelp.suggestionItems || [];
				setOptions(items);
				setIsLoaded(true);
			} catch (error) {
				console.error("Error loading value help options:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	// Load options when dropdown is opened
	const handleFocus = async () => {
		await loadOptions();
	};

	// Load options on mount if there's a value
	useEffect(() => {
		if (valueHelp && !isLoaded) {
			loadOptions();
		}
	}, [valueHelp]);

	// Reset loaded state when valueHelp changes
	useEffect(() => {
		setIsLoaded(false);
		setOptions([]);
	}, [valueHelp]);

	const keyProp = vhInfo?.key || "key";
	const displayProp = vhInfo?.displaytext || "text";

	// Find the key for the current display value
	const getCurrentKey = () => {
		if (!value) return "";
		// If options aren't loaded yet, return the value as-is (assume it's a key)
		if (options.length === 0) return value;

		// If value matches a display text, find its key
		const matchingOption = options.find((item) => item[displayProp] === value);
		if (matchingOption) {
			return matchingOption[keyProp];
		}
		// If value is already a key, return it
		const keyOption = options.find((item) => item[keyProp] === value);
		return keyOption ? value : "";
	};

	// const getValue = () => {
	// 	if (!value || options.length === 0) return "";
	// 	// If value matches a display text, find its key
	// 	const matchingOption = options.find((item) => item[displayProp] === value);
	// 	if (matchingOption) {
	// 		return matchingOption[displayProp];
	// 	}
	// 	// If value is already a key, return it
	// 	const keyOption = options.find((item) => item[keyProp] === value);
	// 	return keyOption ? keyOption[displayProp] : "";
	// };

	return (
		<Box position="relative" width="100%">
			<NativeSelectRoot width="100%" disabled={disabled || isLoading}>
				<NativeSelectField value={value} onChange={(e) => onChange(e.target.value)} onFocus={handleFocus} placeholder={placeholder} style={{ paddingRight: "2.5rem" }}>
					{/* Show current value as temporary option if options aren't loaded yet */}
					{options.length === 0 && value && <option value={value}>{displayValue || value}</option>}
					{options.map((item) => (
						<option key={item[keyProp]} value={item[keyProp]}>
							{item[displayProp]}
						</option>
					))}
				</NativeSelectField>
			</NativeSelectRoot>

			{/* Dropdown Icon or Loading Spinner */}
			<Box position="absolute" right="0.75rem" top="50%" transform="translateY(-50%)" pointerEvents="none" display="flex" alignItems="center">
				{isLoading ?
					<Spinner size="sm" color="gray.500" />
				:	<Icon name="sap-icon://slim-arrow-down" size={16} />}
			</Box>
		</Box>
	);
}
