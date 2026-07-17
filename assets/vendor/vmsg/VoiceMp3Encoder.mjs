const VMSG_WASM_URL = new URL('./vmsg.wasm', import.meta.url).href;
function mp3WorkerMain() {
    const TOTAL_STACK = 5 * 1024 * 1024;
    const TOTAL_MEMORY = 16 * 1024 * 1024;
    const WASM_PAGE_SIZE = 64 * 1024;
    const MAX_VMSG_SAMPLES = 16384;

    async function instantiateVmsg(url, imports) {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) throw new Error(`Codificador MP3 indisponível (${response.status}).`);

        if (WebAssembly.instantiateStreaming) {
            try {
                return await WebAssembly.instantiateStreaming(response.clone(), imports);
            } catch (error) {
                // Alguns servidores não enviam application/wasm; o ArrayBuffer cobre esse caso.
            }
        }
        return WebAssembly.instantiate(await response.arrayBuffer(), imports);
    }

    self.onmessage = async event => {
        const { wasmUrl, samples, sampleRate } = event.data || {};
        let ffi = null;
        let reference = 0;

        try {
            if (!(samples instanceof Float32Array) || !samples.length) throw new Error('A gravação está vazia.');
            if (!Number.isFinite(sampleRate) || sampleRate < 8000) throw new Error('Taxa de áudio inválida.');

            const memory = new WebAssembly.Memory({
                initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
                maximum: TOTAL_MEMORY / WASM_PAGE_SIZE
            });
            let dynamicTop = TOTAL_STACK;
            let internalExit = null;
            const runtime = {
                memory,
                pow: Math.pow,
                powf: Math.pow,
                exp: Math.exp,
                sqrtf: Math.sqrt,
                cos: Math.cos,
                log: Math.log,
                sin: Math.sin,
                sbrk(increment) {
                    const previous = dynamicTop;
                    dynamicTop += increment;
                    if (dynamicTop > TOTAL_MEMORY) throw new Error('Memória insuficiente para converter o MP3.');
                    return previous;
                },
                exit(status) {
                    internalExit = status;
                }
            };

            const wasm = await instantiateVmsg(wasmUrl, { env: runtime });
            ffi = wasm.instance.exports;
            reference = ffi.vmsg_init(Math.round(sampleRate));
            if (!reference || internalExit !== null) throw new Error('Não foi possível iniciar o codificador MP3.');

            const pcmPointer = new Uint32Array(memory.buffer, reference, 1)[0];
            for (let offset = 0; offset < samples.length; offset += MAX_VMSG_SAMPLES) {
                const chunk = samples.subarray(offset, Math.min(samples.length, offset + MAX_VMSG_SAMPLES));
                new Float32Array(memory.buffer, pcmPointer, chunk.length).set(chunk);
                if (ffi.vmsg_encode(reference, chunk.length) < 0 || internalExit !== null) {
                    throw new Error('Falha ao codificar um trecho do MP3.');
                }
            }

            if (ffi.vmsg_flush(reference) < 0 || internalExit !== null) throw new Error('Falha ao finalizar o MP3.');
            const mp3Pointer = new Uint32Array(memory.buffer, reference + 4, 1)[0];
            const mp3Size = new Uint32Array(memory.buffer, reference + 8, 1)[0];
            const output = new Uint8Array(mp3Size);
            output.set(new Uint8Array(memory.buffer, mp3Pointer, mp3Size));
            ffi.vmsg_free(reference);
            reference = 0;
            self.postMessage({ ok: true, buffer: output.buffer }, [output.buffer]);
        } catch (error) {
            try {
                if (reference && ffi?.vmsg_free) ffi.vmsg_free(reference);
            } catch {}
            self.postMessage({ ok: false, error: error?.message || String(error) });
        }
    };
}

function encodeMonoPcm(samples, sampleRate) {
    const workerSource = `(${mp3WorkerMain.toString()})()`;
    const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'application/javascript' }));
    const worker = new Worker(workerUrl);

    return new Promise((resolve, reject) => {
        const cleanup = () => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };

        worker.onmessage = event => {
            cleanup();
            if (!event.data?.ok) {
                reject(new Error(event.data?.error || 'Não foi possível gerar o MP3.'));
                return;
            }
            resolve(new Blob([event.data.buffer], { type: 'audio/mpeg' }));
        };
        worker.onerror = event => {
            cleanup();
            reject(new Error(event.message || 'O navegador bloqueou o codificador MP3.'));
        };
        worker.postMessage({ wasmUrl: VMSG_WASM_URL, samples, sampleRate }, [samples.buffer]);
    });
}

export async function encodeAudioBlobToMp3(blob) {
    if (!(blob instanceof Blob) || !blob.size) throw new Error('Não há gravação para converter.');
    const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;
    if (!BrowserAudioContext || !window.Worker || !window.WebAssembly) {
        throw new Error('Este navegador não oferece a conversão MP3 local.');
    }

    let context;
    try {
        context = new BrowserAudioContext({ latencyHint: 'playback' });
    } catch {
        context = new BrowserAudioContext();
    }
    try {
        const decoded = await context.decodeAudioData(await blob.arrayBuffer());
        const mono = new Float32Array(decoded.length);
        for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
            const channelData = decoded.getChannelData(channel);
            const scale = 1 / decoded.numberOfChannels;
            for (let index = 0; index < channelData.length; index++) mono[index] += channelData[index] * scale;
        }
        return await encodeMonoPcm(mono, decoded.sampleRate);
    } finally {
        try { await context.close(); } catch {}
    }
}
