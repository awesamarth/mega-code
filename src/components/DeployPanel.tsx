"use client";

import { useState } from "react";
import Link from "next/link";
import { TransactionReceipt } from "viem";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, ExternalLink, PlayCircle } from "lucide-react";

interface DeployedContract {
  address: string;
  name: string;
  timestamp: number;
}

interface DeployPanelProps {
  deployTheContract: (args: string[], value: string) => void;
  deployed: number; // 0: not deployed, 1: deploying, 2: successfully deployed
  receipt: TransactionReceipt | undefined;
  deployedContracts: DeployedContract[];
  onInteractWithContract: (address: string) => void;
  onRemoveContract: (address: string) => void;
}

export default function DeployPanel({
  deployTheContract,
  deployed,
  receipt,
  deployedContracts = [],
  onInteractWithContract,
  onRemoveContract,
}: DeployPanelProps) {
  const [constructorArgs, setConstructorArgs] = useState<string[]>([]);
  const [argInput, setArgInput] = useState("");
  const [ethValue, setEthValue] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addConstructorArg = () => {
    if (argInput.trim()) {
      setConstructorArgs([...constructorArgs, argInput.trim()]);
      setArgInput("");
    }
  };

  const removeConstructorArg = (index: number) => {
    setConstructorArgs(constructorArgs.filter((_, i) => i !== index));
  };

  const handleDeploy = () => {
    deployTheContract(constructorArgs, ethValue);
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-4 border border-gray-300/50 dark:border-gray-700/50">
      <div className="text-sm font-medium mb-1 w-full">
        Deploy your compiled contract to MegaETH testnet
      </div>
      
      {/* Advanced Deployment Options */}
      <div className="w-full">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs mb-2 text-gray-700 dark:text-gray-300 hover:underline focus:outline-none"
        >
          {showAdvanced ? "Hide" : "Show"} advanced options
        </button>
        
        {showAdvanced && (
          <div className="space-y-3 mb-3 p-3 border border-gray-300/50 dark:border-gray-700/50 rounded-md bg-gray-100/50 dark:bg-gray-900/50">
            {/* Constructor Arguments */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-800 dark:text-gray-200">
                Constructor Arguments
              </label>
              <div className="flex gap-2">
                <Input
                  value={argInput}
                  onChange={(e) => setArgInput(e.target.value)}
                  placeholder="Add constructor argument"
                  className="flex-1 bg-white dark:bg-gray-900 text-black dark:text-white"
                />
                <button
                  onClick={addConstructorArg}
                  className="p-2 bg-gray-300 dark:bg-gray-700 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                </button>
              </div>
              
              {/* List of constructor arguments */}
              {constructorArgs.length > 0 && (
                <div className="mt-2 space-y-1">
                  {constructorArgs.map((arg, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-md text-xs">
                      <div className="font-mono">
                        [{index}]: <span className="text-gray-800 dark:text-gray-200">{arg}</span>
                      </div>
                      <button
                        onClick={() => removeConstructorArg(index)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* ETH Value */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-800 dark:text-gray-200">
                ETH Value (optional)
              </label>
              <Input
                type="text"
                value={ethValue}
                onChange={(e) => setEthValue(e.target.value)}
                placeholder="0.01"
                className="bg-white dark:bg-gray-900 text-black dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Deploy Button */}
      <button
        className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 h-12 w-full px-4 py-2 rounded-md text-white
          transition-colors duration-200 font-medium flex items-center justify-center gap-2"
        onClick={handleDeploy}
      >
        {deployed === 1 ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deploying...
          </>
        ) : "Deploy Contract"}
      </button>
      
      {/* Success Message */}
      {deployed === 2 && receipt && (
        <div className="mt-2 w-full">
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-md mb-3 text-center">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Your contract has been deployed successfully.</span>
          </div>
          
          {receipt.contractAddress && (
            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-3 text-center">
              <div className="text-sm mb-2">Contract deployed at:</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-gray-800 dark:text-gray-200 break-all text-xs font-mono">
                  {receipt.contractAddress}
                </div>
                <button
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => navigator.clipboard.writeText(receipt.contractAddress ?? "")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                </button>
              </div>
              
              <div className="flex justify-center gap-2">
                <Link
                  className="inline-flex items-center text-xs text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-1 rounded-md transition-colors duration-200"
                  rel="noreferrer noopener"
                  target="_blank"
                  href={`https://explorer-testnet.megaethl2.io/address/${receipt.contractAddress}`}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View on Explorer
                </Link>
                
                <button
                  className="inline-flex items-center text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 px-2 py-1 rounded-md transition-colors duration-200"
                  onClick={() => onInteractWithContract(receipt.contractAddress ?? "")}
                >
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Interact
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Previously Deployed Contracts */}
      {deployedContracts.length > 0 && (
        <div className="w-full mt-2">
          <h3 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">Your Deployed Contracts</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {deployedContracts.map((contract) => (
              <div 
                key={contract.address}
                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {contract.name || "Contract"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                    {contract.address}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(contract.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
                    onClick={() => onInteractWithContract(contract.address)}
                    title="Interact with contract"
                  >
                    <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </button>
                  
                  <Link
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
                    href={`https://explorer-testnet.megaethl2.io/address/${contract.address}`}
                    target="_blank"
                    rel="noreferrer"
                    title="View on explorer"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </Link>
                  
                  <button
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
                    onClick={() => onRemoveContract(contract.address)}
                    title="Remove from list"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}