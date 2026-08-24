import { useEffect } from "react";

export default function useModalBehavior(open, onClose) {
    useEffect(() => {
        if (!open) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && onClose) onClose();
        };

        document.body.classList.add("modal-open");
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.classList.remove("modal-open");
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);
}
