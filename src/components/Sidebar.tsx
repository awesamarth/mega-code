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
      className="z-10 w-14 fixed left-0 items-center overflow-x-hidden h-screen bg-gray-100 dark:bg-gray-800"
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
                className={`hover:cursor-pointer h-11 w-11 p-2 rounded-lg text-gray-800 dark:text-white ${
                  selection == UserSelection.AI && "bg-gray-200 dark:bg-gray-900"
                } hover:bg-gray-200 dark:hover:bg-gray-700`}
              />
            </button>
          </li>
          <li>
            <button onClick={() => setSelection(UserSelection.Compile)}>
              <FaHammer
                title="Compile"
                data-toggle="tooltip"
                className={`hover:cursor-pointer h-11 w-11 p-2 rounded-lg text-gray-800 dark:text-white ${
                  selection == UserSelection.Compile && "bg-gray-200 dark:bg-gray-900"
                } hover:bg-gray-200 dark:hover:bg-gray-700`}
              />
            </button>
          </li>
          <li>
            <button onClick={() => setSelection(UserSelection.Deploy)}>
              <FaRocket
                title="Deploy"
                data-toggle="tooltip"
                className={`hover:cursor-pointer h-11 w-11 p-2 rounded-lg text-gray-800 dark:text-white ${
                  selection == UserSelection.Deploy && "bg-gray-200 dark:bg-gray-900"
                } hover:bg-gray-200 dark:hover:bg-gray-700`}
              />
            </button>
          </li>
        </ul>

        <div>
          <button onClick={() => setSelection(UserSelection.Settings)}>
            <FaGear
              title="Settings"
              data-toggle="tooltip"
              className={`hover:cursor-pointer h-11 w-11 p-2 rounded-lg text-gray-800 dark:text-white ${
                selection == UserSelection.Settings && "bg-gray-200 dark:bg-gray-900"
              } hover:bg-gray-200 dark:hover:bg-gray-700`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
