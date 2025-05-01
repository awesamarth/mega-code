"use client";

import { Message } from "ai/react";

interface AIAssistantPanelProps {
  // For contract generation
  codegenInput: string;
  handleCodegenInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  generateContract: () => void;
  
  // For MegaETH/Solidity doubts
  megaEthOrSolidity: string;
  setmegaEthOrSolidity: (type: string) => void;
  
  // MegaETH doubts
  megaEthDoubtInput: string;
  megaEthHandleDoubtInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  megaEthDoubtMessages: Message[];
  
  // Solidity doubts
  solidityDoubtInput: string;
  solidityHandleDoubtInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  solidityDoubtMessages: Message[];
  
  // Common actions
  askDoubt: () => void;
}

export default function AIAssistantPanel({
  codegenInput,
  handleCodegenInputChange,
  generateContract,
  megaEthOrSolidity,
  setmegaEthOrSolidity,
  megaEthDoubtInput,
  megaEthHandleDoubtInputChange,
  megaEthDoubtMessages,
  solidityDoubtInput,
  solidityHandleDoubtInputChange,
  solidityDoubtMessages,
  askDoubt,
}: AIAssistantPanelProps) {
  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {/* Contract Generation Section */}
      <div className="flex flex-col gap-3 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateContract();
          }}
          className="flex flex-col gap-2 items-center w-full"
        >
          <label className="self-start text-sm font-medium">
            Generate contract with AI
          </label>
          <textarea
            value={codegenInput}
            onChange={handleCodegenInputChange}
            className="flex rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 
              w-full text-sm bg-white dark:bg-gray-900 text-black dark:text-white
              focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400
              placeholder:text-gray-500"
            placeholder="ERC20 token contract"
          />
          <button
            onClick={generateContract}
            className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 px-4 rounded-md text-white w-full
              transition-colors duration-200 font-medium"
          >
            Generate
          </button>
        </form>
      </div>
      
      {/* Ask Doubts Section */}
      <div className="flex flex-col gap-3 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50">
        <label className="self-start text-sm font-medium">Ask doubts</label>
        
        {/* MegaETH/Solidity tabs */}
        <div className="flex gap-2 self-start w-full">
          <button
            onClick={() => setmegaEthOrSolidity("megaEth")}
            className={`flex-1 px-3 py-1.5 rounded-md font-medium transition-colors duration-200 ${
              megaEthOrSolidity == "megaEth"
                ? "bg-gray-800 dark:bg-gray-700 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700"
            }`}
          >
            MegaETH
          </button>
          <button
            onClick={() => setmegaEthOrSolidity("Solidity")}
            className={`flex-1 px-3 py-1.5 rounded-md font-medium transition-colors duration-200 ${
              megaEthOrSolidity == "Solidity"
                ? "bg-gray-800 dark:bg-gray-700 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700"
            }`}
          >
            Solidity
          </button>
        </div>
        
        {/* Input and Ask button */}
        <div className="flex flex-col gap-2 items-center w-full">
          <textarea
            value={megaEthOrSolidity=="megaEth" ? megaEthDoubtInput : solidityDoubtInput}
            onChange={megaEthOrSolidity=="megaEth" ? megaEthHandleDoubtInputChange : solidityHandleDoubtInputChange}
            className="flex rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 
              w-full text-sm bg-white dark:bg-gray-900 text-black dark:text-white
              focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400
              placeholder:text-gray-500"
            placeholder={`Ask doubts about ${megaEthOrSolidity}`}
          />
          <button
            onClick={askDoubt}
            className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 px-4 rounded-md text-white w-full
              transition-colors duration-200 font-medium"
          >
            Ask
          </button>
        </div>

        {/* Message history */}
        <div className="w-full max-h-[400px] overflow-y-auto mt-2 space-y-3">
          {(megaEthOrSolidity=="megaEth" ? megaEthDoubtMessages : solidityDoubtMessages).map((m: Message) => (
            <div
              key={m.id}
              className="w-full whitespace-pre-wrap flex flex-col text-left
                bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-300 dark:border-gray-700
                text-black dark:text-white"
            >
              <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                {m.role === 'user' ? 'You' : 'Assistant'}
              </div>
              {m.role !== "data" && <div className="text-sm">{m.content}</div>}
              {m.role === "data" && (
                <>
                  <div className="text-sm">{(m.data as any).description}</div>
                  <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(m.data, null, 2)}
                  </pre>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}