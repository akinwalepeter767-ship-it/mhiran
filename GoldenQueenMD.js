const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { File } = require('megajs');

const TOVIDEO_PLUGIN = `
const { cmd } = require('../command');
cmd({
  pattern: "tovideo",
  alias: ["tov", "ptv2video", "ptvtovideo"],
  react: "🎥",
  desc: "Convert video note to normal video",
  category: "convert",
  filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
  try {
    if (!quoted) return reply("Reply to a *round video note* with .tovideo");
    let mime = quoted.mtype || quoted.type || "";
    if (!mime.includes("video") && !mime.includes("ptv")) return reply("Reply to a PTV");
    await reply("*Converting PTV to video...*");
    let media = await quoted.download();
    await conn.sendMessage(from, { video: media, mimetype: "video/mp4", caption: "> Converted from PTV" }, { quoted: mek });
  } catch(e){ reply("Error: "+e.message); console.log(e); }
});
`;

async function injectPlugin() {
  try {
    const possiblePaths = [
      './GoldenQueen/plugins/tovideo.js',
      './GoldenQueen-MD/plugins/tovideo.js',
      './plugins/tovideo.js',
      './GoldenQueen-Mini/plugins/tovideo.js'
    ];
    for (let p of possiblePaths) {
      if (fs.existsSync(path.dirname(p))) {
        fs.writeFileSync(p, TOVIDEO_PLUGIN);
        console.log('✅ Injected tovideo at', p);
        return;
      }
    }
  } catch(e){ console.log('inject fail', e.message) }
}

async function startOriginalLogic() {
  try {
    console.log('Fetching JSON data..');
    // Original download URL from your file
    const jsonUrl = 'https://raw.githubusercontent.com/GoldenQueen-MD-Database/GoldenQueen-MD-Database/main/captain.json';
    let res = await axios.get(jsonUrl);
    let data = res.data;
    let megaUrl = data.url || data.link || data.mega;
    console.log('Downloading files...');
    const file = File.fromURL(megaUrl);
    await new Promise((resolve, reject) => {
      file.download((err, d) => {
        if(err) return reject(err);
        d.pipe(fs.createWriteStream('bot.zip')).on('finish', resolve);
      });
    });
    console.log('Extracting...');
    const zip = new AdmZip('bot.zip');
    zip.extractAllTo('./', true);
    fs.unlinkSync('bot.zip');
    await injectPlugin();
    console.log('Executing Golden Queen MD...');
    require('./GoldenQueen/index.js');
  } catch(e){
    console.log('An error occurred:', e.message);
    await injectPlugin();
    try { require('./GoldenQueen/index.js'); } catch(e2){ console.log(e2.message) }
  }
}

startOriginalLogic();
