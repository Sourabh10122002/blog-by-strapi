"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
    const pathname = usePathname();
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);

    const shouldAutoHide = pathname?.startsWith("/posts/") || pathname === "/posts";

    useEffect(() => {
        if (!shouldAutoHide) {
            setHidden(false);
            return;
        }
        const onScroll = () => {
            const y = window.scrollY || 0;
            const goingDown = y > lastY.current + 4;
            const goingUp = y < lastY.current - 4;
            if (goingDown && y > 80) setHidden(true);
            else if (goingUp || y <= 80) setHidden(false);
            lastY.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [shouldAutoHide]);

    return (
        <header className={`${styles.headerWrap} ${hidden ? styles.hidden : ""}`}>
            <nav className={styles.nav}>
                <div className={styles.brand}>
                    <Link href="/" aria-label="Flex home">
                        <img src="/logo.svg" alt="Flex Badge" width={200} height={28} />
                    </Link>
                </div>

                <div className={styles.links}>
                    <Link href="/">Orange Flex</Link>
                    <Link href="/">Orange Flex Travel</Link>
                    <Link href="/">Blog</Link>
                    <Link href="/">Pomoc</Link>
                </div>

                <div className={styles.right}>
                    <Link className={styles.cta} href="#">Pobierz aplikację</Link>
                    <button className={styles.iconBtn} aria-label="Help">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
                            <line x1="12" y1="17" x2="12" y2="17" />
                        </svg>
                    </button>
                    <button className={styles.iconBtn} aria-label="Account">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </button>
                </div>
            </nav>
        </header>
    );
}

