import { UserSelection } from "@/app/types/types";
import {
  FaGear,
  FaHammer,
  FaRocket,
  FaWandMagicSparkles,
} from "react-icons/fa6";

export default function Sidebar({
  selection,
  setSelection,
}: {
  selection: UserSelection;
  setSelection: (selection: UserSelection) => void;
}) {
  return (
    <aside
      id="default-sidebar"
      className="z-10 w-20 fixed left-0 items-center overflow-x-hidden h-screen bg-[#dfd9d9] dark:bg-[#1a1a1a] border-r border-gray-300 dark:border-gray-800"
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col justify-between items-center px-1 py-2 overflow-y-auto">
        <div></div>

        <ul className="flex flex-col -mt-2 gap-6 font-medium">
          <li>
            <button onClick={() => setSelection(UserSelection.AI)}>
              <FaWandMagicSparkles
                title="AI"
                data-toggle="tooltip"
                className={`hover:cursor-pointer h-11 w-11 p-2.5 rounded-lg text-gray-700 dark:text-gray-300 ${
                  selection == UserSelection.AI
                    ? "bg-[#1a1a1a] text-white dark:bg-[#dfd9d9] dark:text-gray-800"
                    : "hover:bg-[#d0d0d0] dark:hover:bg-[#333333]"
                } transition-colors`}
              />
            </button>
          </li>
          <li>
            <button onClick={() => setSelection(UserSelection.Compile)}>
              <FaHammer
                title="Compile"
                data-toggle="tooltip"
                className={`hover:cursor-pointer h-11 w-11 p-2.5 rounded-lg text-gray-700 dark:text-gray-300 ${
                  selection == UserSelection.Compile
                    ? "bg-[#1a1a1a] text-white dark:bg-[#dfd9d9] dark:text-gray-800"
                    : "hover:bg-[#d0d0d0] dark:hover:bg-[#333333]"
                } transition-colors`}
              />
            </button>
          </li>
          <li>
            <button onClick={() => setSelection(UserSelection.Deploy)}>
              <FaRocket
                title="Deploy"
                data-toggle="tooltip"
                className={`hover:cursor-pointer h-11 w-11 p-2.5 rounded-lg text-gray-700 dark:text-gray-300 ${
                  selection == UserSelection.Deploy
                    ? "bg-[#1a1a1a] text-white dark:bg-[#dfd9d9] dark:text-gray-800"
                    : "hover:bg-[#d0d0d0] dark:hover:bg-[#333333]"
                } transition-colors`}
              />
            </button>
          </li>
        </ul>

        <div>
          <button onClick={() => setSelection(UserSelection.Settings)}>
            <FaGear
              title="Settings"
              data-toggle="tooltip"
              className={`hover:cursor-pointer h-11 w-11 p-2.5 rounded-lg text-gray-700 dark:text-gray-300 ${
                selection == UserSelection.Settings
                  ? "bg-[#1a1a1a] text-white dark:bg-[#dfd9d9] dark:text-gray-800"
                  : "hover:bg-[#d0d0d0] dark:hover:bg-[#333333]"
              } transition-colors`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
