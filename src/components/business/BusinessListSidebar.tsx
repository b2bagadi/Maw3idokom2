"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building2, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";

interface Business {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
}

export function BusinessListSidebar() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [search, setSearch] = useState("");
    const pathname = usePathname();

    useEffect(() => {
        // Fetch businesses for admin
        const fetchBusinesses = async () => {
            try {
                const response = await fetch('/api/admin/businesses'); // Assuming this endpoint exists or I'll create it
                if (response.ok) {
                    const data = await response.json();
                    setBusinesses(data.businesses || []);
                }
            } catch (error) {
                console.error("Failed to fetch businesses", error);
            }
        };
        fetchBusinesses();
    }, []);

    const filteredBusinesses = businesses.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full md:w-64 border-r bg-muted/10 flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="font-semibold mb-4">Businesses</h2>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {filteredBusinesses.map((business) => {
                        const isActive = pathname.includes(`/businesses/${business.id}`);
                        return (
                            <Link
                                key={business.id}
                                href={`/admin/businesses/${business.id}/appointments`}
                                className={cn(
                                    "flex items-center justify-between w-full p-3 rounded-md text-sm transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={cn(
                                        "w-8 h-8 rounded flex items-center justify-center shrink-0",
                                        isActive ? "bg-primary-foreground/20" : "bg-muted"
                                    )}>
                                        {business.logoUrl ? (
                                            <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover rounded" />
                                        ) : (
                                            <Building2 className="h-4 w-4" />
                                        )}
                                    </div>
                                    <span className="truncate font-medium">{business.name}</span>
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
