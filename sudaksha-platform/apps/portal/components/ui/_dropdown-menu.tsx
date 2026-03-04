import * as React from "react"
import { cn } from "../../lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, asChild = false, className }) => {
  return <div className={className} onClick={() => { /* Toggle logic would go here */ }}>{children}</div>;
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, align = 'end' }) => {
  return (
    <div className={cn(
      "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md",
      align === 'end' && "right-0",
      align === 'start' && "left-0",
      align === 'center' && "left-1/2 transform -translate-x-1/2"
    )}>
      {children}
    </div>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-gray-100 hover:bg-gray-100",
        className
      )}
    >
      {children}
    </div>
  );
};

const DropdownMenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold text-gray-900", className)}>
      {children}
    </div>
  );
};

const DropdownMenuSeparator: React.FC = () => {
  return <div className="-mx-1 my-1 h-px bg-gray-100" />;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
};
