"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingText?: string;
  color?: "rojo" | "azul";
};

export function SubmitButton({ children, pendingText = "Un momento...", color = "rojo" }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`btn btn--${color}`} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
