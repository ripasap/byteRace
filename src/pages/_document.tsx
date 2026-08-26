import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head>
                {/* Load Pyodide from the official CDN */}
                <script src="https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js"></script>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}