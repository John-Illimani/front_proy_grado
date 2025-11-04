import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "../hooks/useTheme";

export const ThemeSwitcher = () =>{
  
  const {theme, switchTheme} = useTheme()
  

  return(
    <button
      onClick={switchTheme}
         className="absolute top-3 right-3 z-50 p-1.5 rounded-full 
         bg-gradient-to-tr from-red-600 to-neutral-900 
         text-white border border-red-600 
         shadow-md transition-all hover:scale-110              
         dark:from-red-600 dark:to-black 
         dark:text-white dark:border-red-600"
    >
      <div className="transition-transform duration-500 ease-in-out rotate-0 dark:rotate-180">
        {theme === 'dark' ? <MoonIcon className="size-5"/> : <SunIcon className="size-5"/>}
      </div>
    </button>
  )
}