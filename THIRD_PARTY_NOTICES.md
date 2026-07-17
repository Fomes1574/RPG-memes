# Third-party notices

## Gill Heads Mine impulse response

- Source: [OpenAIR — Gill Heads Mine](https://www.openair.hosted.york.ac.uk/?page_id=494)
- Attribution requested by the author: `www.openairlib.net`
- License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
- Local asset: `assets/audio/ir/gill-heads-mine-site2-2way.wav`
- Modification: the official processed mono impulse response was resampled from 96 kHz/24-bit PCM to 48 kHz/16-bit PCM for browser delivery. At runtime it supplies the early reflections of a longer, procedurally generated stereo cave tail; the original local file itself remains otherwise unchanged.

## Signalsmith Stretch Web

- Source: [Signalsmith Stretch](https://github.com/Signalsmith-Audio/signalsmith-stretch)
- Version pinned from commit: `57b93f4e9206a089a45387eaa39bdc9f310d3308`
- License: MIT
- Copyright (c) 2022 Geraint Luff / Signalsmith Audio Ltd.
- Local files: `assets/vendor/signalsmith-stretch/`

The complete MIT license text is retained in `assets/vendor/signalsmith-stretch/LICENSE.txt`.

## vmsg and LAME MP3 encoder

- Wrapper source: [Kagami/vmsg](https://github.com/Kagami/vmsg)
- vmsg commit: `623b2940a37f5a309cd4d13411a0894664131079`
- vmsg license: CC0 1.0 Universal
- MP3 library: [LAME](https://lame.sourceforge.io/) via the `Kagami/lame-svn` submodule
- LAME source commit: `ee68cb2055d5d5ce8e4d2ccfee7941721062546d`
- LAME license: GNU Library General Public License 2.0
- Local files: `assets/vendor/vmsg/`

`vmsg.wasm` is loaded only when the user requests an MP3 download. The application wrapper decodes the in-memory preview, downmixes it locally, sends PCM to the local Web Worker, and downloads the resulting MP3 without uploading the recording.

The complete CC0 and LGPL license texts are retained as `COPYING-CC0.txt` and `COPYING-LGPL-2.0.txt`. The corresponding source code and build instructions are available at the pinned repositories above.
