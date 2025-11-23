"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();
  const lastSent = useRef(initialQuery.trim());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/?q=${encodeURIComponent(query)}` : '/');
  };

  // Debounced live search without pressing Enter
  useEffect(() => {
    const handle = setTimeout(() => {
      const query = q.trim();
      if (query === lastSent.current) return; // avoid redundant navigation
      lastSent.current = query;
      router.replace(query ? `/?q=${encodeURIComponent(query)}` : '/');
    }, 300);
    return () => clearTimeout(handle);
  }, [q, router]);

  return (
    <form className="search" onSubmit={onSubmit} role="search" aria-label="Search posts by title">
      <span aria-hidden>🔎</span>
      <input
        name="q"
        type="text"
        placeholder="Enter what you are looking for"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search by title"
      />
    </form>
  );
}