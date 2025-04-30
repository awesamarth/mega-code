"use client";

import Image from "next/image";
import Editor from "@monaco-editor/react";
import { use, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Message, useAssistant } from "ai/react";
import {
  http,
  Address,
  Hash,
  TransactionReceipt,
  createPublicClient,
  createWalletClient,
  custom,
  stringify,
  Account,
} from "viem";

import { megaethTestnet } from "viem/chains";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { compile } from "@/sol/compiler";
import { PlayIcon, User } from "lucide-react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { UserSelection } from "./types/types";
import { useTheme } from "next-themes";



export default function Home() {
  const monacoRef = useRef(null);
  const [code, setCode] = useState(`//SPDX-License-Identfier: MIT
pragma solidity ^0.8.26;`);
  const [selection, setSelection] = useState<UserSelection>(UserSelection.AI);
  const [showPanels, setShowPanels] = useState(false);
  const [compiled, setCompiled] = useState(0);
  const [byteCode, setByteCode] = useState("");
  const [abi, setAbi] = useState("");
  const [megaEthOrSolidity, setmegaEthOrSolidity] = useState("megaEth");
  const [route, setRoute] = useState("/doubt/megaEth/api");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [deployed, setDeployed] = useState(0);

  const {address} = useAccount()


  let walletClient: any;
  
  const {theme} = useTheme()



  useEffect(()=>{
    console.log(walletClient)
    
  }, [walletClient])

  const publicClient = createPublicClient({
    chain: megaethTestnet,
    transport: http("https://rpc-testnet.megaEthl2.io"),
  });

  const deployTheContract = async () => {
    setDeployed(1);
    console.log(walletClient)
    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.deployContract({
      abi: JSON.parse(abi),
      account: account, // Fix: Cast account to Account type
      args: [],
      bytecode: `0x${byteCode}`, // Fix: Assign byteCode as a string
    });

    if (hash) {
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setReceipt(receipt);
    }

    setDeployed(2);
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
    status: codegenStatus,
    messages: codegenMessages,
    input: codegenInput,
    submitMessage: submitCodegen,
    setInput: setCodegenInput,
    handleInputChange: handleCodegenInputChange,
  } = useAssistant({ api: "/generator/api/" });

  const compileSourceCode = (event: React.MouseEvent<HTMLButtonElement>) => {
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
        console.log("successfully compiled");
      });
  };

  useEffect(() => {
    // console.log(codegenMessages);
    if (
      codegenMessages &&
      codegenMessages[codegenMessages.length - 1]?.role == "assistant"
    ) {
      setCode(codegenMessages[codegenMessages.length - 1]?.content);
    }
  }, [codegenMessages]);

  const generateContract = async () => {
    console.log(walletClient)
    setShowPanels(true);
    setCode("// generating...");
    setCodegenInput("write the code for " + codegenInput);
    submitCodegen();

    // console.log(codegenMessages);
  };

  const askDoubt = async () => {
    if (megaEthOrSolidity == "megaEth") {
      // console.log("megaEth")
      megaEthSubmitDoubt()
    } else {
      // console.log("solidity")
      soliditySubmitDoubt()
      
    }

  };

  // useEffect(() => {
  //   console.log(code);
  // }, [code]);

  function handleEditorWillMount(monaco: any) {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    // here is another way to get monaco instance
    // you can also store it in `useRef` for further usage
    monacoRef.current = monaco;
  }

  function manualStart() {
    setShowPanels(true);
  }

  useEffect(()=>{
    
  }, [megaEthOrSolidity])

  // useEffect(() => {
  //   console.log(megaEthDoubtInput)
  // },[megaEthDoubtInput])
  // useEffect(() => {
  //   console.log(selection);
  // }, [selection]);

  return (
<div suppressHydrationWarning className="bg-[#e7e2e2] dark:bg-[#141414] min-h-screen">
<Navbar />
      <Sidebar selection={selection} setSelection={setSelection} />
  
      <div className="flex h-[100vh] pl-20 pt-14">
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
                  {selection == UserSelection.AI && "AI Assistant"}
                  {selection == UserSelection.Compile && "Compile Contract"}
                  {selection == UserSelection.Deploy && "Deploy Contract"}
                  {selection == UserSelection.Settings && "Settings"}
                </div>
                
                <div className="w-full">
                  {selection == UserSelection.AI && (
                    <div className="flex flex-col gap-6 items-center w-full">
                      <div className="flex flex-col gap-3 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50">
                        <form
                          onSubmit={submitCodegen}
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
                      
                      <div className="flex flex-col gap-3 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-3 border border-gray-300/50 dark:border-gray-700/50">
                        <label className="self-start text-sm font-medium">Ask doubts</label>
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
                        <div className="flex flex-col gap-2 items-center w-full">
                          <textarea
                            value={megaEthOrSolidity=="megaEth"?megaEthDoubtInput:solidityDoubtInput}
                            onChange={megaEthOrSolidity=="megaEth"?megaEthHandleDoubtInputChange:solidityHandleDoubtInputChange}
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
  
                        <div className="w-full max-h-[400px] overflow-y-auto mt-2 space-y-3">
                          {megaEthOrSolidity=="megaEth"?
                          megaEthDoubtMessages.map((m: Message) => (
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
                          )):
                          solidityDoubtMessages.map((m: Message) => (
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
                          ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
  
                  {selection == UserSelection.Compile && (
                    <div className="flex flex-col gap-3 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-4 border border-gray-300/50 dark:border-gray-700/50">
                      <div className="text-sm font-medium mb-2">Compile your smart contract to generate bytecode and ABI</div>
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
                  )}
  
                  {selection == UserSelection.Deploy && (
                    <div className="flex flex-col gap-3 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-4 border border-gray-300/50 dark:border-gray-700/50">
                      <div className="text-sm font-medium mb-2">Deploy your compiled contract to MegaETH testnet</div>
                      <button
                        className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 h-12 w-full px-4 py-2 rounded-md text-white
                          transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                        onClick={deployTheContract}
                      >
                        {deployed === 1 ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deploying...
                          </>
                        ) : "Deploy"}
                      </button>
                      
                      {deployed === 2 && (
                        <div className="mt-2 w-full">
                          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-md mb-3 text-center">
                            <strong className="font-bold">Success!</strong>
                            <span className="block sm:inline"> Your contract has been deployed successfully.</span>
                          </div>
                          
                          {receipt && (
                            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-3 text-center">
                              <div className="text-sm mb-2">Contract deployed at:</div>
                              <Link
                                className="text-gray-800 dark:text-gray-200 underline break-all text-xs font-mono"
                                rel="noreferrer noopener"
                                target="_blank"
                                href={`https://explorer-testnet.megaethl2.io/address/${receipt.contractAddress}`}
                              >
                                {receipt.contractAddress}
                              </Link>
                              <div className="mt-2">
                                <Link
                                  className="inline-flex items-center text-sm text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors duration-200"
                                  rel="noreferrer noopener"
                                  target="_blank"
                                  href={`https://explorer-testnet.megaethl2.io/address/${receipt.contractAddress}`}
                                >
                                  View on Explorer
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
  
                  {selection == UserSelection.Settings && (
                    <div className="flex flex-col gap-3 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-4 border border-gray-300/50 dark:border-gray-700/50">
                      <div className="text-sm font-medium mb-2">Configure your IDE settings</div>
                      <div className="w-full">
                        <label className="block text-sm font-medium mb-1">
                          OpenAI API Key
                        </label>
                        <input
                          type="password"
                          value={"apiKey"}
                          // onChange={(e) => setApiKey(e.target.value)}
                          className="flex rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 
                            w-full text-sm bg-white dark:bg-gray-900 text-black dark:text-white
                            focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400
                            placeholder:text-gray-500"
                          placeholder="sk-xxxxxxx"
                        />
                        <button
                          onClick={() => ("")}
                          className="mt-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 px-4 rounded-md text-white w-full
                            transition-colors duration-200 font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
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
              
              <form className="mb-4" onSubmit={generateContract}>
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