import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    const allItems = [{ label: 'Home', href: '/' }, ...items];

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-1 text-xs text-muted-foreground flex-wrap ${className}`}
        >
            {allItems.map((item, index) => {
                const isLast = index === allItems.length - 1;

                return (
                    <span key={index} className="flex items-center gap-1">
                        {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />}
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="hover:text-primary transition-colors font-medium"
                            >
                                {index === 0 ? (
                                    <span className="flex items-center gap-1">
                                        <Home className="w-3 h-3" />
                                        <span className="sr-only">Home</span>
                                    </span>
                                ) : (
                                    item.label
                                )}
                            </Link>
                        ) : (
                            <span className={`${isLast ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                {index === 0 ? (
                                    <span className="flex items-center gap-1">
                                        <Home className="w-3 h-3" />
                                        <span className="sr-only">Home</span>
                                    </span>
                                ) : (
                                    item.label
                                )}
                            </span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
