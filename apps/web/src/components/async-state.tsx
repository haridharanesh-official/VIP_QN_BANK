import type { ReactElement } from "react";
export function LoadingState(): ReactElement { return <div className="state">Loading…</div>; }
export function ErrorState({ message }: { readonly message: string }): ReactElement { return <div className="state error" role="alert">{message}</div>; }
export function EmptyState({ message }: { readonly message: string }): ReactElement { return <div className="state">{message}</div>; }
