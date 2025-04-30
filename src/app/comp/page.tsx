'use client'
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { compile } from '@/sol/compiler';

const Home: NextPage = () => {
  const [sourceCode, setSourceCode] = useState("");
  const [byteCode, setByteCode] = useState("");
  const [abi, setAbi] = useState("");
  const [successfullyCompiled, setSuccessfullyCompiled] = useState(false)
  const [compiling, setCompiling] = useState(false)

  const compileSourceCode = (event: React.MouseEvent<HTMLButtonElement>) => {

    const button = event.currentTarget;
    button.disabled = true;
    compile(sourceCode)
      .then(contractData => {
        setSuccessfullyCompiled(() => true);
        const data = contractData[0];
        setByteCode(() => data.byteCode);
        setAbi(() => JSON.stringify(data.abi));
      })
      .catch(err => {
        alert(err);
        console.error(err);
      })
      .finally(() => {
        button.disabled = false;
      });
  };

  return (
    <div className={"text-white"}>
      <Head>
        <title>Frontend Solidity Compiler</title>
        <meta name="description" content="Compile solidity code on frontend with Next.js and Solc-js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={""}>
        <h1 className={""}>
          Solidity Browser Compiler
        </h1>

        <div className={""}>
          <div className={''}>
            <h2>Source Code</h2>
            <textarea rows={20} className='text-black' cols={50} onChange={e => setSourceCode(e.target.value)} />
            <div className={''}>
              <button onClick={compileSourceCode}>Compile</button>
            </div>
          </div>
          <div className={''}>
            <h2>ABI</h2>
            <textarea readOnly rows={10} cols={60} value={abi} />
            <h2 className={''}>Compiled ByteCode</h2>
            <textarea readOnly rows={10} cols={60} value={byteCode} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;