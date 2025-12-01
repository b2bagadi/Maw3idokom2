"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COUNTRY_CODES = [
    { code: "+212", country: "Morocco", flag: "🇲🇦" },
    { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+34", country: "Spain", flag: "🇪🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+39", country: "Italy", flag: "🇮🇹" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+20", country: "Egypt", flag: "🇪🇬" },
    { code: "+213", country: "Algeria", flag: "🇩🇿" },
    { code: "+216", country: "Tunisia", flag: "🇹🇳" },
];

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function PhoneInput({
    value,
    onChange,
    placeholder = "Phone number",
    disabled = false,
    required = false,
    className,
}: PhoneInputProps) {
    const [open, setOpen] = React.useState(false);

    // Parse existing value to extract country code and number
    const parsePhoneNumber = (phone: string) => {
        if (!phone) return { countryCode: "+212", number: "" };

        const matchedCode = COUNTRY_CODES.find(c => phone.startsWith(c.code));
        if (matchedCode) {
            return {
                countryCode: matchedCode.code,
                number: phone.slice(matchedCode.code.length).trim()
            };
        }
        return { countryCode: "+212", number: phone };
    };

    const { countryCode, number } = parsePhoneNumber(value);
    const [selectedCode, setSelectedCode] = React.useState(countryCode);
    const [phoneNumber, setPhoneNumber] = React.useState(number);

    // Update parent when either part changes
    React.useEffect(() => {
        const fullNumber = phoneNumber ? `${selectedCode} ${phoneNumber}` : '';
        if (fullNumber !== value) {
            onChange(fullNumber);
        }
    }, [selectedCode, phoneNumber]);

    // Update local state when value prop changes externally
    React.useEffect(() => {
        const parsed = parsePhoneNumber(value);
        if (parsed.countryCode !== selectedCode || parsed.number !== phoneNumber) {
            setSelectedCode(parsed.countryCode);
            setPhoneNumber(parsed.number);
        }
    }, [value]);

    const selectedCountry = COUNTRY_CODES.find(c => c.code === selectedCode) || COUNTRY_CODES[0];

    return (
        <div className={cn("flex gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[140px] justify-between"
                        disabled={disabled}
                    >
                        <span className="flex items-center gap-2">
                            <span>{selectedCountry.flag}</span>
                            <span>{selectedCountry.code}</span>
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                            {COUNTRY_CODES.map((country) => (
                                <CommandItem
                                    key={country.code}
                                    value={`${country.country} ${country.code}`}
                                    onSelect={() => {
                                        setSelectedCode(country.code);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCode === country.code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="mr-2">{country.flag}</span>
                                    <span className="flex-1">{country.country}</span>
                                    <span className="text-muted-foreground">{country.code}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className="flex-1"
            />
        </div>
    );
}
