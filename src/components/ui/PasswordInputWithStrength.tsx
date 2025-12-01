
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputWithStrengthProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export function PasswordInputWithStrength({
    id,
    value,
    onChange,
    label = 'Password',
    placeholder = 'Enter password',
    className,
    required = false,
}: PasswordInputWithStrengthProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
    const [requirements, setRequirements] = useState({
        lowercaseUppercase: false,
        number: false,
        specialChar: false,
        minLength: false,
    });

    useEffect(() => {
        validatePassword(value);
    }, [value]);

    const validatePassword = (pass: string) => {
        const hasLower = /[a-z]/.test(pass);
        const hasUpper = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        const hasMinLength = pass.length >= 8;

        const newRequirements = {
            lowercaseUppercase: hasLower && hasUpper,
            number: hasNumber,
            specialChar: hasSpecial,
            minLength: hasMinLength,
        };

        setRequirements(newRequirements);

        // Calculate strength
        const metCount = Object.values(newRequirements).filter(Boolean).length;
        if (metCount === 4) setStrength('Strong');
        else if (metCount >= 2) setStrength('Medium');
        else setStrength('Weak');
    };

    const getStrengthColor = () => {
        if (value.length === 0) return 'bg-gray-200';
        switch (strength) {
            case 'Strong': return 'bg-green-500';
            case 'Medium': return 'bg-yellow-500';
            case 'Weak': return 'bg-red-500';
            default: return 'bg-gray-200';
        }
    };

    const getStrengthText = () => {
        if (value.length === 0) return '';
        return strength;
    };

    const getStrengthTextColor = () => {
        if (value.length === 0) return 'text-muted-foreground';
        switch (strength) {
            case 'Strong': return 'text-green-500';
            case 'Medium': return 'text-yellow-500';
            case 'Weak': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label htmlFor={id}>{label}</Label>}
            <div className="relative">
                <Input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>

            {/* Strength Meter Bar */}
            {value.length > 0 && (
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-300", getStrengthColor())}
                        style={{ width: strength === 'Strong' ? '100%' : strength === 'Medium' ? '66%' : '33%' }}
                    />
                </div>
            )}

            {/* Requirements List */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 mt-2">
                <p className="text-sm font-medium">Your password must include</p>
                <div className="space-y-2">
                    <RequirementItem met={requirements.lowercaseUppercase} label="Lowercase & Uppercase" />
                    <RequirementItem met={requirements.number} label="Number (0-9)" />
                    <RequirementItem met={requirements.specialChar} label="Special Character (!@#$%^&*)" />
                    <RequirementItem met={requirements.minLength} label="At least 8 Characters" />
                </div>

                {value.length > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <span className="text-sm font-medium">Password strength</span>
                        <span className={cn("text-sm font-bold", getStrengthTextColor())}>{getStrengthText()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            {met ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={met ? "text-foreground" : "text-muted-foreground"}>{label}</span>
        </div>
    );
}
