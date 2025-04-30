"use client";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  return (
    <div className="flex h-14 z-20 w-full text-black dark:text-white bg-[#dfd9d9] dark:bg-[#1a1a1a] items-center justify-between fixed top-0 px-4 py-2  border-gray-300 dark:border-gray-800">
      <Link className="flex gap-3 items-center" href="/">
        <Image src="/logo.png" height={80} width={32} alt="megaeth logo" />
        <div className="text-2xl font-bold tracking-tight">MEGA CODE</div>
      </Link>
      
      <div className="flex justify-center items-center gap-4">
        <ThemeToggle />
        <div>
          <div><w3m-button /></div>
        </div>
      </div>
    </div>
  );
}