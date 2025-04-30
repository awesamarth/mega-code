"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react"; // Add useEffect
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  return (
<div className="flex h-[3.5rem] z-[20] w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800 items-center justify-between fixed top-0 px-2 py-2">
<Link className="flex gap-4 items-center" href="/">
        <Image src="/logo.png" height={100} width={40} alt="megaeth logo" />
        <div className="text-2xl self font-bold text-gray-800 dark:text-white">Mega Code</div>
      </Link>
      
      <div className="flex justify-center items-center h-[3.4rem] rounded-md gap-8">
        <ThemeToggle />
        <div>
          <div><w3m-button /></div>
        </div>
      </div>
    </div>
  );
}