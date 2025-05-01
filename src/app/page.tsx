"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Message, useAssistant } from "ai/react";
import {
  Address,
  TransactionReceipt,
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { megaethTestnet } from "viem/chains";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { compile } from "@/sol/compiler";
import { useAccount } from "wagmi";
import Link from "next/link";
import { UserSelection } from "./types/types";
import { useTheme } from "next-themes";
import { AlertCircle, X } from "lucide-react";

// Import our new component panels
import AIAssistantPanel from "@/components/AIAssistantPanel";
import CompilePanel from "@/components/CompilePanel";
import DeployPanel from "@/components/DeployPanel";
import SettingsPanel from "@/components/SettingsPanel";

interface DeployedContract {
  address: string;
  name: string;
  timestamp: number;
}

export default function Home() {
  const monacoRef = useRef(null);
  const [code, setCode] = useState(`//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;`);
  const [selection, setSelection] = useState<UserSelection>(UserSelection.AI);
  const [showPanels, setShowPanels] = useState(false);
  const [compiled, setCompiled] = useState(0);
  const [byteCode, setByteCode] = useState("");
  const [abi, setAbi] = useState("");
  const [megaEthOrSolidity, setmegaEthOrSolidity] = useState("megaEth");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [deployed, setDeployed] = useState(0);
  const [showWarning, setShowWarning] = useState(true);
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
  
  // AI Model settings
  const [selectedProvider, setSelectedProvider] = useState("Google");
  const [selectedModel, setSelectedModel] = useState("gemini-flash");
  const [apiKey, setApiKey] = useState("");

  const { address } = useAccount();
  const { theme } = useTheme();

  let walletClient;

  useEffect(() => {
    // Load deployed contracts from localStorage on component mount
    const savedContracts = localStorage.getItem('deployedContracts');
    if (savedContracts) {
      setDeployedContracts(JSON.parse(savedContracts));
    }
    
    // Load AI settings from localStorage
    const savedProvider = localStorage.getItem('aiProvider');
    const savedModel = localStorage.getItem('aiModel');
    const savedApiKey = localStorage.getItem('aiApiKey');
    
    if (savedProvider) setSelectedProvider(savedProvider);
    if (savedModel) setSelectedModel(savedModel);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const publicClient = createPublicClient({
    chain: megaethTestnet,
    transport: http(),
  });

  const deployTheContract = async (constructorArgs: string[] = [], value: string = "") => {
    setDeployed(1);
    
    try {

      const [account] = await walletClient.getAddresses();
      
      // Parse the value if provided
      const valueInWei = value ? 
        BigInt(parseFloat(value) * 10**18) : 
        BigInt(0);
        
      // Parse constructor arguments if any
      const parsedArgs = constructorArgs.map(arg => {
        // Basic parsing - in a real app, you'd want more sophisticated parsing
        // based on the argument types in the ABI
        if (arg.startsWith('"') || arg.startsWith("'")) {
          // It's a string
          return arg.slice(1, -1);
        } else if (arg.startsWith('[')) {
          // It's an array
          return JSON.parse(arg);
        } else if (!isNaN(Number(arg))) {
          // It's a number
          return Number(arg);
        } else if (arg.startsWith('0x')) {
          // It's an address or bytes
          return arg;
        }
        return arg;
      });

      const hash = await walletClient!.deployContract({
        abi: JSON.parse(abi),
        account: account,
        args: parsedArgs,
        bytecode: `0x${byteCode}`,
        value: valueInWei
      });

      setHash(hash);

      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        setReceipt(receipt);
        
        // Save this contract to our list
        if (receipt.contractAddress) {
          const newContract = {
            address: receipt.contractAddress,
            name: `Contract ${new Date().toLocaleTimeString()}`,
            timestamp: Date.now()
          };
          
          const updatedContracts = [...deployedContracts, newContract];
          setDeployedContracts(updatedContracts);
          localStorage.setItem('deployedContracts', JSON.stringify(updatedContracts));
        }
      }

      setDeployed(2);
    } catch (error) {
      console.error("Deployment error:", error);
      setDeployed(0);
      alert("Error deploying contract: " + error);
    }
  };

  const removeContract = (address: string) => {
    const updatedContracts = deployedContracts.filter(c => c.address !== address);
    setDeployedContracts(updatedContracts);
    localStorage.setItem('deployedContracts', JSON.stringify(updatedContracts));
  };

  const interactWithContract = (address: string) => {
    // In a future implementation, this would open a modal or interface
    // to interact with the contract at the given address
    alert(`Interaction with contract at ${address} will be implemented soon.`);
  };

  useEffect(() => {
    setCompiled(0);
    setDeployed(0);
  }, [code]);

  const {
    status: megaEthDoubtStatus,
    messages: megaEthDoubtMessages,
    input: megaEthDoubtInput,
    submitMessage: megaEthSubmitDoubt,
    handleInputChange: megaEthHandleDoubtInputChange,
  } = useAssistant({ api: "/doubt/megaEth/api" });

  const {
    status: solidityDoubtStatus,
    messages: solidityDoubtMessages,
    input: solidityDoubtInput,
    submitMessage: soliditySubmitDoubt,
    handleInputChange: solidityHandleDoubtInputChange,
  } = useAssistant({ api: "/doubt/solidity/api" });

  const {
    messages: codegenMessages,
    input: codegenInput,
    submitMessage: submitCodegen,
    setInput: setCodegenInput,
    handleInputChange: handleCodegenInputChange,
  } = useAssistant({ api: "/generator/api/" });

  const compileSourceCode = () => {
    setCompiled(() => 1);
    compile(code)
      .then((contractData) => {
        setCompiled(() => 2);
        const data = contractData[0];
        setByteCode(() => data.byteCode);
        setAbi(() => JSON.stringify(data.abi));
      })
      .catch((err) => {
        setCompiled(() => 0);
        alert(err);
        console.error(err);
      })
      .finally(() => {
        console.log("compilation complete");
      });
  };

  useEffect(() => {
    if (
      codegenMessages &&
      codegenMessages[codegenMessages.length - 1]?.role == "assistant"
    ) {
      setCode(codegenMessages[codegenMessages.length - 1]?.content);
    }
  }, [codegenMessages]);

  const generateContract = async () => {
    setShowPanels(true);
    setCode("// generating...");
    setCodegenInput("write the code for " + codegenInput);
    submitCodegen();
  };

  const askDoubt = async () => {
    if (megaEthOrSolidity == "megaEth") {
      megaEthSubmitDoubt();
    } else {
      soliditySubmitDoubt();
    }
  };

  function handleEditorWillMount(monaco: any) {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    monacoRef.current = monaco;
  }

  function manualStart() {
    setShowPanels(true);
  }

  const saveSettings = () => {
    localStorage.setItem('aiProvider', selectedProvider);
    localStorage.setItem('aiModel', selectedModel);
    localStorage.setItem('aiApiKey', apiKey);
    
    alert("Settings saved successfully!");
    
    // In a production app, you'd integrate with the AI providers here
    // based on the selected model and API key
  };

  return (
    <div suppressHydrationWarning className="bg-[#e7e2e2] dark:bg-[#141414] min-h-screen">
      <Navbar />
      <Sidebar selection={selection} setSelection={setSelection} />
      
      {/* Security Warning Banner */}
      {showWarning && (
        <div className="fixed top-14 left-0 right-0 z-50 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 py-3 px-4 border-b border-red-200 dark:border-red-800 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
            <span>
              <strong>Security Warning:</strong> Generated code may contain vulnerabilities. 
              Do NOT use in production or on mainnet without thorough security audits.
            </span>
          </div>
          <button 
            onClick={() => setShowWarning(false)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
  
      <div className={`flex h-[100vh] pl-20 ${showWarning ? 'pt-24' : 'pt-14'}`}>
        {showPanels ? (
          <ResizablePanelGroup
            direction="horizontal"
            className="w-full"
          >
            <ResizablePanel 
              defaultSize={20} 
              className="overflow-y-auto"
              style={{
                backgroundColor: theme === "light" ? "#f3f0f0" : "#111111",
                borderRight: theme === "light" 
                  ? "1px solid rgba(0, 0, 0, 0.1)" 
                  : "1px solid rgba(255, 255, 255, 0.05)"
              }}
            >
              <div className="flex flex-col h-full items-center gap-4 p-4 text-gray-800 dark:text-gray-200">
                <div className="w-full bg-gray-200/50 dark:bg-gray-800/50 rounded-md py-2 px-3 mb-2 font-medium text-center border border-gray-300/50 dark:border-gray-700/50">
                  {selection === UserSelection.AI && "AI Assistant"}
                  {selection === UserSelection.Compile && "Compile Contract"}
                  {selection === UserSelection.Deploy && "Deploy Contract"}
                  {selection === UserSelection.Settings && "Settings"}
                </div>
                
                <div className="w-full">
                  {selection === UserSelection.AI && (
                    <AIAssistantPanel
                      codegenInput={codegenInput}
                      handleCodegenInputChange={handleCodegenInputChange}
                      generateContract={generateContract}
                      megaEthOrSolidity={megaEthOrSolidity}
                      setmegaEthOrSolidity={setmegaEthOrSolidity}
                      megaEthDoubtInput={megaEthDoubtInput}
                      megaEthHandleDoubtInputChange={megaEthHandleDoubtInputChange}
                      megaEthDoubtMessages={megaEthDoubtMessages}
                      solidityDoubtInput={solidityDoubtInput}
                      solidityHandleDoubtInputChange={solidityHandleDoubtInputChange}
                      solidityDoubtMessages={solidityDoubtMessages}
                      askDoubt={askDoubt}
                    />
                  )}
  
                  {selection === UserSelection.Compile && (
                    <CompilePanel
                      compileSourceCode={compileSourceCode}
                      compiled={compiled}
                    />
                  )}
  
                  {selection === UserSelection.Deploy && (
                    <DeployPanel
                      deployTheContract={deployTheContract}
                      deployed={deployed}
                      receipt={receipt}
                      deployedContracts={deployedContracts}
                      onInteractWithContract={interactWithContract}
                      onRemoveContract={removeContract}
                    />
                  )}
  
                  {selection === UserSelection.Settings && (
                    <SettingsPanel
                      selectedProvider={selectedProvider}
                      selectedModel={selectedModel}
                      onProviderChange={setSelectedProvider}
                      onModelChange={setSelectedModel}
                      apiKey={apiKey}
                      onApiKeyChange={setApiKey}
                      onSaveSettings={saveSettings}
                    />
                  )}
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle className="bg-gray-300 dark:bg-gray-700 group" withHandle>
              <div className="hidden group-hover:block absolute z-10 -ml-12 mt-16 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-300 dark:border-gray-700 text-xs text-center whitespace-nowrap">
                Drag to resize
              </div>
            </ResizableHandle>
            
            <ResizablePanel defaultSize={80} minSize={50}>
              <div className="h-full flex flex-col">
                <div className="bg-gray-200/50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Solidity Editor</span>
                    <div className="ml-2 px-2 py-0.5 bg-gray-300/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 text-xs rounded-full border border-gray-300 dark:border-gray-700">
                      {theme === "light" ? "Light Mode" : "Dark Mode"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-xs px-2 py-1 rounded-md bg-gray-300/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                      }}
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 w-full">
                  <Editor
                    height="100%"
                    defaultLanguage="sol"
                    defaultValue="//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;"
                    theme={theme==="light"?"light":"vs-dark"}
                    value={code}
                    loading={
                      <div className="h-full w-full flex items-center justify-center bg-[#dfd9d9] dark:bg-[#1a1a1a]">
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-gray-800 dark:text-gray-200 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">Loading Editor...</span>
                        </div>
                      </div>
                    }
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    onChange={(value, event) => {
                      setCode(value as string);
                    }}
                    options={{
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: 'on',
                      folding: true,
                      autoIndent: 'full',
                      formatOnPaste: true,
                      padding: { top: 10 }, 
                      formatOnType: true,
                    }}
                    className="border-0 h-full"
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="w-full flex flex-col justify-center items-center">
            <div className="w-full max-w-xl p-8 bg-white dark:bg-gray-900 rounded-md shadow-md border border-gray-300 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">MEGA CODE</h1>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Write, compile and deploy Solidity smart contracts seamlessly
              </p>
              
              <form className="mb-4" onSubmit={(e) => { e.preventDefault(); generateContract(); }}>
                <div className="flex flex-col mb-4">
                  <label className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                    Generate Smart Contract with AI
                  </label>
                  <div className="flex">
                    <input
                      onChange={handleCodegenInputChange}
                      value={codegenInput}
                      className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-700 px-4 py-3
                        bg-white dark:bg-gray-900 text-black dark:text-white
                        focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400
                        placeholder:text-gray-500"
                      placeholder="Describe your smart contract (e.g., 'ERC20 with capped supply')"
                    />
                    <button
                      type="submit"
                      className="rounded-r-md bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium px-6 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Describe the functionality you need and our AI will create a smart contract for you
                  </p>
                </div>
              </form>
              
              <div className="text-center text-gray-500 dark:text-gray-500 my-4">OR</div>
              
              <button
                onClick={manualStart}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-md
                  transition-colors duration-200 font-medium shadow-sm flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Editor Manually
              </button>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-300 dark:border-gray-700">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Fast Deployment</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Deploy directly to MegaETH testnet
                  </p>
                </div>
                
                <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-300 dark:border-gray-700">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">AI-Powered</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Get assistance with Solidity and MegaETH
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}