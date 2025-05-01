"use client";

interface CompilePanelProps {
  compileSourceCode: (event: React.MouseEvent<HTMLButtonElement>) => void;
  compiled: number; // 0: not compiled, 1: compiling, 2: successfully compiled
}

export default function CompilePanel({
  compileSourceCode,
  compiled,
}: CompilePanelProps) {
  return (
    <div className="flex flex-col gap-3 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-4 border border-gray-300/50 dark:border-gray-700/50">
      <div className="text-sm font-medium mb-2">
        Compile your smart contract to generate bytecode and ABI
      </div>
      
      <button
        className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 h-12 w-full px-4 py-2 rounded-md text-white
          transition-colors duration-200 font-medium flex items-center justify-center gap-2"
        onClick={compileSourceCode}
      >
        {compiled === 1 ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Compiling...
          </>
        ) : "Compile"}
      </button>
      
      {compiled === 2 && (
        <div className="mt-2 w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-md text-center">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Your contract has been compiled successfully.</span>
        </div>
      )}
    </div>
  );
}