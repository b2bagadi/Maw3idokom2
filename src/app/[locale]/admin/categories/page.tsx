"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Category {
    id: number;
    nameEn: string;
    nameFr: string;
    nameAr: string;
    slug: string;
    icon: string;
    isActive: boolean;
}

export default function AdminCategoriesPage() {
    const t = useTranslations('admin');
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        nameEn: "",
        nameFr: "",
        nameAr: "",
        icon: "",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories);
            } else {
                toast.error("Failed to load categories");
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast.error("Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                nameEn: category.nameEn,
                nameFr: category.nameFr,
                nameAr: category.nameAr,
                icon: category.icon,
            });
        } else {
            setEditingCategory(null);
            setFormData({
                nameEn: "",
                nameFr: "",
                nameAr: "",
                icon: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setFormData({
            nameEn: "",
            nameFr: "",
            nameAr: "",
            icon: "",
        });
    };

    const handleSave = async () => {
        if (!formData.nameEn || !formData.nameFr || !formData.nameAr || !formData.icon) {
            toast.error("All fields are required");
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('admin_token');
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : '/api/admin/categories';

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(editingCategory ? "Category updated" : "Category created");
                fetchCategories();
                handleCloseDialog();
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to save category");
            }
        } catch (error) {
            toast.error("Failed to save category");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) {
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success("Category deleted");
                fetchCategories();
            } else {
                toast.error("Failed to delete category");
            }
        } catch (error) {
            toast.error("Failed to delete category");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage business categories for the platform</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                    <CardDescription>
                        {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No categories yet. Create your first category!</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Icon</TableHead>
                                    <TableHead>Name (EN)</TableHead>
                                    <TableHead>Name (FR)</TableHead>
                                    <TableHead>Name (AR)</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Tag className="h-4 w-4 text-primary" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{category.nameEn}</TableCell>
                                        <TableCell>{category.nameFr}</TableCell>
                                        <TableCell>{category.nameAr}</TableCell>
                                        <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                                        <TableCell>
                                            <Badge variant={category.isActive ? "default" : "secondary"}>
                                                {category.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(category.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Edit Category" : "Add Category"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? "Update the category information below"
                                : "Fill in the information for the new category"
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nameEn">Name (English)</Label>
                            <Input
                                id="nameEn"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                placeholder="Hair Salons"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nameFr">Name (French)</Label>
                            <Input
                                id="nameFr"
                                value={formData.nameFr}
                                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                                placeholder="Salons de coiffure"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nameAr">Name (Arabic)</Label>
                            <Input
                                id="nameAr"
                                value={formData.nameAr}
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                placeholder="صالونات الشعر"
                                dir="rtl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon (Lucide Icon Name)</Label>
                            <Input
                                id="icon"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="Scissors"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter a Lucide React icon name (e.g., Scissors, Car, Dumbbell)
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingCategory ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
