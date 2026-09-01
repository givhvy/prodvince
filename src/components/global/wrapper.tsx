import React from "react";
import { cn } from "@/lib";

interface Props {
    className?: string;
    children: React.ReactNode;
}

const Wrapper = ({ children, className }: Props) => {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-12",
                className
            )}
        >
            {children}
        </div>
    )
};

export default Wrapper
