"use client";
import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "../../components/async-state";
import { api } from "../../lib/api";
interface Paper { readonly id: string; readonly title: string; readonly status: string; readonly totalMarks: number; readonly durationMinutes: number; readonly createdAt: string; readonly creator: { readonly firstName: string; readonly lastName: string } }
interface Page { readonly items: readonly Paper[] }
export default function PapersPage(): ReactElement { const [data, setData] = useState<Page>(); const [error, setError] = useState(""); useEffect(() => { void api<Page>("/papers").then(setData).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load papers")); }, []); return <AppShell><header><div><h1>Generated papers</h1><p>Each paper is rendered from its immutable snapshot.</p></div><Link className="button" href="/blueprints">Generate paper</Link></header>{error ? <ErrorState message={error} /> : !data ? <LoadingState /> : !data.items.length ? <EmptyState message="No papers generated yet." /> : <div className="list panel">{data.items.map((paper) => <Link className="list-row" href={`/papers/${paper.id}`} key={paper.id}><span><strong>{paper.title}</strong><small>{paper.creator.firstName} {paper.creator.lastName} · {new Date(paper.createdAt).toLocaleString()}</small></span><span><b>{paper.totalMarks} marks</b><small>{paper.durationMinutes} minutes</small></span></Link>)}</div>}</AppShell>; }
