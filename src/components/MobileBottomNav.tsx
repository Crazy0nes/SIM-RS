'use client';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
}

interface MobileBottomNavProps {
    items: NavItem[];
    currentPath: string;
}

export default function MobileBottomNav({ items, currentPath }: MobileBottomNavProps) {
    return (
        <nav className="mobile-bottom-nav">
            <div className="mobile-bottom-nav-inner">
                {items.map((item) => {
                    const isActive = currentPath.startsWith(item.href);
                    return (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            {isActive ? item.activeIcon : item.icon}
                            <span>{item.label}</span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}
