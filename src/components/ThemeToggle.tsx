"use client"
 
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
 
export function ThemeToggle() {
  const { setTheme } = useTheme()
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="border-gray-400 bg-gray-200/50 hover:bg-gray-300/70 dark:border-gray-700 dark:bg-gray-800/30 dark:hover:bg-gray-700/50 h-9 w-9"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-800" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-300" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#dfd9d9] dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 min-w-32">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="hover:bg-gray-300/50 dark:hover:bg-gray-800/50 cursor-pointer text-gray-800 dark:text-gray-200"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="hover:bg-gray-300/50 dark:hover:bg-gray-800/50 cursor-pointer text-gray-800 dark:text-gray-200"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="hover:bg-gray-300/50 dark:hover:bg-gray-800/50 cursor-pointer text-gray-800 dark:text-gray-200"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}