const { cmd } = require('../command');

cmd({
  pattern: "tovideo",
  alias: ["tov", "ptv"],
  react: "🎥",
  desc: "Convert video note to normal video",
  category: "convert",
  filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
  try {
    if (!quoted) return reply("Reply to a *round video note* with .tovideo");
    
    let mime = quoted.mtype || "";
    if (!mime.includes("video") && !mime.includes("ptv")) {
      return reply("That is not a video note. Reply to a round video.");
    }

    reply("*Converting...*");
    let media = await quoted.download();
    await conn.sendMessage(from, { 
      video: media, 
      mimetype: "video/mp4",
      caption: "> Converted by Golden Queen" 
    }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("Error: " + e.message);
  }
});
