import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategorySelectorProps {
    categories: any[];
    value: number | null | undefined;
    onChange: (value: number | null) => void;
}

export function CategorySelector({ categories, value, onChange }: CategorySelectorProps) {
    return (
        <div>
            <Label>Category</Label>
            <Select
                value={value?.toString() || ''}
                onValueChange={(val) => onChange(val ? parseInt(val) : null)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.nameEn}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
