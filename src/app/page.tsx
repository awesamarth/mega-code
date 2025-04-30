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
import { User } from "lucide-react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { UserSelection } from "./types/types";



export default function Home() {
  const monacoRef = useRef(null);
  const [code, setCode] = useState(`//SPDX-License-Identfier: MIT
pragma solidity ^0.8.19;`);
  const [selection, setSelection] = useState<UserSelection>(UserSelection.AI);
  const [showPanels, setShowPanels] = useState(false);
  const [compiled, setCompiled] = useState(0);
  const [byteCode, setByteCode] = useState("");
  const [abi, setAbi] = useState("");
  const [morphOrSolidity, setMorphOrSolidity] = useState("Morph");
  const [route, setRoute] = useState("/doubt/morph/api");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [deployed, setDeployed] = useState(0);

  const {address} = useAccount()


  let walletClient: any;
  



  useEffect(()=>{
    console.log(walletClient)
    
  }, [walletClient])

  const publicClient = createPublicClient({
    chain: megaethTestnet,
    transport: http("https://rpc-testnet.morphl2.io"),
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
    status: morphDoubtStatus,
    messages: morphDoubtMessages,
    input: morphDoubtInput,
    submitMessage: morphSubmitDoubt,
    handleInputChange: morphHandleDoubtInputChange,
  } = useAssistant({ api: "/doubt/morph/api" });

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
    if (morphOrSolidity == "Morph") {
      // console.log("Morph")
      morphSubmitDoubt()
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
    
  }, [morphOrSolidity])

  // useEffect(() => {
  //   console.log(morphDoubtInput)
  // },[morphDoubtInput])
  // useEffect(() => {
  //   console.log(selection);
  // }, [selection]);

  return (
    <div suppressHydrationWarning>
      <Navbar />
      <Sidebar selection={selection} setSelection={setSelection} />

      <div className="flex h-[100vh] pl-14 pt-[3.5rem]">
        {showPanels ? (
          <ResizablePanelGroup
            direction="horizontal"
            className="w-full  rounded-lg"
          >
            <ResizablePanel defaultSize={20} className=" overflow-y-auto!">
              <div className="flex flex-col h-full items-center gap-5 p-6 text-gray-100">
                <span className="font-semibold text-center">
                  {selection == UserSelection.AI && "AI Assistant"}
                  {selection == UserSelection.Compile && "Compile Contract"}
                  {selection == UserSelection.Deploy && "Deploy Contract"}
                  {selection == UserSelection.Settings && "Settings"}
                </span>
                <div>
                  {selection == UserSelection.AI && (
                    <div className="flex flex-col gap-12 items-center">
                      <div className="flex flex-col gap-2 items-center">
                        <form
                          onSubmit={submitCodegen}
                          className="flex flex-col gap-2 items-center"
                        >
                          <label className="self-start text-sm">
                            Generate contract with AI
                          </label>
                          <textarea
                            value={codegenInput}
                            onChange={handleCodegenInputChange}
                            className="flex rounded-md border-slate-200 px-3 py-2 
              text-sm ring-offset-white file:border-0  placeholder:text-slate-500
              disabled:cursor-not-allowed disabled:opacity-50
              !border-r-0 bg-black outline-hidden border-0 rounded-r-none w-60 h-12"
                            placeholder="ERC20 token contract"
                          />
                          <button
                            onClick={generateContract}
                            className="bg-violet-800 py-1 px-2 rounded-md"
                          >
                            Generate
                          </button>
                        </form>
                      </div>
                      <div className="flex flex-col gap-2 items-center">
                        <label className="self-start text-sm">Ask doubts</label>
                        <div className="flex gap-1 self-start">
                          <button
                            onClick={() => setMorphOrSolidity("Morph")}
                            className={`${
                              morphOrSolidity == "Morph"
                                ? "bg-[#00ff98] text-black"
                                : "bg-gray-700"
                            } px-2 py-1 rounded-md `}
                          >
                            Morph
                          </button>
                          <button
                            onClick={() => setMorphOrSolidity("Solidity")}
                            className={`${
                              morphOrSolidity == "Solidity"
                                ? "bg-[#00ff98] text-black"
                                : "bg-gray-700"
                            } px-2 py-1 rounded-md`}
                          >
                            Solidity
                          </button>
                        </div>
                        <div
                          className="flex flex-col gap-2 items-center mb-4"
                        >
                          <textarea
                            value={morphOrSolidity=="Morph"?morphDoubtInput:solidityDoubtInput}
                            onChange={morphOrSolidity=="Morph"?morphHandleDoubtInputChange:solidityHandleDoubtInputChange}
                            className="flex rounded-md border-slate-200 px-3 py-2 
                          text-sm ring-offset-white file:border-0  placeholder:text-slate-500
                          disabled:cursor-not-allowed disabled:opacity-50
                          !border-r-0 bg-black outline-hidden border-0 rounded-r-none w-60 h-12"
                            placeholder={`Ask doubts about ${morphOrSolidity}`}
                          />
                          <button
                            onClick={askDoubt}
                            className="bg-violet-800  py-1 px-2 rounded-md"
                          >
                            Ask
                          </button>
                        </div>

                        {morphOrSolidity=="Morph"?
                        morphDoubtMessages.map((m: Message) => (
                          <div
                            key={m.id}
                            className="whitespace-pre-wrap flex flex-col items-center text-center"
                          >
                            <strong>{`${m.role} `}</strong>
                            {m.role !== "data" && m.content}
                            {m.role === "data" && (
                              <>
                                {/* here you would provide a custom display for your app-specific data:*/}
                                {(m.data as any).description}
                                <br />
                                <pre className={"bg-gray-200"}>
                                  {JSON.stringify(m.data, null, 2)}
                                </pre>
                              </>
                            )}
                            <br />
                            <br />
                          </div>
                        )):
                        solidityDoubtMessages.map((m: Message) => (
                          <div
                            key={m.id}
                            className="whitespace-pre-wrap flex flex-col items-center text-center"
                          >
                            <strong>{`${m.role} `}</strong>
                            {m.role !== "data" && m.content}
                            {m.role === "data" && (
                              <>
                                {/* here you would provide a custom display for your app-specific data:*/}
                                {(m.data as any).description}
                                <br />
                                <pre className={"bg-gray-200"}>
                                  {JSON.stringify(m.data, null, 2)}
                                </pre>
                              </>
                            )}
                            <br />
                            <br />
                          </div>
                        ))
                        
                        }
                      </div>
                    </div>
                  )}

                  {selection == UserSelection.Compile && (
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        className="bg-violet-800 h-12 w-24 px-3 py-1  rounded-md"
                        onClick={compileSourceCode}
                      >
                        Compile
                      </button>
                      {compiled == 1 && "compiling..."}
                      {compiled == 2 && "compiled successfully!"}
                    </div>
                  )}

                  {selection == UserSelection.Deploy && (
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        className="bg-violet-800 h-12 w-24 px-3 py-1  rounded-md"
                        onClick={deployTheContract}
                      >
                        Deploy
                      </button>
                      {deployed == 1 && "deploying..."}
                      {deployed == 2 && "deployed successfully!"}
                      {receipt && (
                        <div>
                          <span>View it </span>

                          <Link
                            className="text-violet-500"
                            rel="noreferrer noopener"
                            target="_blank"
                            href={`https://explorer-testnet.morphl2.io/address/${receipt.contractAddress}`}
                          >
                            here
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {selection == UserSelection.Settings && (
                      <div className="flex flex-col gap-12 items-center">
                      <div className="flex flex-col gap-2 items-center">
                        <div
                          className="flex flex-col gap-2 items-center"
                        >
                          <label className="self-start text-sm">
                            OpenAI key
                          </label>
                          <input
                            value={codegenInput}
                            onChange={handleCodegenInputChange}
                            className="flex rounded-md border-slate-200 px-3 py-2 
              text-sm ring-offset-white file:border-0  placeholder:text-slate-500
              disabled:cursor-not-allowed disabled:opacity-50
              !border-r-0 bg-black outline-hidden border-0 rounded-r-none w-60 h-8"
                            placeholder="sk-xxxxxxx"
                          />
                          <button
                            onClick={generateContract}
                            className="bg-violet-800 py-1 px-2 rounded-md"
                          >
                            Set
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
                <div></div>
              </div>
            </ResizablePanel>
            <ResizableHandle className="bg-slate-600" withHandle />
            <ResizablePanel defaultSize={80} className="bg-[#1e1e1e] pt-5">
              <Editor
                className="text-white"
                height="91vh"
                defaultLanguage="sol"
                defaultValue="//SPDX-License-Identfier: MIT
                pragma solidity ^0.8.19;
                "
                theme="vs-dark"
                value={code}
                loading={<div className="text-white">Loading Editor...</div>}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                onChange={(value, event) => {
                  setCode(value as string);
                }}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className=" w-full h-full gap-4 text-white flex flex-col justify-center items-center">
            <form className="flex" onSubmit={generateContract}>
              <input
                onChange={handleCodegenInputChange}
                value={codegenInput}
                className="flex rounded-md border-slate-200 px-3 py-2 
              text-sm ring-offset-white file:border-0  placeholder:text-slate-500
              disabled:cursor-not-allowed disabled:opacity-50
              !border-r-0 bg-black outline-hidden border-0 rounded-r-none w-[28rem] h-12"
                placeholder="write contracts with AI"
              />
              <button
                type="submit"
                className="bg-[#00ff98] text-black h-12 w-20 rounded-r-md"
              >
                Go!
              </button>
            </form>
            <div>OR</div>
            <button
              onClick={manualStart}
              className="bg-violet-800 h-12 px-3 py-1  rounded-md"
            >
              Start Manually
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
